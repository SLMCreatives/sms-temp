import type { StudentDashboardRow } from "@/lib/types/database";

export type CheckKey = "contacted" | "onboarding" | "login" | "ptptn";

/**
 * Each check has three states rather than two, so "we have not asked yet" is
 * distinct from "we asked and they have not done it".
 *   null  -> not actioned yet (outstanding work)
 *   true  -> confirmed done
 *   false -> reported not done
 */
export type CheckAnswer = boolean | null;

/**
 * The minimum a row needs for the checks to be derived. Lets lightweight
 * queries (the header tracker) reuse this without selecting every column.
 */
export type ChecksInput = {
  contacted?: CheckAnswer;
  contacted_at?: string | null;
  onboarding_checked?: CheckAnswer;
  onboarding_checked_at?: string | null;
  login_checked?: CheckAnswer;
  login_checked_at?: string | null;
  ptptn_checked?: CheckAnswer;
  ptptn_checked_at?: string | null;
  a_payments?: {
    payment_mode?: string | null;
    ptptn_proof_status?: boolean | null;
    updated_at?: string | null;
  } | null;
};

export type StudentCheck = {
  key: CheckKey;
  label: string;
  /** Wording for each of the three states. */
  yesHint: string;
  noHint: string;
  pendingHint: string;
  /** What the "reported not done" button says. */
  noLabel: string;
  /**
   * False for "contacted", where a negative state is meaningless — not having
   * reached the student is simply the absence of a tick.
   */
  canDecline: boolean;
  answer: CheckAnswer;
  /** True once someone has recorded an answer either way. */
  answered: boolean;
  /** PTPTN only applies to students paying by PTPTN. */
  applicable: boolean;
  /** Sequence gating — a step opens once the one before it has an answer. */
  unlocked: boolean;
  answeredAt: string | null;
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

/** Normalises undefined (column not selected) to null. */
function answerOf(value: CheckAnswer | undefined): CheckAnswer {
  return value === undefined ? null : value;
}

/**
 * The four checks in order: contacted -> onboarding -> zero login -> PTPTN.
 *
 * A step unlocks once the previous one has an answer — including a negative
 * one, so reporting "did not join" moves the student along instead of blocking
 * the rest of the sequence.
 */
export function getChecks(student: ChecksInput): StudentCheck[] {
  const contacted = answerOf(student.contacted);
  // Until the migration adds the column the value is undefined rather than
  // null. Don't gate the rest of the sequence on a column that isn't there yet.
  const contactGate = student.contacted === undefined || contacted === true;
  const onboarding = answerOf(student.onboarding_checked);
  const login = answerOf(student.login_checked);

  // Fall back to the payments row so proof recorded outside this flow still
  // reads as a confirmed PTPTN check.
  const ptptn =
    answerOf(student.ptptn_checked) ??
    (student.a_payments?.ptptn_proof_status === true ? true : null);

  const ptptnApplies = isPtptn(student);

  return [
    {
      key: "contacted",
      label: "Contacted",
      yesHint: "Reached out to the student",
      noHint: "",
      pendingHint: "Not contacted yet",
      noLabel: "",
      canDecline: false,
      answer: contacted,
      answered: contacted === true,
      applicable: true,
      unlocked: true,
      answeredAt: student.contacted_at ?? null
    },
    {
      key: "onboarding",
      label: "Onboarding check",
      yesHint: "Responded / joined the onboarding session",
      noHint: "Did not respond / did not join",
      pendingHint: "Awaiting a response",
      noLabel: "No response",
      canDecline: true,
      answer: onboarding,
      answered: onboarding !== null,
      applicable: true,
      unlocked: contactGate,
      answeredAt: student.onboarding_checked_at ?? null
    },
    {
      key: "login",
      label: "Zero login check",
      yesHint: "CN login confirmed — all okay",
      noHint: "Has not logged in to CN yet",
      pendingHint: "Not actioned yet",
      noLabel: "No CN login",
      canDecline: true,
      answer: login,
      answered: login !== null,
      applicable: true,
      unlocked: contactGate && onboarding !== null,
      answeredAt: student.login_checked_at ?? null
    },
    {
      key: "ptptn",
      label: "PTPTN application",
      yesHint: "Applied and submitted proof",
      noHint: "Has not applied for PTPTN yet",
      pendingHint: "Not actioned yet",
      noLabel: "Not applied",
      canDecline: true,
      answer: ptptn,
      answered: ptptn !== null,
      applicable: ptptnApplies,
      unlocked: contactGate && onboarding !== null && login !== null,
      answeredAt:
        student.ptptn_checked_at ??
        (ptptnApplies ? (student.a_payments?.updated_at ?? null) : null)
    }
  ];
}

export type Progress = {
  /** Checks that have an answer either way — this is the work completed. */
  done: number;
  total: number;
  /** Of the answered ones, how many came back positive. */
  positive: number;
  /** How many were reported as not done. */
  declined: number;
  complete: boolean;
  /** The step the team should work next, or null when nothing is outstanding. */
  next: StudentCheck | null;
};

export function getProgress(student: ChecksInput): Progress {
  const applicable = getChecks(student).filter((c) => c.applicable);
  const done = applicable.filter((c) => c.answered).length;
  const positive = applicable.filter((c) => c.answer === true).length;
  const declined = applicable.filter((c) => c.answer === false).length;
  const next = applicable.find((c) => !c.answered) ?? null;
  return {
    done,
    total: applicable.length,
    positive,
    declined,
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

/** Colour for the three-state dot used in the table and the tracker. */
export function checkDotClass(check: StudentCheck) {
  if (!check.applicable) return "bg-muted-foreground/20";
  if (check.answer === true) return "bg-emerald-500";
  if (check.answer === false) return "bg-red-500";
  return check.unlocked ? "bg-amber-400" : "bg-muted-foreground/30";
}

/** Short state word for tooltips. */
export function checkStateLabel(check: StudentCheck) {
  if (!check.applicable) return "not applicable";
  if (check.key === "contacted") {
    return check.answer === true ? "contacted" : "not contacted yet";
  }
  if (check.answer === true) return "confirmed";
  if (check.answer === false) return check.noLabel.toLowerCase();
  return check.unlocked ? "pending" : "locked";
}

/**
 * Named slices of the check sequence, shared by the desktop stat tiles, the
 * table's column filter and the mobile board — so the three can never drift
 * apart on what "zero login" means.
 */
export type SegmentKey = "contacted" | "onboarding" | "login" | "ptptn";

export const CHECK_SEGMENTS: {
  value: SegmentKey;
  label: string;
  /** Position in the sequence returned by getChecks(). */
  index: number;
}[] = [
  { value: "contacted", label: "Not contacted", index: 0 },
  { value: "onboarding", label: "Onboarding", index: 1 },
  { value: "login", label: "Zero login", index: 2 },
  { value: "ptptn", label: "PTPTN", index: 3 }
];

/**
 * True when this student is the next candidate for that step: the step applies,
 * everything before it has an answer, and this one does not.
 */
export function isSegmentPending(
  student: ChecksInput,
  segment: SegmentKey
): boolean {
  const checks = getChecks(student);
  const meta = CHECK_SEGMENTS.find((s) => s.value === segment);
  if (!meta) return false;

  const check = checks[meta.index];
  if (!check.applicable || check.answered) return false;

  // Every earlier applicable step must already be answered.
  return checks
    .slice(0, meta.index)
    .every((c) => !c.applicable || c.answered);
}
