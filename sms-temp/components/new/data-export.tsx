/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
import type {
  Student,
  Payment,
  LMSActivity,
  Engagement,
  SOS
} from "@/lib/types/database";

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
      { key: "campus_code", label: "Campus" }
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
    group: "Engagements (Summary)",
    key: "engagements",
    fields: [
      { key: "total_engagements", label: "Total Engagements" },
      { key: "last_engagement_date", label: "Last Engagement Date" },
      { key: "last_sentiment", label: "Last Sentiment" },
      { key: "last_outcome", label: "Last Outcome" }
    ]
  },
  {
    group: "SOS Survey",
    key: "sos",
    fields: [
      { key: "nps", label: "NPS Score" },
      { key: "q1", label: "Q1" },
      { key: "q2", label: "Q2" },
      { key: "q3", label: "Q3" },
      { key: "q4", label: "Q4" },
      { key: "q5", label: "Q5" },
      { key: "feedback", label: "Feedback" }
    ]
  }
];

const ALL_FIELD_KEYS = COLUMN_GROUPS.flatMap((g) => g.fields.map((f) => f.key));
const LABEL_MAP = Object.fromEntries(
  COLUMN_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.label]))
);

const STATUS_OPTIONS = ["Active", "Withdraw", "Deferred", "At Risk"];
const FACULTY_OPTIONS = ["FOB", "FEH", "FAiFT"];
const STUDY_MODE_OPTIONS = ["Online", "Conventional"];
const INTAKE_QUERY_TABLE = "a_students" as const;
const SST_MEMBERS = [
  { id: 1, name: "Amirul" },
  { id: 2, name: "Farzana" },
  { id: 3, name: "Najwa" },
  { id: 4, name: "Ayu" },
  { id: 6, name: "Miru" }
];

type StudentRow = Student & {
  a_payments: Payment | null;
  a_lms_activity: LMSActivity | null;
  a_engagements: Engagement[] | null;
  a_sos: SOS | null;
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
    [selectedStatuses, selectedFaculties, selectedModes, selectedIntakes, selectedSsts]
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
      .select(
        "*, a_payments(*), a_lms_activity(*), a_engagements(*), a_sos(*)"
      );
    const { data, error } = await applyFilters(base);

    if (error || !data) {
      alert(`Failed to fetch data: ${error?.message}`);
      setLoading(false);
      return;
    }

    const rows = (data as StudentRow[]).map((s) => {
      const engagements = s.a_engagements ?? [];
      const sorted = [...engagements].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastEng = sorted[0];

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
        payment_mode: s.a_payments?.payment_mode ?? null,
        payment_status: s.a_payments?.payment_status ?? null,
        ptptn_proof_status: s.a_payments?.ptptn_proof_status ?? null,
        cp_w1: s.a_lms_activity?.cp_w1 ?? null,
        cp_w2: s.a_lms_activity?.cp_w2 ?? null,
        cp_w3: s.a_lms_activity?.cp_w3 ?? null,
        latest_cp: s.a_lms_activity?.latest_cp ?? null,
        last_login_at: s.a_lms_activity?.last_login_at ?? null,
        course_visits: s.a_lms_activity?.course_visits ?? null,
        total_engagements: engagements.length,
        last_engagement_date: lastEng?.created_at ?? null,
        last_sentiment: lastEng?.sentiment ?? null,
        last_outcome: lastEng?.outcome ?? null,
        nps: s.a_sos?.nps ?? null,
        q1: s.a_sos?.q1 ?? null,
        q2: s.a_sos?.q2 ?? null,
        q3: s.a_sos?.q3 ?? null,
        q4: s.a_sos?.q4 ?? null,
        q5: s.a_sos?.q5 ?? null,
        feedback: s.a_sos?.feedback ?? null
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
              <p className="text-xs text-muted-foreground">All (no filter applied)</p>
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
