"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, FileSignature, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { StudentDashboardRow } from "@/lib/types/database";
import {
  OFFER_LETTER_LABEL,
  offerLetterState,
  OfferLetterAnswer
} from "@/lib/offer-letter";

/**
 * Shows whether the student has accepted their offer letter, and lets the team
 * record it.
 *
 * Three states rather than an on/off switch, because a_payments.ol_accepted is
 * already nullable and most rows are still null: collapsing null into "not
 * accepted" would report thousands of students as having declined when nobody
 * has asked them yet. Clicking the active side again clears back to null, the
 * same gesture the engagement checks use.
 */
export default function OfferLetterToggle({
  student
}: {
  student: StudentDashboardRow;
}) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [busy, setBusy] = React.useState(false);

  const saved = student.a_payments?.ol_accepted ?? null;
  // Held only between the click and the new data arriving, so the button
  // responds immediately instead of waiting on the round trip.
  const [pending, setPending] = React.useState<OfferLetterAnswer | undefined>();
  React.useEffect(() => {
    setPending(undefined);
  }, [saved, student.matric_no]);

  const value = pending !== undefined ? pending : saved;
  const state = offerLetterState(value);

  const setAnswer = async (next: OfferLetterAnswer) => {
    setBusy(true);
    setPending(next);
    const now = new Date().toISOString();

    // A student can have no a_payments row yet — the same gap the PTPTN check
    // handles — so create one rather than silently updating nothing.
    const { data: existing } = await supabase
      .from("a_payments")
      .select("matric_no")
      .eq("matric_no", student.matric_no)
      .maybeSingle();

    const { error } = existing
      ? await supabase
          .from("a_payments")
          .update({ ol_accepted: next, updated_at: now })
          .eq("matric_no", student.matric_no)
      : await supabase.from("a_payments").insert({
          matric_no: student.matric_no,
          payment_mode: student.a_payments?.payment_mode ?? "SELF",
          ol_accepted: next,
          updated_at: now
        });

    setBusy(false);

    if (error) {
      setPending(undefined);
      toast.error(`Could not save offer letter: ${error.message}`);
      return;
    }

    toast.success(
      next === null
        ? "Offer letter cleared"
        : next
          ? "Offer letter marked as accepted"
          : "Offer letter marked as not accepted"
    );
    router.refresh();
  };

  return (
    <div
      className={`mt-2.5 flex items-center gap-2 rounded-lg border p-2 transition ${state.rowClass}`}
    >
      <FileSignature className={`h-3.5 w-3.5 shrink-0 ${state.iconClass}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium leading-tight">
          {OFFER_LETTER_LABEL}
        </p>
        <p className="truncate text-[10px] leading-tight text-muted-foreground">
          {state.hint}
        </p>
      </div>

      {busy ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <div className="flex shrink-0 overflow-hidden rounded-md border">
          <button
            type="button"
            title="Accepted"
            aria-label={`${OFFER_LETTER_LABEL}: accepted`}
            aria-pressed={value === true}
            onClick={() => setAnswer(value === true ? null : true)}
            className={`flex h-7 w-8 items-center justify-center transition ${
              value === true
                ? "bg-emerald-500 text-white"
                : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Not accepted"
            aria-label={`${OFFER_LETTER_LABEL}: not accepted`}
            aria-pressed={value === false}
            onClick={() => setAnswer(value === false ? null : false)}
            className={`flex h-7 w-8 items-center justify-center border-l transition ${
              value === false
                ? "bg-red-500 text-white"
                : "text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
            }`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
