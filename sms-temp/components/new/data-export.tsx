/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
import type { Student, Payment, LMSActivity } from "@/lib/types/database";

const supabase = createClient();

const COLUMN_GROUPS = [
  {
    group: "Student Info",
    key: "student",
    fields: [
      { key: "matric_no", label: "Matric No" },
      { key: "full_name", label: "Full Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "intake_code", label: "Intake Code" },
      { key: "study_mode", label: "Study Mode" },
      { key: "status", label: "Status" },
      { key: "faculty_code", label: "Faculty" },
      { key: "programme_name", label: "Programme" },
      { key: "campus_code", label: "Campus" },
      { key: "sst_id", label: "SST ID" },
      { key: "sst_name", label: "SST Name" }
    ]
  },
  {
    group: "Payments",
    key: "payments",
    fields: [
      { key: "payment_mode", label: "Payment Mode" },
      { key: "payment_status", label: "Payment Status" },
      { key: "ptptn_proof_status", label: "PTPTN Proof" }
    ]
  },
  {
    group: "LMS Activity",
    key: "lms",
    fields: [
      { key: "cp_w1", label: "CP Week 1" },
      { key: "cp_w2", label: "CP Week 2" },
      { key: "cp_w3", label: "CP Week 3" },
      { key: "latest_cp", label: "Latest CP" },
      { key: "last_login_at", label: "Last Login" },
      { key: "course_visits", label: "Course Visits" }
    ]
  },
  {
    // The four-step check sequence. Values are rendered through the same
    // lib/student-progress helpers the app uses, so the sheet and the screen
    // can never disagree about what a check says.
    group: "Engagement Checks",
    key: "checks",
    fields: [
      { key: "contacted_state", label: "Contacted" },
      { key: "contacted_at", label: "Contacted At" },
      { key: "contacted_by", label: "Contacted By" },
      { key: "onboarding_state", label: "Onboarding Check" },
      { key: "onboarding_checked_at", label: "Onboarding Checked At" },
      { key: "onboarding_checked_by", label: "Onboarding Checked By" },
      { key: "login_state", label: "Zero Login Check" },
      { key: "login_checked_at", label: "Zero Login Checked At" },
      { key: "login_checked_by", label: "Zero Login Checked By" },
      { key: "ptptn_state", label: "PTPTN Application" },
      { key: "ptptn_checked_at", label: "PTPTN Checked At" },
      { key: "ptptn_checked_by", label: "PTPTN Checked By" },
      { key: "checks_done", label: "Checks Answered" },
      { key: "checks_total", label: "Checks Applicable" },
      { key: "next_check", label: "Next Check Due" }
    ]
  },
  {
    group: "Retention Risk",
    key: "risk",
    fields: [
      { key: "at_risk", label: "At Risk" },
      { key: "at_risk_intent", label: "At Risk Intent" },
      { key: "at_risk_reason", label: "At Risk Reason" },
      { key: "remarks", label: "Remarks" }
    ]
  }
];

const ALL_FIELD_KEYS = COLUMN_GROUPS.flatMap((g) => g.fields.map((f) => f.key));
const LABEL_MAP = Object.fromEntries(
  COLUMN_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.label]))
);

const STATUS_OPTIONS = ["Active", "Withdraw", "Deferred", "At Risk"];
import { SST_MEMBERS, getSstById } from "@/lib/sst-members";
import {
  AT_RISK_INTENTS,
  getChecks,
  getProgress,
  type StudentCheck
} from "@/lib/student-progress";

/**
 * Spreadsheet wording for one check. The three states come straight from
 * getChecks, so PTPTN applicability and the a_payments proof fallback behave
 * exactly as they do in the app; only the phrasing is export-specific.
 * The negative wording reuses the check's own noLabel ("No response",
 * "No CN login", "Not applied").
 */
function checkState(check: StudentCheck): string {
  // "Not applicable" only when nothing was ever recorded. 536 students carry a
  // PTPTN answer from the proof backfill while paying by SELF/DECLINE OFFER
  // etc., so applicability alone would drop a real answer from the sheet.
  if (!check.applicable && check.answer === null) return "Not applicable";
  if (check.answer === true) return "Yes";
  if (check.answer === false) return check.noLabel || "No";
  return "Not actioned";
}

/** SST id -> name, so "…Checked By" reads as a person and not a number. */
const sstName = (id: number | null | undefined) =>
  id == null ? null : (getSstById(id)?.name ?? String(id));

