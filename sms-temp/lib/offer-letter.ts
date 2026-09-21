import { StudentDashboardRow } from "@/lib/types/database";

/**
 * Offer letter acceptance, read from a_payments.ol_accepted.
 *
 * The column is a nullable boolean and all three states are already in the
 * data, so they are kept apart everywhere:
 *   null  -> not recorded yet
 *   true  -> accepted
 *   false -> confirmed not accepted
 */
export type OfferLetterAnswer = boolean | null;

export const OFFER_LETTER_LABEL = "Offer letter";

export function getOfferLetter(
  student: StudentDashboardRow
): OfferLetterAnswer {
  return student.a_payments?.ol_accepted ?? null;
}

export interface OfferLetterState {
  answer: OfferLetterAnswer;
  /** Short word for badges and tooltips. */
  label: string;
  /** Sentence for the card row. */
  hint: string;
  /** Tint for a bordered row. */
  rowClass: string;
  iconClass: string;
  /** Tint for a standalone pill or dot. */
  badgeClass: string;
  dotClass: string;
}

export function offerLetterState(answer: OfferLetterAnswer): OfferLetterState {
  if (answer === true) {
    return {
      answer,
      label: "Accepted",
      hint: "Student has accepted their offer letter",
      rowClass:
        "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30",
      iconClass: "text-emerald-600 dark:text-emerald-400",
      badgeClass:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      dotClass: "bg-emerald-500"
    };
  }
  if (answer === false) {
    return {
      answer,
      label: "Not accepted",
      hint: "Student has not accepted their offer letter",
      rowClass:
        "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30",
      iconClass: "text-red-600 dark:text-red-400",
      badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300",
      dotClass: "bg-red-500"
    };
  }
  return {
    answer,
    label: "Not recorded",
    hint: "Offer letter acceptance has not been recorded",
    rowClass: "border-dashed",
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground/30"
  };
}
