import { createClient } from "@/lib/supabase/server";
// INTAKES rather than getData's DASHBOARD_INTAKES (same two codes): that module
// builds a browser Supabase client at module scope, which has no business being
// imported into a server module.
import { INTAKES } from "@/lib/intakes";
import type { CheckAnswer } from "@/lib/student-progress";

/**
 * The rows behind the dashboard.
 *
 * Read on the server through the session-aware client — the older dashboard
 * went through getData(), which builds a *browser* Supabase client at module
 * scope and so ran the query with no session attached.
 *
 * Only the columns the dashboard actually plots are selected, to keep the
 * payload that crosses to the client component reasonable.
 */

export type DashboardRow = {
  matric_no: string;
  full_name: string | null;
  status: string | null;
  study_mode: string | null;
  faculty_code: string | null;
  programme_name: string | null;
  intake_code: string;
  sst_id: number | null;
  contacted: CheckAnswer;
  onboarding_checked: CheckAnswer;
  login_checked: CheckAnswer;
  ptptn_checked: CheckAnswer;
  at_risk: boolean | null;
  at_risk_intent: "deciding" | "defer" | "withdraw" | null;
  at_risk_reason: string | null;
  a_payments: {
    payment_mode: string | null;
    ptptn_proof_status: boolean | null;
    updated_at: string | null;
  } | null;
  a_lms_activity: {
    cp_w1: number | null;
    cp_w2: number | null;
    cp_w3: number | null;
    latest_cp: number | null;
    course_visits: number | null;
    last_login_at: string | null;
  } | null;
};

const SELECT = [
  "matric_no",
  "full_name",
  "status",
  "study_mode",
  "faculty_code",
  "programme_name",
  "intake_code",
  "sst_id",
  "contacted",
  "onboarding_checked",
  "login_checked",
  "ptptn_checked",
  "at_risk",
  "at_risk_intent",
  "at_risk_reason",
  "a_payments(payment_mode, ptptn_proof_status, updated_at)",
  "a_lms_activity(cp_w1, cp_w2, cp_w3, latest_cp, course_visits, last_login_at)"
].join(", ");

export async function getDashboardRows(): Promise<DashboardRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("a_students")
    .select(SELECT)
    .in(
      "intake_code",
      INTAKES.map((i) => i.value)
    )
    .order("matric_no", { ascending: true })
    // PostgREST stops at 1000 rows without this, and the two intakes together
    // are past 2000 — every total would silently describe half the cohort.
    .limit(5000);

  if (error) {
    console.log("Dashboard query failed:", error.message);
    return [];
  }

  return (data ?? []) as unknown as DashboardRow[];
}
