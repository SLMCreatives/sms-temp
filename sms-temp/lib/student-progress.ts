import { StudentDashboardRow } from "@/lib/types/database";

export type CheckKey = "onboarding" | "login" | "ptptn";

/**
 * The minimum a row needs for the checks to be derived. Lets lightweight
 * queries (the header tracker) reuse this without selecting every column.
 */
export type ChecksInput = {
  onboarding_checked?: boolean | null;
  onboarding_checked_at?: string | null;
  login_checked?: boolean | null;
  login_checked_at?: string | null;
  a_payments?: {
    payment_mode?: string | null;
    ptptn_proof_status?: boolean | null;
    updated_at?: string | null;
  } | null;
};

export type StudentCheck = {
  key: CheckKey;
  label: string;
  /** What a tick means, shown under the label. */
  checkedHint: string;
  /** What leaving it empty means. */
  uncheckedHint: string;
  checked: boolean;
  /** PTPTN only applies to students paying by PTPTN. */
  applicable: boolean;
  /** Sequence gating — a step opens only once the one before it is ticked. */
  unlocked: boolean;
  checkedAt: string | null;
};

export const STATUS_VALUES = [
  "Active",
  "At Risk",
  "Deferred",
  "Withdraw"
] as const;
export type StudentStatus = (typeof STATUS_VALUES)[number];

export type AtRiskIntent = "deciding" | "defer" | "withdraw";

export const AT_RISK_INTENTS: {
  value: AtRiskIntent;
  label: string;
  status: StudentStatus;
}[] = [
  { value: "deciding", label: "Still deciding", status: "At Risk" },
  { value: "defer", label: "Intends to defer", status: "Deferred" },
  { value: "withdraw", label: "Intends to withdraw", status: "Withdraw" }
];

function isPtptn(student: ChecksInput) {
  return (student.a_payments?.payment_mode ?? "")
    .toUpperCase()
    .includes("PTPTN");
}

/**
 * The three checks in order. Each step unlocks only once the previous one is
 * ticked, so the team always works the same sequence.
 */
export function getChecks(student: ChecksInput): StudentCheck[] {
  const onboarding = !!student.onboarding_checked;
  const login = !!student.login_checked;
  const ptptnApplies = isPtptn(student);

  return [
    {
      key: "onboarding",
      label: "Onboarding check",
      checkedHint: "Responded / joined the onboarding session",
      uncheckedHint: "No response yet",
      checked: onboarding,
      applicable: true,
      unlocked: true,
      checkedAt: student.onboarding_checked_at ?? null
    },
    {
      key: "login",
      label: "Zero login check",
      checkedHint: "CN login confirmed — all okay",
      uncheckedHint: "No response on CN login",
      checked: login,
      applicable: true,
      unlocked: onboarding,
      checkedAt: student.login_checked_at ?? null
    },
    {
      key: "ptptn",
      label: "PTPTN application",
      checkedHint: "Applied and submitted proof",
      uncheckedHint: "Not applied yet",
      checked: !!student.a_payments?.ptptn_proof_status,
      applicable: ptptnApplies,
      unlocked: onboarding && login,
      checkedAt: ptptnApplies ? (student.a_payments?.updated_at ?? null) : null
    }
  ];
}

export type Progress = {
  done: number;
  total: number;
  complete: boolean;
  /** The step the team should work next, or null when nothing is outstanding. */
  next: StudentCheck | null;
};

export function getProgress(student: ChecksInput): Progress {
  const applicable = getChecks(student).filter((c) => c.applicable);
  const done = applicable.filter((c) => c.checked).length;
  const next = applicable.find((c) => !c.checked) ?? null;
  return {
    done,
    total: applicable.length,
    complete: done === applicable.length,
    next
  };
}

/**
 * The status the at-risk section implies. Nothing writes this automatically —
 * the panel shows it and a person applies it, so a manual correction is never
 * silently overwritten.
 */
export function suggestStatus(student: StudentDashboardRow): {
  status: StudentStatus;
  reason: string;
} {
  if (student.at_risk) {
    const intent = AT_RISK_INTENTS.find(
      (i) => i.value === student.at_risk_intent
    );
    if (intent) {
      return {
        status: intent.status,
        reason: `Flagged at risk — ${intent.label.toLowerCase()}`
      };
    }
    return { status: "At Risk", reason: "Flagged at risk" };
  }
  return { status: "Active", reason: "Not flagged at risk" };
}

/** True when the suggestion differs from what is stored on the student. */
export function statusNeedsAttention(student: StudentDashboardRow) {
  return suggestStatus(student).status !== student.status;
}
