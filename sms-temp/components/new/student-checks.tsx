"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ListChecks,
  Loader2,
  Lock,
  MessageSquareText,
  PenLine,
  TriangleAlert,
  X
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { PanelCard } from "./panel-card";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { createClient } from "@/lib/supabase/client";
import { StudentDashboardRow } from "@/lib/types/database";
import { useCurrentSst } from "@/hooks/use-current-sst";
import {
  AT_RISK_INTENTS,
  AtRiskIntent,
  CheckAnswer,
  CheckKey,
  getChecks,
  getProgress,
  suggestStatus
} from "@/lib/student-progress";

/** Log line written to a_engagements so the audit trail and SF export survive. */
const CHECK_TOPIC: Record<CheckKey, string> = {
  contacted: "Contacted",
  onboarding: "Onboarding Check",
  login: "Zero Login Check",
  ptptn: "PTPTN Application"
};

function stampLine(name: string) {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
  return `${today} · ${name || "SST"}: `;
}

export default function StudentChecks({
  student
}: {
  student: StudentDashboardRow;
}) {
  const router = useRouter();
  const { member, displayName } = useCurrentSst();
  const supabase = React.useMemo(() => createClient(), []);

  const [busy, setBusy] = React.useState<CheckKey | "risk" | "status" | null>(
    null
  );
  const [remarks, setRemarks] = React.useState(student.remarks ?? "");
  const [savingRemarks, setSavingRemarks] = React.useState(false);
  const remarksRef = React.useRef<HTMLTextAreaElement>(null);

  // Re-sync when a different student is selected.
  React.useEffect(() => {
    setRemarks(student.remarks ?? "");
  }, [student.matric_no, student.remarks]);

  const checks = getChecks(student);
  const progress = getProgress(student);
  const suggestion = suggestStatus(student);
  const statusDiffers = suggestion.status !== student.status;

  /** Records the check against the student and logs it as an engagement. */
  const logEngagement = async (topic: string, outcome: string) => {
    await supabase.from("a_engagements").insert({
      matric_no: student.matric_no,
      sst_id: member?.id ?? null,
      topic,
      channel: "whatsapp",
      outcome,
      remarks: null,
      sentiment: "Neutral"
    });
  };

  /**
   * Writes one of the three states. Clicking the active button again passes
   * null, which puts the check back to "not actioned yet".
   */
  const answerCheck = async (key: CheckKey, next: CheckAnswer) => {
    setBusy(key);
    const now = new Date().toISOString();
    const stamp = next === null ? null : now;
    const by = next === null ? null : (member?.id ?? null);

    const columns: Record<CheckKey, Record<string, unknown>> = {
      contacted: {
        contacted: next,
        contacted_at: stamp,
        contacted_by: by
      },
      onboarding: {
        onboarding_checked: next,
        onboarding_checked_at: stamp,
        onboarding_checked_by: by
      },
      login: {
        login_checked: next,
        login_checked_at: stamp,
        login_checked_by: by
      },
      ptptn: {
        ptptn_checked: next,
        ptptn_checked_at: stamp,
        ptptn_checked_by: by
      }
    };

    const { error } = await supabase
      .from("a_students")
      .update(columns[key])
      .eq("matric_no", student.matric_no);

    if (error) {
      toast.error(`Could not save: ${error.message}`);
      setBusy(null);
      return;
    }

    // Keep a_payments in step so the PTPTN proof metric, the table's Proof
    // column and the CSV export all agree with the check.
    if (key === "ptptn") {
      const { data: existing } = await supabase
        .from("a_payments")
        .select("matric_no")
        .eq("matric_no", student.matric_no)
        .maybeSingle();

      const proof = next === true;
      if (existing) {
        await supabase
          .from("a_payments")
          .update({ ptptn_proof_status: proof, updated_at: now })
          .eq("matric_no", student.matric_no);
      } else if (next !== null) {
        await supabase.from("a_payments").insert({
          // No payment_mode. This ran even for next === false — answering "no,
          // not PTPTN" created a row classifying the student as PTPTN. The
          // check records whether proof arrived; the Payment Mode field in
          // edit-student.tsx is where someone actually chooses how they pay.
          matric_no: student.matric_no,
          ptptn_proof_status: proof,
          updated_at: now
        });
      }
    }

    // A check owns its engagement: at most one per topic, always matching the
    // answer now stored. Clearing the check has to retract the engagement too,
    // or the history keeps asserting a contact that has been taken back — and
    // re-answering replaces the old entry instead of stacking a second,
    // contradictory one next to it.
    //
    // Only the four CHECK_TOPIC strings are touched. The manual engagement
    // form writes different topics ("Onboarding Pulse Check", "CN Engagement
    // Check", "PTPTN Pulse Check", "Others"), so a hand-written log is never
    // caught by this.
    const { error: clearError } = await supabase
      .from("a_engagements")
      .delete()
      .eq("matric_no", student.matric_no)
      .eq("topic", CHECK_TOPIC[key]);

    if (clearError) {
      toast.error(`Could not clear the old engagement: ${clearError.message}`);
    }

    // Log both answers — a reported "no" is as much a contact as a "yes".
    if (next !== null) {
      await logEngagement(
        CHECK_TOPIC[key],
        next ? "no_issue" : "no_response"
      );
    }

    setBusy(null);
    toast.success(
      next === null
        ? `${CHECK_TOPIC[key]} cleared`
        : next
          ? `${CHECK_TOPIC[key]} confirmed`
          : `${CHECK_TOPIC[key]} reported as not done`
    );
    router.refresh();
  };

  const saveRemarks = async () => {
    if (remarks === (student.remarks ?? "")) return;
    setSavingRemarks(true);
    const { error } = await supabase
      .from("a_students")
      .update({ remarks })
      .eq("matric_no", student.matric_no);
    setSavingRemarks(false);
    if (error) {
      toast.error("Could not save remarks.");
      return;
    }
    toast.success("Remarks saved");
    router.refresh();
  };

  const addRemarkLine = () => {
    const prefix = stampLine(member?.name ?? displayName);
    setRemarks((prev) => (prev ? `${prev.replace(/\s+$/, "")}\n${prefix}` : prefix));
    requestAnimationFrame(() => {
      const el = remarksRef.current;
      if (!el) return;
      el.focus();
      el.selectionStart = el.selectionEnd = el.value.length;
      el.scrollTop = el.scrollHeight;
    });
  };

  const updateRisk = async (patch: {
    at_risk?: boolean;
    at_risk_intent?: AtRiskIntent | null;
    at_risk_reason?: string;
  }) => {
    setBusy("risk");
    const { error } = await supabase
      .from("a_students")
      .update(patch)
      .eq("matric_no", student.matric_no);
    setBusy(null);
    if (error) {
      toast.error("Could not update at-risk flag.");
      return;
    }
    router.refresh();
  };

  const applyStatus = async () => {
    setBusy("status");
    const { error } = await supabase
      .from("a_students")
      .update({ status: suggestion.status })
      .eq("matric_no", student.matric_no);
    setBusy(null);
    if (error) {
      toast.error("Could not update status.");
      return;
    }
    toast.success(`Status set to ${suggestion.status}`);
    router.refresh();
  };

  return (
    <>
      {/* Engagement checks ---------------------------------------------- */}
      <PanelCard
        title="Engagement checks"
        icon={ListChecks}
        meta={`${progress.done}/${progress.total}`}
      >
        <div className="mb-3 flex gap-1">
          {checks
            .filter((c) => c.applicable)
            .map((c) => (
              <span
                key={c.key}
                className={`h-1 flex-1 rounded-full ${
                  c.answer === true
                    ? "bg-emerald-500"
                    : c.answer === false
                      ? "bg-red-500"
                      : "bg-muted"
                }`}
              />
            ))}
        </div>

        <ol className="flex flex-col gap-1.5">
          {checks.map((check, index) => {
            const locked = !check.applicable || !check.unlocked;
            const working = busy === check.key;
            return (
              <li
                key={check.key}
                className={`rounded-lg border p-2.5 transition ${
                  !check.applicable
                    ? "opacity-45"
                    : !check.unlocked
                      ? "opacity-60"
                      : check.answer === true
                        ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                        : check.answer === false
                          ? "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30"
                          : "hover:border-foreground/20"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-[3px] text-[11px] font-medium tabular-nums text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[13px] font-medium">
                      {check.label}
                    </span>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {!check.applicable
                        ? "Not applicable — student is not paying by PTPTN"
                        : !check.unlocked
                          ? `Opens once "${checks[index - 1].label.toLowerCase()}" has an answer`
                          : check.answer === true
                            ? check.yesHint
                            : check.answer === false
                              ? check.noHint
                              : check.pendingHint}
                    </p>
                  </div>

                  {working ? (
                    <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : locked ? (
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                  ) : (
                    // Click the active side again to clear back to "not actioned".
                    <div className="flex shrink-0 overflow-hidden rounded-md border">
                      <button
                        type="button"
                        title={
                          check.canDecline ? "Confirm done" : "Mark as contacted"
                        }
                        aria-pressed={check.answer === true}
                        onClick={() =>
                          answerCheck(
                            check.key,
                            check.answer === true ? null : true
                          )
                        }
                        className={`flex h-7 w-8 items-center justify-center transition ${
                          check.answer === true
                            ? "bg-emerald-500 text-white"
                            : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      {check.canDecline && (
                        <button
                          type="button"
                          title={check.noLabel}
                          aria-pressed={check.answer === false}
                          onClick={() =>
                            answerCheck(
                              check.key,
                              check.answer === false ? null : false
                            )
                          }
                          className={`flex h-7 w-8 items-center justify-center border-l transition ${
                            check.answer === false
                              ? "bg-red-500 text-white"
                              : "text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                          }`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </PanelCard>

      {/* Retention risk -------------------------------------------------- */}
      <PanelCard title="Retention risk" icon={TriangleAlert}>
        <div
          className={`rounded-lg ${
            student.at_risk
              ? "border border-amber-300 bg-amber-50/70 p-2.5 dark:border-amber-900 dark:bg-amber-950/30"
              : ""
          }`}
        >
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={!!student.at_risk}
            disabled={busy === "risk"}
            onCheckedChange={(v) =>
              updateRisk({
                at_risk: !!v,
                at_risk_intent: v ? (student.at_risk_intent ?? "deciding") : null
              })
            }
          />
          <TriangleAlert
            className={`h-3.5 w-3.5 ${
              student.at_risk
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            }`}
          />
          <span className="text-[13px] font-medium">
            Student is at risk of leaving
          </span>
        </label>

        {student.at_risk && (
          <div className="mt-3 flex flex-col gap-2">
            <Select
              value={student.at_risk_intent ?? "deciding"}
              onValueChange={(v) =>
                updateRisk({ at_risk_intent: v as AtRiskIntent })
              }
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue placeholder="What do they intend to do?" />
              </SelectTrigger>
              <SelectContent>
                {AT_RISK_INTENTS.map((intent) => (
                  <SelectItem key={intent.value} value={intent.value}>
                    {intent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              defaultValue={student.at_risk_reason ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (student.at_risk_reason ?? "")) {
                  updateRisk({ at_risk_reason: e.target.value });
                }
              }}
              placeholder="Why do they want to withdraw or defer?"
              className="min-h-[64px] resize-y text-xs"
            />
          </div>
        )}
        </div>

        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-dashed p-2.5">
        <AlertTriangle
          className={`h-3.5 w-3.5 shrink-0 ${
            statusDiffers ? "text-amber-500" : "text-muted-foreground/50"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">
            {statusDiffers ? (
              <>
                Suggested status{" "}
                <span className="font-medium text-foreground">
                  {suggestion.status}
                </span>{" "}
                — currently {student.status}
              </>
            ) : (
              <>Status matches the at-risk section ({student.status})</>
            )}
          </p>
        </div>
        {statusDiffers && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 shrink-0 text-xs"
            disabled={busy === "status"}
            onClick={applyStatus}
          >
            {busy === "status" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        )}
        </div>
      </PanelCard>

      {/* Remarks --------------------------------------------------------- */}
      <PanelCard
        title="Remarks"
        icon={MessageSquareText}
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[11px]"
            onClick={addRemarkLine}
          >
            <PenLine className="h-3 w-3" />
            New line
          </Button>
        }
      >
        <Textarea
          ref={remarksRef}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          onBlur={saveRemarks}
          placeholder="One line per contact. Click 'New line' to stamp today's date and your name."
          className="min-h-[130px] resize-y text-xs leading-relaxed"
        />
        <p className="mt-1 h-4 text-[10px] text-muted-foreground">
          {savingRemarks
            ? "Saving…"
            : remarks !== (student.remarks ?? "")
              ? "Unsaved — click outside the box to save"
              : ""}
        </p>
      </PanelCard>
    </>
  );
}
