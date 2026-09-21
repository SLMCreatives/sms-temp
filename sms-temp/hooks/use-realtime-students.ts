"use client";

import * as React from "react";

import { fetchStudents } from "@/app/student/getData";
import { createClient } from "@/lib/supabase/client";
import { StudentDashboardRow, Student } from "@/lib/types/database";

/**
 * Every table the students workspace reads. A change in any of them can alter
 * what a row on the page says, so all four are watched.
 */
const WATCHED_TABLES = [
  "a_students",
  "a_payments",
  "a_lms_activity",
  "a_engagements"
] as const;

/**
 * Realtime bursts: assigning an SST to twenty students fires twenty events.
 * Wait this long after the last one before re-reading, so the burst costs one
 * query instead of twenty.
 */
const REFETCH_DEBOUNCE_MS = 400;

export type ConnectionState = "connecting" | "live" | "offline";

/**
 * Keeps the students list in step with the database while the page is open.
 *
 * Seeded from the server render, then maintained two ways:
 *
 *   - an UPDATE on a_students is applied straight to the matching row, so a
 *     check someone ticks shows up immediately with no round trip;
 *   - every event also schedules a debounced re-read, which is what picks up
 *     new students, deleted engagements and the embedded payment / LMS /
 *     engagement rows that the realtime payload does not carry.
 *
 * The patch is for latency, the re-read is for correctness — the re-read is
 * always the value that survives.
 */
export function useRealtimeStudents(initialData: StudentDashboardRow[]) {
  const [data, setData] = React.useState(initialData);
  const [connection, setConnection] =
    React.useState<ConnectionState>("connecting");

  // A new server render (router.refresh(), or navigating back to the page) is
  // a fresher read than anything realtime has patched in, so it wins. The prop
  // identity only changes on an actual re-render from the server.
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Responses can land out of order. Only the newest request may set state.
  const latestRequest = React.useRef(0);
  const mounted = React.useRef(true);

  const refetch = React.useCallback(async () => {
    const request = ++latestRequest.current;
    try {
      const rows = await fetchStudents();
      if (!mounted.current || request !== latestRequest.current) return;
      setData(rows);
    } catch (error) {
      // Keep whatever is on screen; the next event (or the reconnect below)
      // will try again.
      console.log(
        "Realtime refetch failed:",
        error instanceof Error ? error.message : error
      );
    }
  }, []);

  const scheduleRefetch = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      void refetch();
    }, REFETCH_DEBOUNCE_MS);
  }, [refetch]);

  React.useEffect(() => {
    mounted.current = true;
    const supabase = createClient();
    const channel = supabase.channel("students-workspace");

    for (const table of WATCHED_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          if (table === "a_students" && payload.eventType === "UPDATE") {
            const changed = payload.new as Student;
            setData((prev) =>
              prev.map((row) =>
                row.matric_no === changed.matric_no
                  ? // The payload has the a_students columns only, so spreading
                    // it over the row leaves the embedded a_payments /
                    // a_lms_activity / a_engagements arrays intact.
                    { ...row, ...changed }
                  : row
              )
            );
          }
          scheduleRefetch();
        }
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setConnection("live");
        // Anything that changed between the server render and this moment was
        // missed, and so was anything that happened while a dropped socket was
        // reconnecting. Re-read once on every (re)subscribe.
        void refetch();
        return;
      }
      if (
        status === "CHANNEL_ERROR" ||
        status === "TIMED_OUT" ||
        status === "CLOSED"
      ) {
        setConnection("offline");
      }
    });

    // A backgrounded tab can have its socket dropped without an error we see.
    const onVisible = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", onVisible);
      if (timer.current) clearTimeout(timer.current);
      void supabase.removeChannel(channel);
    };
  }, [refetch, scheduleRefetch]);

  return { data, connection };
}
