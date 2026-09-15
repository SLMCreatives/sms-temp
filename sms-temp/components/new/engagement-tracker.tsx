"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, Loader2, Search } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { SST_MEMBERS, resolveSstByName, getSstById } from "@/lib/sst-members";
import {
  checkDotClass,
  checkStateLabel,
  getChecks,
  getProgress
} from "@/lib/student-progress";
import { INTAKES, intakeLabel } from "@/lib/intakes";
import { useIntake } from "./intake-context";
import { Input } from "../ui/input";

const supabase = createClient();

type TrackerRow = {
  matric_no: string;
  full_name: string;
  sst_id: number | null;
  contacted: boolean | null;
  onboarding_checked: boolean | null;
  login_checked: boolean | null;
  ptptn_checked: boolean | null;
  a_payments: {
    payment_mode: string | null;
    ptptn_proof_status: boolean | null;
  } | null;
};

const CHECK_LABELS = ["Contacted", "Onboarding", "Zero login", "PTPTN"];

/** Answered / confirmed / reported-no for one check across a set of students. */
function checkTally(rows: TrackerRow[], index: number) {
  let done = 0;
  let yes = 0;
  let no = 0;
  let total = 0;
  for (const r of rows) {
    const c = getChecks(r)[index];
    if (!c.applicable) continue;
    total += 1;
    if (!c.answered) continue;
    done += 1;
    if (c.answer === true) yes += 1;
    else no += 1;
  }
  return { done, total, yes, no };
}

function Bar({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EngagementTracker() {
  const { intake, setIntake } = useIntake();
  const [rows, setRows] = useState<TrackerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    supabase.auth.getUser().then(async ({ data: authData }) => {
      const fullName: string =
        authData.user?.user_metadata?.full_name ?? authData.user?.email ?? "";

      const isSulaiman = fullName.toLowerCase().includes("sulaiman");
      if (!cancelled) setIsAdmin(isSulaiman);

      let q = supabase
        .from("a_students")
        .select(
          "matric_no, full_name, sst_id, contacted, onboarding_checked, login_checked, ptptn_checked, a_payments(payment_mode, ptptn_proof_status)"
        )
        .eq("intake_code", intake);

      if (!isSulaiman) {
        const member = resolveSstByName(fullName);
        if (member) q = q.eq("sst_id", member.id);
      }

      const { data } = await q;
      if (cancelled) return;
      setRows((data as unknown as TrackerRow[]) ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [intake]);

  const overall = useMemo(() => {
    let done = 0;
    let total = 0;
    let complete = 0;
    for (const r of rows) {
      const p = getProgress(r);
      done += p.done;
      total += p.total;
      if (p.complete) complete += 1;
    }
    return { done, total, complete };
  }, [rows]);

  const perCheck = useMemo(
    () => [0, 1, 2, 3].map((i) => checkTally(rows, i)),
    [rows]
  );

  const perMember = useMemo(() => {
    const members = isAdmin
      ? SST_MEMBERS
      : SST_MEMBERS.filter((m) => rows.some((r) => r.sst_id === m.id));
    return members.map((m) => {
      const mine = rows.filter((r) => r.sst_id === m.id);
      return {
        member: m,
        count: mine.length,
        checks: [0, 1, 2, 3].map((i) => checkTally(mine, i))
      };
    });
  }, [rows, isAdmin]);

  /** Students with work outstanding, least-progressed first. */
  const outstanding = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => !getProgress(r).complete)
      .filter(
        (r) =>
          !q ||
          r.full_name?.toLowerCase().includes(q) ||
          r.matric_no?.toLowerCase().includes(q)
      )
      .sort((a, b) => getProgress(a).done - getProgress(b).done);
  }, [rows, query]);

  return (
    <div className="flex max-h-[70vh] flex-col">
      <div className="border-b p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <ListChecks className="h-4 w-4 text-primary" />
            {isAdmin ? "All SST tracker" : "My tracker"}
          </span>
          <select
            value={intake}
            onChange={(e) => setIntake(e.target.value)}
            className="rounded-md border bg-background px-1.5 py-0.5 text-[11px]"
            aria-label="Intake"
          >
            {INTAKES.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {intakeLabel(intake)} · {rows.length} students
        </p>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 p-4 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading checks…
        </p>
      ) : rows.length === 0 ? (
        <p className="p-4 text-xs text-muted-foreground">
          No students in {intakeLabel(intake)}.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Overall ------------------------------------------------- */}
          <div className="space-y-2 border-b p-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground">All checks</span>
              <span className="tabular-nums">
                {overall.done}/{overall.total}
                <span className="ml-1 text-[10px] text-muted-foreground">
                  (
                  {overall.total
                    ? Math.round((overall.done / overall.total) * 100)
                    : 0}
                  %)
                </span>
              </span>
            </div>
            <Bar done={overall.done} total={overall.total} />

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {perCheck.map((t, i) => (
                <div
                  key={CHECK_LABELS[i]}
                  className="rounded-lg bg-muted/50 px-1.5 py-1.5 text-center"
                >
                  <p className="text-sm font-bold tabular-nums leading-none">
                    {t.done}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      /{t.total}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground">
                    {CHECK_LABELS[i]}
                  </p>
                  <p className="mt-0.5 text-[9px] leading-tight tabular-nums">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {t.yes} yes
                    </span>
                    {t.no > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        {" · "}
                        {t.no} no
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground">
              {overall.complete} of {rows.length} students fully checked
            </p>
          </div>

          {/* By SST member ------------------------------------------- */}
          <div className="space-y-2.5 border-b p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              By SST member
            </p>
            {perMember.map(({ member, count, checks }) => {
              const done = checks.reduce((a, c) => a + c.done, 0);
              const total = checks.reduce((a, c) => a + c.total, 0);
              return (
                <div key={member.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{member.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {done}/{total}
                      <span className="ml-1 text-[10px]">
                        ({total ? Math.round((done / total) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <Bar done={done} total={total} />
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    {checks.map((c, i) => (
                      <span key={i} className="tabular-nums">
                        {CHECK_LABELS[i][0]} {c.done}/{c.total}
                      </span>
                    ))}
                    <span className="ml-auto">{count} students</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per student --------------------------------------------- */}
          <div className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Outstanding
              </p>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {outstanding.length}
              </span>
            </div>

            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a student"
                className="h-7 border-0 bg-muted/50 pl-7 text-[11px] shadow-none"
              />
            </div>

            {outstanding.length === 0 ? (
              <p className="py-3 text-center text-[11px] text-muted-foreground">
                Every student is fully checked.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {outstanding.slice(0, 60).map((r) => {
                  const checks = getChecks(r);
                  const owner = getSstById(r.sst_id);
                  return (
                    <li
                      key={r.matric_no}
                      className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/60"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-medium capitalize leading-tight">
                          {r.full_name?.toLowerCase()}
                        </span>
                        <span className="block truncate font-mono text-[9px] text-muted-foreground">
                          {r.matric_no}
                          {isAdmin && owner ? ` · ${owner.name}` : ""}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        {checks.map((c) => (
                          <span
                            key={c.key}
                            title={`${c.label}: ${checkStateLabel(c)}`}
                            className={`h-2 w-2 rounded-full ${checkDotClass(c)}`}
                          />
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {outstanding.length > 60 && (
              <p className="pt-2 text-center text-[10px] text-muted-foreground">
                Showing 60 of {outstanding.length} — use the table to see the
                rest.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
