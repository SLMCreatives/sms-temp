import { createClient } from "@/lib/supabase/server";
import { DEFAULT_INTAKE, intakeLabel } from "@/lib/intakes";
import { getChecks, type ChecksInput } from "@/lib/student-progress";

/**
 * The numbers behind the home page overview.
 *
 * Read on the server through the session-aware client, so the page shows what
 * the signed-in user is allowed to see rather than whatever the anon key can
 * reach. The funnel is derived with getChecks() — the same helper the student
 * workspace and the header tracker use — so the home page can never quietly
 * disagree with the screens the team actually works in.
 */

type StatRow = ChecksInput & {
  matric_no: string;
  status: string | null;
  faculty_code: string | null;
  study_mode: string | null;
  a_lms_activity: {
    latest_cp: number | null;
    last_login_at: string | null;
  } | null;
};

export type FunnelStage = {
  key: string;
  label: string;
  /** Confirmed done. */
  yes: number;
  /** Asked, and reported not done. */
  no: number;
  /** Nobody has recorded an answer yet. */
  pending: number;
  /** Students the stage applies to — PTPTN only applies to PTPTN payers. */
  total: number;
};

export type Tally = { label: string; count: number };

export type HomeStats = {
  intakeCode: string;
  intakeLabel: string;
  total: number;
  active: number;
  atRisk: number;
  deferred: number;
  withdrawn: number;
  byFaculty: Tally[];
  byStudyMode: Tally[];
  funnel: FunnelStage[];
  /** Students with an a_lms_activity row — the only ones CN figures can speak for. */
  lmsTracked: number;
  neverLoggedIn: number;
  zeroParticipation: number;
  ptptnPayers: number;
  paymentUnrecorded: number;
};

/** Descending by count, so the longest bar is always on top. */
function tally(rows: StatRow[], pick: (r: StatRow) => string | null): Tally[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = pick(r)?.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getHomeStats(
  intakeCode: string = DEFAULT_INTAKE
): Promise<HomeStats | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("a_students")
    .select(
      "matric_no, status, faculty_code, study_mode, contacted, contacted_at, onboarding_checked, login_checked, ptptn_checked, a_payments(payment_mode, ptptn_proof_status, updated_at), a_lms_activity(latest_cp, last_login_at)"
    )
    .eq("intake_code", intakeCode)
    // PostgREST caps a request at 1000 rows by default. The intake is larger
    // than that, so without an explicit limit every number here would silently
    // describe only the first thousand students.
    .limit(5000);

  if (error) {
    console.log("Home stats query failed:", error.message);
    return null;
  }

  const rows = (data ?? []) as unknown as StatRow[];
  if (rows.length === 0) return null;

  const countStatus = (name: string) =>
    rows.filter((r) => r.status === name).length;

  // One getChecks() pass per student, transposed into per-stage totals.
  const stages: FunnelStage[] = getChecks(rows[0]).map((c) => ({
    key: c.key,
    label: c.label,
    yes: 0,
    no: 0,
    pending: 0,
    total: 0
  }));

  let ptptnPayers = 0;
  for (const row of rows) {
    const checks = getChecks(row);
    checks.forEach((check, i) => {
      if (!check.applicable) return;
      const stage = stages[i];
      stage.total += 1;
      if (check.answer === true) stage.yes += 1;
      else if (check.answer === false) stage.no += 1;
      else stage.pending += 1;
    });
    if (checks[3].applicable) ptptnPayers += 1;
  }

  const lms = rows.filter((r) => r.a_lms_activity);

  return {
    intakeCode,
    intakeLabel: intakeLabel(intakeCode),
    total: rows.length,
    active: countStatus("Active"),
    atRisk: countStatus("At Risk"),
    deferred: countStatus("Deferred"),
    withdrawn: countStatus("Withdraw"),
    byFaculty: tally(rows, (r) => r.faculty_code),
    byStudyMode: tally(rows, (r) => r.study_mode),
    funnel: stages,
    lmsTracked: lms.length,
    neverLoggedIn: lms.filter((r) => !r.a_lms_activity?.last_login_at).length,
    zeroParticipation: lms.filter((r) => !r.a_lms_activity?.latest_cp).length,
    ptptnPayers,
    paymentUnrecorded: rows.filter((r) => !r.a_payments?.payment_mode).length
  };
}
