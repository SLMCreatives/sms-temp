"use client";

import * as React from "react";

import { fetchStudents } from "@/app/student/getData";
import { createClient } from "@/lib/supabase/client";
import {
  Engagement,
  LMSActivity,
  Payment,
  Student,
  StudentDashboardRow
} from "@/lib/types/database";

/**
 * Re-reading everything costs 2.6 MB and about five seconds, and concurrent
 * copies of it hit the Postgres statement timeout (57014) — which surfaced as
 * the page going blank, because getData() turns that failure into an empty
 * list.
 *
 * So a re-read is now the exception, not the rule. Realtime payloads carry the
 * complete new row, so almost every event is applied straight to the student it
 * belongs to and costs no query at all. Only a change to which students exist,
 * or a payload we cannot place, falls back to reading again.
 */
const REFETCH_DEBOUNCE_MS = 1000;

export type ConnectionState = "connecting" | "live" | "offline";

/** Keeps the embedded order getData() asks for: the table reads .at(-1). */
function byCreatedAt(a: Engagement, b: Engagement) {
  return (a.created_at ?? "").localeCompare(b.created_at ?? "");
}

export function useRealtimeStudents(initialData: StudentDashboardRow[]) {
  const [data, setData] = React.useState(initialData);
  const [connection, setConnection] =
    React.useState<ConnectionState>("connecting");

  // A new server render is normally the freshest read there is, so it wins.
  // The exception is an empty one: the page is force-dynamic and getData()
  // swallows a failed read into [], so an empty payload means "the query
  // broke", not "the roster is empty". Never let that wipe a good list.
  React.useEffect(() => {
    setData((prev) =>
      initialData.length === 0 && prev.length > 0 ? prev : initialData
    );
  }, [initialData]);

  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = React.useRef(false);
  const latestRequest = React.useRef(0);
  const mounted = React.useRef(true);
  const connectionRef = React.useRef<ConnectionState>("connecting");
  const everSubscribed = React.useRef(false);
  // Lets scheduleRefetch and runRefetch call each other without either one
  // depending on the other's identity.
  const runRef = React.useRef<() => void>(() => {});

  const setConnectionState = React.useCallback((next: ConnectionState) => {
    connectionRef.current = next;
    setConnection(next);
  }, []);

  const scheduleRefetch = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      runRef.current();
    }, REFETCH_DEBOUNCE_MS);
  }, []);

  const runRefetch = React.useCallback(async () => {
    // Never run two of these at once — that is exactly what times out.
    // Anything arriving mid-flight is folded into one more pass at the end.
    if (inFlight.current) {
      scheduleRefetch();
      return;
    }
    inFlight.current = true;
    const request = ++latestRequest.current;
    try {
      const rows = await fetchStudents();
      if (!mounted.current || request !== latestRequest.current) return;
      setData(rows);
    } catch (error) {
      // Keep what is on screen. A timeout here must not empty the page.
      console.log(
        "Realtime refetch failed:",
        error instanceof Error ? error.message : error
      );
    } finally {
      inFlight.current = false;
    }
  }, [scheduleRefetch]);

  React.useEffect(() => {
    runRef.current = () => void runRefetch();
  }, [runRefetch]);

  /** Applies a change to one student's embedded rows, with no query. */
  const patchStudent = React.useCallback(
    (
      matric: string,
      change: (row: StudentDashboardRow) => StudentDashboardRow
    ) => {
      setData((prev) =>
        prev.map((row) => (row.matric_no === matric ? change(row) : row))
      );
    },
    []
  );

  React.useEffect(() => {
    mounted.current = true;
    const supabase = createClient();
    const channel = supabase.channel("students-workspace");

    // a_students -----------------------------------------------------------
    // An UPDATE carries every column of the student and nothing else, so the
    // embedded arrays already on the row survive the spread.
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "a_students" },
      (payload) => {
        const next = payload.new as Student;
        if (!next?.matric_no) return;
        patchStudent(next.matric_no, (row) => ({ ...row, ...next }));
      }
    );
    // Who is on the roster changed — that genuinely needs reading again.
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "a_students" },
      () => scheduleRefetch()
    );
    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "a_students" },
      () => scheduleRefetch()
    );

    // a_engagements --------------------------------------------------------
    // Many rows per student, so splice the one row rather than re-reading all
    // of them. This is the hot path: every check answered writes here.
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "a_engagements" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          // Default replica identity sends the primary key, which is enough —
          // but not matric_no, so find the holder by engagement id.
          const goneId = (payload.old as { id?: string })?.id;
          if (!goneId) {
            scheduleRefetch();
            return;
          }
          setData((prev) =>
            prev.map((row) =>
              row.a_engagements?.some((e) => e.id === goneId)
                ? {
                    ...row,
                    a_engagements: row.a_engagements.filter(
                      (e) => e.id !== goneId
                    )
                  }
                : row
            )
          );
          return;
        }

        const next = payload.new as Engagement;
        if (!next?.matric_no) {
          scheduleRefetch();
          return;
        }
        patchStudent(next.matric_no, (row) => ({
          ...row,
          a_engagements: [
            ...(row.a_engagements ?? []).filter((e) => e.id !== next.id),
            next
          ].sort(byCreatedAt)
        }));
      }
    );

    // a_payments / a_lms_activity -----------------------------------------
    // One row per student, so the payload simply replaces what is embedded.
    const oneToOne = ["a_payments", "a_lms_activity"] as const;
    for (const table of oneToOne) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          // A delete sends only the primary key, and for a_payments that is
          // `id` — not enough to say whose row it was. Rare enough to re-read.
          if (payload.eventType === "DELETE") {
            scheduleRefetch();
            return;
          }
          const next = payload.new as Partial<Payment & LMSActivity> & {
            matric_no?: string;
          };
          if (!next?.matric_no) {
            scheduleRefetch();
            return;
          }
          patchStudent(next.matric_no, (row) => ({ ...row, [table]: next }));
        }
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setConnectionState("live");
        // The server render that seeded this hook is already current, so the
        // first subscribe has nothing to catch up on. Only a RE-subscribe,
        // after a dropped socket, can have missed events.
        if (everSubscribed.current) scheduleRefetch();
        everSubscribed.current = true;
        return;
      }
      if (
        status === "CHANNEL_ERROR" ||
        status === "TIMED_OUT" ||
        status === "CLOSED"
      ) {
        setConnectionState("offline");
      }
    });

    // Returning to a backgrounded tab only needs a re-read if the socket
    // actually dropped — while it is live, no events were missed.
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        connectionRef.current !== "live"
      ) {
        scheduleRefetch();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", onVisible);
      if (timer.current) clearTimeout(timer.current);
      void supabase.removeChannel(channel);
    };
  }, [patchStudent, scheduleRefetch, setConnectionState]);

  return { data, connection };
}
