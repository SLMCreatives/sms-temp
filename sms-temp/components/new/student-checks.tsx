"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Loader2,
  Lock,
  PenLine,
  TriangleAlert
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
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
  CheckKey,
  getChecks,
  getProgress,
  suggestStatus
} from "@/lib/student-progress";

/** Log line written to a_engagements so the audit trail and SF export survive. */
const CHECK_TOPIC: Record<CheckKey, string> = {
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

  const toggleCheck = async (key: CheckKey, next: boolean) => {
    setBusy(key);
    const now = new Date().toISOString();
    let error = null;

    if (key === "ptptn") {
      // PTPTN reuses the payments row so the existing proof metric stays true.
      const { data: existing } = await supabase
        .from("a_payments")
        .select("matric_no")
        .eq("matric_no", student.matric_no)
        .maybeSingle();

      const res = existing
        ? await supabase
            .from("a_payments")
            .update({ ptptn_proof_status: next, updated_at: now })
            .eq("matric_no", student.matric_no)
        : await supabase.from("a_payments").insert({
            matric_no: student.matric_no,
            payment_mode: "PTPTN",
            ptptn_proof_status: next,
            updated_at: now
          });
      error = res.error;
    } else {
      const patch =
        key === "onboarding"
          ? {
              onboarding_checked: next,
              onboarding_checked_at: next ? now : null,
              onboarding_checked_by: next ? (member?.id ?? null) : null
            }
          : {
              login_checked: next,
              login_checked_at: next ? now : null,
              login_checked_by: next ? (member?.id ?? null) : null
            };

      const res = await supabase
        .from("a_students")
        .update(patch)
        .eq("matric_no", student.matric_no);
      error = res.error;
    }

    if (error) {
      toast.error(`Could not save: ${error.message}`);
      setBusy(null);
      return;
    }

    if (next) await logEngagement(CHECK_TOPIC[key], "no_issue");

    setBusy(null);
    toast.success(`${CHECK_TOPIC[key]} ${next ? "recorded" : "cleared"}`);
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
    <div className="flex flex-col gap-4">
      {/* Progress ------------------------------------------------------- */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Engagement checks
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {progress.done}/{progress.total}
          </span>
        </div>

        <div className="mb-3 flex gap-1">
          {checks
            .filter((c) => c.applicable)
            .map((c) => (
              <span
                key={c.key}
                className={`h-1 flex-1 rounded-full ${
                  c.checked ? "bg-emerald-500" : "bg-muted"
                }`}
              />
            ))}
        </div>

        <ol className="flex flex-col gap-1.5">
          {checks.map((check, index) => {
            const disabled =
              !check.applicable || !check.unlocked || busy === check.key;
            return (
              <li
                key={check.key}
                className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition ${
                  !check.applicable
                    ? "opacity-45"
                    : !check.unlocked
                      ? "opacity-60"
                      : check.checked
                        ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                        : "hover:border-foreground/20"
                }`}
              >
                <div className="mt-0.5">
                  {busy === check.key ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : !check.applicable || !check.unlocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground/60" />
                  ) : (
                    <Checkbox
                      checked={check.checked}
                      disabled={disabled}
                      onCheckedChange={(v) => toggleCheck(check.key, !!v)}
                      aria-label={check.label}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="text-[13px] font-medium">
                      {check.label}
                    </span>
                    {check.checked && (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {!check.applicable
                      ? "Not applicable — student is not paying by PTPTN"
                      : !check.unlocked
                        ? `Locked until "${checks[index - 1].label.toLowerCase()}" is done`
                        : check.checked
                          ? check.checkedHint
                          : check.uncheckedHint}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* At risk -------------------------------------------------------- */}
      <div
        className={`rounded-lg border p-3 ${
          student.at_risk
            ? "border-amber-300 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30"
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

      {/* Suggested status ----------------------------------------------- */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-2.5">
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

      {/* Remarks --------------------------------------------------------- */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Remarks
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[11px]"
            onClick={addRemarkLine}
          >
            <PenLine className="h-3 w-3" />
            New line
          </Button>
        </div>
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
      </div>
    </div>
  );
}