const FACULTY_OPTIONS = ["FOB", "FEH", "FAiFT"];
const STUDY_MODE_OPTIONS = ["Online", "Conventional"];
const INTAKE_QUERY_TABLE = "a_students" as const;


type StudentRow = Student & {
  a_payments: Payment | null;
  a_lms_activity: LMSActivity | null;
};

export default function DataExport() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedIntakes, setSelectedIntakes] = useState<string[]>([]);
  const [intakeOptions, setIntakeOptions] = useState<string[]>([]);
  const [selectedSsts, setSelectedSsts] = useState<number[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(ALL_FIELD_KEYS)
  );
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [counting, setCounting] = useState(false);

  useEffect(() => {
    const fetchIntakes = async () => {
      const { data } = await supabase
        .from(INTAKE_QUERY_TABLE)
        .select("intake_code");
      if (data) {
        const unique = [...new Set(data.map((r) => r.intake_code))].sort();
        setIntakeOptions(unique);
      }
    };
    fetchIntakes();
  }, []);

  const applyFilters = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (q: any) => {
      if (selectedStatuses.length > 0) q = q.in("status", selectedStatuses);
      if (selectedFaculties.length > 0)
        q = q.in("faculty_code", selectedFaculties);
      if (selectedModes.length > 0) q = q.in("study_mode", selectedModes);
      if (selectedIntakes.length > 0) q = q.in("intake_code", selectedIntakes);
      if (selectedSsts.length > 0) q = q.in("sst_id", selectedSsts);
      return q;
    },
    [
      selectedStatuses,
      selectedFaculties,
      selectedModes,
      selectedIntakes,
      selectedSsts
    ]
  );

  useEffect(() => {
    const fetchCount = async () => {
      setCounting(true);
      const base = supabase
        .from("a_students")
        .select("matric_no", { count: "exact", head: true });
      const { count } = await applyFilters(base);
      setStudentCount(count ?? 0);
      setCounting(false);
    };
    fetchCount();
  }, [applyFilters]);

  const toggleMulti = (
    value: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected, value]
    );
  };

  const toggleColumn = (key: string) => {
    const next = new Set(selectedColumns);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedColumns(next);
  };

  const toggleGroup = (fields: { key: string }[]) => {
    const allSelected = fields.every((f) => selectedColumns.has(f.key));
    const next = new Set(selectedColumns);
    fields.forEach((f) => (allSelected ? next.delete(f.key) : next.add(f.key)));
    setSelectedColumns(next);
  };

  const handleExport = async () => {
    setLoading(true);
    const base = supabase
      .from("a_students")
      .select("*, a_payments(*), a_lms_activity(*)");
    const { data, error } = await applyFilters(base);

    if (error || !data) {
      alert(`Failed to fetch data: ${error?.message}`);
      setLoading(false);
      return;
    }

    const rows = (data as StudentRow[]).map((s) => {
      const [contacted, onboarding, login, ptptn] = getChecks(s);
      const progress = getProgress(s);
      const intent = AT_RISK_INTENTS.find((i) => i.value === s.at_risk_intent);

      const flat: Record<string, unknown> = {
        matric_no: s.matric_no,
        full_name: s.full_name,
        email: s.email,
        phone: s.phone,
        intake_code: s.intake_code,
        study_mode: s.study_mode,
        status: s.status,
        faculty_code: s.faculty_code,
        programme_name: s.programme_name,
        campus_code: s.campus_code,
        sst_id: s.sst_id ?? null,
        sst_name: getSstById(s.sst_id)?.name ?? null,
        payment_mode: s.a_payments?.payment_mode ?? null,
        payment_status: s.a_payments?.payment_status ?? null,
        ptptn_proof_status: s.a_payments?.ptptn_proof_status ?? null,
        contacted_state: checkState(contacted),
        contacted_at: s.contacted_at ?? null,
        contacted_by: sstName(s.contacted_by),
        onboarding_state: checkState(onboarding),
        onboarding_checked_at: s.onboarding_checked_at ?? null,
        onboarding_checked_by: sstName(s.onboarding_checked_by),
        login_state: checkState(login),
        login_checked_at: s.login_checked_at ?? null,
        login_checked_by: sstName(s.login_checked_by),
        ptptn_state: checkState(ptptn),
        ptptn_checked_at: s.ptptn_checked_at ?? null,
        ptptn_checked_by: sstName(s.ptptn_checked_by),
        checks_done: progress.done,
        checks_total: progress.total,
        next_check: progress.next?.label ?? "All done",
        at_risk: s.at_risk ? "Yes" : "No",
        at_risk_intent: intent?.label ?? null,
        at_risk_reason: s.at_risk_reason ?? null,
        remarks: s.remarks ?? null,
        cp_w1: s.a_lms_activity?.cp_w1 ?? null,
        cp_w2: s.a_lms_activity?.cp_w2 ?? null,
        cp_w3: s.a_lms_activity?.cp_w3 ?? null,
        latest_cp: s.a_lms_activity?.latest_cp ?? null,
        last_login_at: s.a_lms_activity?.last_login_at ?? null,
        course_visits: s.a_lms_activity?.course_visits ?? null,
      };

      return Object.fromEntries(
        Object.entries(flat)
          .filter(([k]) => selectedColumns.has(k))
          .map(([k, v]) => [LABEL_MAP[k] ?? k, v])
      );
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(
      wb,
      `student_export_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FilterGroup
            label="Status"
            options={STATUS_OPTIONS}
            selected={selectedStatuses}
            onToggle={(v) =>
              toggleMulti(v, selectedStatuses, setSelectedStatuses)
            }
          />
          <FilterGroup
            label="Faculty"
            options={FACULTY_OPTIONS}
            selected={selectedFaculties}
            onToggle={(v) =>
              toggleMulti(v, selectedFaculties, setSelectedFaculties)
            }
          />
          <FilterGroup
            label="Study Mode"
            options={STUDY_MODE_OPTIONS}
            selected={selectedModes}
            onToggle={(v) => toggleMulti(v, selectedModes, setSelectedModes)}
          />
          <FilterGroup
            label="Intake"
            options={intakeOptions}
            selected={selectedIntakes}
            onToggle={(v) =>
              toggleMulti(v, selectedIntakes, setSelectedIntakes)
            }
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold">SST</p>
            <div className="flex flex-wrap gap-2">
              {SST_MEMBERS.map((sst) => (
                <Badge
                  key={sst.id}
                  variant="outline"
                  className={`cursor-pointer select-none ${selectedSsts.includes(sst.id) ? "bg-cyan-500 text-white border-cyan-500" : ""}`}
                  onClick={() =>
                    setSelectedSsts((prev) =>
                      prev.includes(sst.id)
                        ? prev.filter((id) => id !== sst.id)
                        : [...prev, sst.id]
                    )
                  }
                >
                  {sst.name}
                </Badge>
              ))}
            </div>
            {selectedSsts.length === 0 && (
              <p className="text-xs text-muted-foreground">
                All (no filter applied)
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {counting
            ? "Counting..."
            : studentCount !== null
              ? `${studentCount} student${studentCount !== 1 ? "s" : ""} match your filters`
              : ""}
        </p>
      </div>

      {/* Column Picker */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Columns to Export</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedColumns(new Set(ALL_FIELD_KEYS))}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedColumns(new Set())}
            >
              Clear All
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COLUMN_GROUPS.map((group) => {
            const allChecked = group.fields.every((f) =>
              selectedColumns.has(f.key)
            );
            const someChecked = group.fields.some((f) =>
              selectedColumns.has(f.key)
            );
            return (
              <div key={group.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`group-${group.key}`}
                    checked={
                      allChecked || (someChecked ? "indeterminate" : false)
                    }
                    onCheckedChange={() => toggleGroup(group.fields)}
                  />
                  <Label
                    htmlFor={`group-${group.key}`}
                    className="font-semibold text-sm cursor-pointer"
                  >
                    {group.group}
                  </Label>
                </div>
                <div className="pl-6 space-y-1.5">
                  {group.fields.map((field) => (
                    <div key={field.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`col-${field.key}`}
                        checked={selectedColumns.has(field.key)}
                        onCheckedChange={() => toggleColumn(field.key)}
                      />
                      <Label
                        htmlFor={`col-${field.key}`}
                        className="text-sm cursor-pointer font-normal"
                      >
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleExport}
          disabled={loading || selectedColumns.size === 0 || studentCount === 0}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? "Exporting..." : "Export to Excel (.xlsx)"}
        </Button>
        {selectedColumns.size === 0 && (
          <p className="text-sm text-destructive">
            Select at least one column to export.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onToggle
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Badge
            key={opt}
            variant="outline"
            className={`cursor-pointer select-none ${selected.includes(opt) ? "bg-cyan-500 text-white border-cyan-500" : ""}`}
            onClick={() => onToggle(opt)}
          >
            {opt}
          </Badge>
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-muted-foreground">All (no filter applied)</p>
      )}
    </div>
  );
}
