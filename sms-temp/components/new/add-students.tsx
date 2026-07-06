"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const supabase = createClient();

const STATUS_OPTIONS = ["Active", "Withdraw", "Deferred", "At Risk"];
const STUDY_MODE_OPTIONS = ["Online", "Conventional"];
const FACULTY_OPTIONS = ["FEH", "FOB", "FAiF", "SMARD", "COL"];
const DEFAULT_STATUS = "Active";

type FieldType = "text" | "email" | "select" | "datalist";

interface FieldDef {
  key: string; // column in a_students
  label: string; // header shown to the user / used in the template
  type: FieldType;
  required?: boolean;
  options?: string[];
  datalist?: "intake" | "campus";
}

const FIELDS: FieldDef[] = [
  { key: "full_name", label: "Full Name", type: "text", required: true },
  { key: "matric_no", label: "Matric No", type: "text", required: true },
  { key: "programme_name", label: "Programme", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "intake_code", label: "Intake", type: "datalist", datalist: "intake" },
  {
    key: "study_mode",
    label: "Study Mode",
    type: "select",
    options: STUDY_MODE_OPTIONS
  },
  { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
  {
    key: "faculty_code",
    label: "Faculty Code",
    type: "select",
    options: FACULTY_OPTIONS
  },
  {
    key: "campus_code",
    label: "Campus Code",
    type: "datalist",
    datalist: "campus"
  }
];

const DB_COLUMNS = FIELDS.map((f) => f.key);

// Normalised excel header -> a_students column
const HEADER_ALIASES: Record<string, string> = {
  fullname: "full_name",
  name: "full_name",
  studentname: "full_name",
  matricno: "matric_no",
  matric: "matric_no",
  matricnumber: "matric_no",
  matricnum: "matric_no",
  programme: "programme_name",
  program: "programme_name",
  programmename: "programme_name",
  programname: "programme_name",
  course: "programme_name",
  email: "email",
  emailaddress: "email",
  phone: "phone",
  phoneno: "phone",
  phonenumber: "phone",
  mobile: "phone",
  contact: "phone",
  contactno: "phone",
  intake: "intake_code",
  intakecode: "intake_code",
  studymode: "study_mode",
  mode: "study_mode",
  status: "status",
  faculty: "faculty_code",
  facultycode: "faculty_code",
  campus: "campus_code",
  campuscode: "campus_code"
};

const normalizeHeader = (h: string) =>
  String(h)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

type StudentPayload = Record<string, string>;

interface ParsedRow {
  data: StudentPayload;
  errors: string[];
}

// Build a clean insert payload: trim strings, drop blanks, default the status.
function buildPayload(raw: Record<string, unknown>): StudentPayload {
  const payload: StudentPayload = {};
  for (const col of DB_COLUMNS) {
    let v = raw[col];
    if (typeof v === "string") v = v.trim();
    if (v === "" || v === undefined || v === null) continue;
    payload[col] = String(v);
  }
  if (!payload.status) payload.status = DEFAULT_STATUS;
  return payload;
}

export default function AddStudents() {
  const [intakeOptions, setIntakeOptions] = useState<string[]>([]);
  const [campusOptions, setCampusOptions] = useState<string[]>([]);

  // Individual add state
  const [form, setForm] = useState<StudentPayload>({ status: DEFAULT_STATUS });
  const [saving, setSaving] = useState(false);

  // Bulk import state
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [upsert, setUpsert] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchDistinct = async () => {
      const { data } = await supabase
        .from("a_students")
        .select("intake_code, campus_code");
      if (!data) return;
      setIntakeOptions(
        [...new Set(data.map((r) => r.intake_code).filter(Boolean))].sort()
      );
      setCampusOptions(
        [...new Set(data.map((r) => r.campus_code).filter(Boolean))].sort()
      );
    };
    fetchDistinct();
  }, []);

  const datalistFor = useCallback(
    (which?: "intake" | "campus") =>
      which === "intake" ? intakeOptions : which === "campus" ? campusOptions : [],
    [intakeOptions, campusOptions]
  );

  /* -------------------------- Individual add -------------------------- */

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleAddIndividual = async () => {
    const payload = buildPayload(form);
    if (!payload.full_name || !payload.matric_no) {
      toast.error("Full Name and Matric No are required.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("a_students").insert(payload);
    setSaving(false);

    if (error) {
      toast.error(
        error.code === "23505"
          ? `A student with matric no ${payload.matric_no} already exists.`
          : `Failed to add student: ${error.message}`
      );
      return;
    }

    toast.success(`Added ${payload.full_name} (${payload.matric_no}).`);
    setForm({ status: DEFAULT_STATUS });
  };

  /* --------------------------- Bulk import --------------------------- */

  const handleDownloadTemplate = () => {
    const sample: Record<string, string> = {
      "Full Name": "Ali bin Abu",
      "Matric No": "UIU2400001",
      Programme: "Bachelor of Business Administration",
      Email: "ali@example.com",
      Phone: "60123456789",
      Intake: intakeOptions[0] ?? "July26",
      "Study Mode": "Online",
      Status: "Active",
      "Faculty Code": "FOB",
      "Campus Code": campusOptions[0] ?? "KL"
    };
    const ws = XLSX.utils.json_to_sheet([sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_upload_template.xlsx");
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
        defval: ""
      });

      // Map raw headers -> db columns
      const mapped = json.map((rawRow) => {
        const row: Record<string, unknown> = {};
        for (const [rawKey, val] of Object.entries(rawRow)) {
          const dbKey = HEADER_ALIASES[normalizeHeader(rawKey)];
          if (dbKey) row[dbKey] = val;
        }
        return buildPayload(row);
      });

      // Count matric_no occurrences within this file to flag duplicates
      const matricCounts = new Map<string, number>();
      mapped.forEach((r) => {
        if (r.matric_no)
          matricCounts.set(r.matric_no, (matricCounts.get(r.matric_no) ?? 0) + 1);
      });

      const rows: ParsedRow[] = mapped.map((data) => {
        const errors: string[] = [];
        if (!data.full_name) errors.push("Missing Full Name");
        if (!data.matric_no) errors.push("Missing Matric No");
        if (data.matric_no && (matricCounts.get(data.matric_no) ?? 0) > 1)
          errors.push("Duplicate Matric No in file");
        return { data, errors };
      });

      setParsedRows(rows);
      if (rows.length === 0)
        toast.error("No rows found in the uploaded file.");
    } catch (e) {
      toast.error(`Could not read file: ${(e as Error).message}`);
      setParsedRows([]);
      setFileName("");
    }
  };

  const validRows = useMemo(
    () => parsedRows.filter((r) => r.errors.length === 0),
    [parsedRows]
  );
  const invalidCount = parsedRows.length - validRows.length;

  const resetBulk = () => {
    setParsedRows([]);
    setFileName("");
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);

    const payloads = validRows.map((r) => r.data);
    const query = supabase.from("a_students");
    const { error } = upsert
      ? await query.upsert(payloads, { onConflict: "matric_no" })
      : await query.insert(payloads);

    setImporting(false);

    if (error) {
      toast.error(
        error.code === "23505"
          ? "Some matric numbers already exist. Enable “Update existing rows” to overwrite them."
          : `Import failed: ${error.message}`
      );
      return;
    }

    toast.success(
      `${upsert ? "Imported / updated" : "Imported"} ${payloads.length} student${
        payloads.length !== 1 ? "s" : ""
      }.`
    );
    resetBulk();
  };

  /* ------------------------------ Render ------------------------------ */

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add students to the <code>a_students</code> table one at a time, or import
        many at once from an Excel file.
      </p>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger
            value="individual"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
          >
            Add Individual
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
          >
            Bulk Import (Excel)
          </TabsTrigger>
        </TabsList>

        {/* ---------------------- Individual ---------------------- */}
        <TabsContent value="individual">
          <div className="border rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`field-${field.key}`}>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>

                  {field.type === "select" ? (
                    <Select
                      value={form[field.key] ?? ""}
                      onValueChange={(v) => setField(field.key, v)}
                    >
                      <SelectTrigger id={`field-${field.key}`}>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options!.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <>
                      <Input
                        id={`field-${field.key}`}
                        type={field.type === "email" ? "email" : "text"}
                        list={
                          field.type === "datalist"
                            ? `list-${field.key}`
                            : undefined
                        }
                        value={form[field.key] ?? ""}
                        onChange={(e) => setField(field.key, e.target.value)}
                        placeholder={field.label}
                      />
                      {field.type === "datalist" && (
                        <datalist id={`list-${field.key}`}>
                          {datalistFor(field.datalist).map((opt) => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleAddIndividual}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? "Adding..." : "Add Student"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setForm({ status: DEFAULT_STATUS })}
                disabled={saving}
              >
                Clear
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------- Bulk ------------------------- */}
        <TabsContent value="bulk">
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                Download Template
              </Button>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="max-w-xs cursor-pointer"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {fileName && (
                <span className="text-sm text-muted-foreground">{fileName}</span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Expected columns: Full Name, Matric No, Programme, Email, Phone,
              Intake, Study Mode, Status, Faculty Code, Campus Code. Column order
              does not matter; unrecognised columns are ignored. Status defaults
              to <strong>Active</strong> when blank.
            </p>

            {parsedRows.length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-green-600 font-medium">
                    {validRows.length} ready to import
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-destructive font-medium">
                      {invalidCount} row{invalidCount !== 1 ? "s" : ""} with
                      errors (skipped)
                    </span>
                  )}
                </div>

                <div className="border rounded-md max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        {FIELDS.map((f) => (
                          <TableHead key={f.key}>{f.label}</TableHead>
                        ))}
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedRows.map((row, i) => {
                        const ok = row.errors.length === 0;
                        return (
                          <TableRow
                            key={i}
                            className={ok ? "" : "bg-red-50 dark:bg-red-950/30"}
                          >
                            <TableCell>{i + 1}</TableCell>
                            {FIELDS.map((f) => (
                              <TableCell key={f.key} className="whitespace-nowrap">
                                {row.data[f.key] ?? ""}
                              </TableCell>
                            ))}
                            <TableCell className="whitespace-nowrap">
                              {ok ? (
                                <span className="text-green-600">Ready</span>
                              ) : (
                                <span className="text-destructive">
                                  {row.errors.join(", ")}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="upsert"
                    checked={upsert}
                    onCheckedChange={(v) => setUpsert(v === true)}
                  />
                  <Label htmlFor="upsert" className="font-normal cursor-pointer">
                    Update existing rows if matric no already exists (upsert)
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleImport}
                    disabled={importing || validRows.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {importing
                      ? "Importing..."
                      : `Import ${validRows.length} Student${
                          validRows.length !== 1 ? "s" : ""
                        }`}
                  </Button>
                  <Button variant="outline" onClick={resetBulk} disabled={importing}>
                    Clear
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
