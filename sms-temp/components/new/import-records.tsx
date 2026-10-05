"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const supabase = createClient();

/**
 * Spreadsheet importer for the one-row-per-student side tables
 * (a_lms_activity, a_payments). Read -> preview -> write on a button press,
 * matching the Add Students bulk flow.
 *
 * Both tables are keyed on matric_no and both carry a foreign key to
 * a_students, so a single unknown matric number would fail the entire batch.
 * The preview therefore checks every matric number against a_students before
 * anything is written, and rows that fail are skipped rather than attempted.
 *
 * Blank cells never overwrite stored values. PostgREST sends one INSERT for a
 * bulk upsert and takes the union of keys across the payload, so a column that
 * is missing from one row would be written as NULL for that row — silently
 * wiping data the file simply didn't mention. Rows are instead grouped by which
 * columns they actually fill, and each group is sent as its own upsert.
 */

type ColumnType = "text" | "number" | "boolean" | "timestamp";

export interface ImportColumn {
  /** Column name in the target table. */
  key: string;
  /** Header shown in the template and the preview. */
  label: string;
  type: ColumnType;
  required?: boolean;
  /** Normalised spreadsheet headers that map to this column. */
  aliases: string[];
  hint?: string;
}

export interface ImportSpec {
  table: string;
  title: string;
  blurb: string;
  templateName: string;
  sheetName: string;
  columns: ImportColumn[];
  sample: Record<string, string | number>;
}

const normalizeHeader = (h: string) =>
  String(h)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

type Coerced = { value?: string | number | boolean; error?: string };

function toNumber(raw: unknown): Coerced {
  if (raw === "" || raw === null || raw === undefined) return {};
  if (typeof raw === "number")
    return Number.isFinite(raw) ? { value: raw } : { error: "not a number" };
  let text = String(raw).trim();
  if (!text) return {};
  // "12%" is read as 0.12 — the cp columns are stored as a 0–1 fraction.
  const isPercent = text.endsWith("%");
  text = text.replace(/%$/, "").replace(/,/g, "").trim();
  const n = Number(text);
  if (!Number.isFinite(n)) return { error: "not a number" };
  return { value: isPercent ? n / 100 : n };
}

const TRUTHY = new Set(["true", "yes", "y", "1", "t", "paid", "received"]);
const FALSY = new Set(["false", "no", "n", "0", "f"]);

function toBoolean(raw: unknown): Coerced {
  if (raw === "" || raw === null || raw === undefined) return {};
  if (typeof raw === "boolean") return { value: raw };
  if (typeof raw === "number") return { value: raw !== 0 };
  const text = String(raw).trim().toLowerCase();
  if (!text) return {};
  if (TRUTHY.has(text)) return { value: true };
  if (FALSY.has(text)) return { value: false };
  return { error: "expected true/false" };
}

function toTimestamp(raw: unknown): Coerced {
  if (raw === "" || raw === null || raw === undefined) return {};
  // The workbook is read with cellDates, so real date cells arrive as Date.
  if (raw instanceof Date)
    return Number.isNaN(raw.getTime())
      ? { error: "invalid date" }
      : { value: raw.toISOString() };
  const text = String(raw).trim();
  if (!text) return {};
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return { error: "invalid date" };
  return { value: parsed.toISOString() };
}

function coerce(type: ColumnType, raw: unknown): Coerced {
  if (type === "number") return toNumber(raw);
  if (type === "boolean") return toBoolean(raw);
  if (type === "timestamp") return toTimestamp(raw);
  const text = typeof raw === "string" ? raw.trim() : raw;
  if (text === "" || text === null || text === undefined) return {};
  return { value: String(text) };
}

type Payload = Record<string, string | number | boolean>;

interface ParsedRow {
  payload: Payload;
  /** Columns this row actually fills, for the grouped upsert. */
  filled: string[];
  errors: string[];
}

/** One upsert per distinct set of filled columns — see the note up top. */
function groupBySignature(rows: ParsedRow[]) {
  const groups = new Map<string, Payload[]>();
  for (const row of rows) {
    const signature = [...row.filled].sort().join("|");
    const existing = groups.get(signature);
    if (existing) existing.push(row.payload);
    else groups.set(signature, [row.payload]);
  }
  return [...groups.values()];
}

/** Checked in chunks so a large file doesn't blow the URL length. */
async function findExistingMatrics(matrics: string[]) {
  const found = new Set<string>();
  const CHUNK = 300;
  for (let i = 0; i < matrics.length; i += CHUNK) {
    const { data, error } = await supabase
      .from("a_students")
      .select("matric_no")
      .in("matric_no", matrics.slice(i, i + CHUNK));
    if (error) throw new Error(error.message);
    for (const row of data ?? []) found.add(row.matric_no as string);
  }
  return found;
}

export default function ImportRecords({ spec }: { spec: ImportSpec }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mappedColumns, setMappedColumns] = useState<string[]>([]);
  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);

  const aliasMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const col of spec.columns) {
      map[normalizeHeader(col.label)] = col.key;
      map[normalizeHeader(col.key)] = col.key;
      for (const alias of col.aliases) map[normalizeHeader(alias)] = col.key;
    }
    return map;
  }, [spec]);

  const validRows = useMemo(() => rows.filter((r) => r.errors.length === 0), [rows]);
  const invalidCount = rows.length - validRows.length;

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([spec.sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, spec.sheetName);
    XLSX.writeFile(wb, spec.templateName);
  };

  const reset = () => {
    setRows([]);
    setFileName("");
    setMappedColumns([]);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setReading(true);
    try {
      const buffer = await file.arrayBuffer();
      // cellDates so last_login_at arrives as a Date, not an Excel serial.
      const wb = XLSX.read(buffer, { cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: ""
      });

      if (json.length === 0) {
        toast.error("No rows found in that file.");
        reset();
        return;
      }

      const seen = new Set<string>();
      const parsed: ParsedRow[] = [];
      const matricCounts = new Map<string, number>();

      for (const rawRow of json) {
        const payload: Payload = {};
        const filled: string[] = [];
        const errors: string[] = [];

        for (const [rawKey, rawValue] of Object.entries(rawRow)) {
          const key = aliasMap[normalizeHeader(rawKey)];
          if (!key) continue;
          seen.add(key);
          const column = spec.columns.find((c) => c.key === key)!;
          const { value, error } = coerce(column.type, rawValue);
          if (error) {
            errors.push(`${column.label}: ${error}`);
            continue;
          }
          if (value === undefined) continue;
          payload[key] = value;
          filled.push(key);
        }

        for (const column of spec.columns) {
          if (column.required && payload[column.key] === undefined)
            errors.push(`Missing ${column.label}`);
        }

        const matric = payload.matric_no as string | undefined;
        if (matric) matricCounts.set(matric, (matricCounts.get(matric) ?? 0) + 1);

        parsed.push({ payload, filled, errors });
      }

      // Nothing beyond matric_no mapped means the headers didn't match.
      const dataColumns = [...seen].filter((k) => k !== "matric_no");
      if (dataColumns.length === 0) {
        toast.error(
          "No data columns were recognised. Download the template to see the expected headers."
        );
        reset();
        return;
      }

      // Both tables have a foreign key to a_students — check before writing,
      // or one bad matric number rejects the whole batch.
      const candidates = [
        ...new Set(
          parsed
            .map((r) => r.payload.matric_no as string | undefined)
            .filter((m): m is string => Boolean(m))
        )
      ];
      const existing = await findExistingMatrics(candidates);

      for (const row of parsed) {
        const matric = row.payload.matric_no as string | undefined;
        if (!matric) continue;
        if ((matricCounts.get(matric) ?? 0) > 1)
          row.errors.push("Duplicate in file");
        if (!existing.has(matric)) row.errors.push("No such student");
        if (row.filled.filter((k) => k !== "matric_no").length === 0)
          row.errors.push("No values to write");
      }

      setRows(parsed);
      setMappedColumns(["matric_no", ...dataColumns]);
    } catch (error) {
      toast.error(`Could not read file: ${(error as Error).message}`);
      reset();
    } finally {
      setReading(false);
    }
  };

  const handleWrite = async () => {
    if (validRows.length === 0) return;
    setWriting(true);

    const now = new Date().toISOString();
    const stamped = validRows.map((row) => ({
      ...row,
      payload: { ...row.payload, updated_at: now },
      filled: [...row.filled, "updated_at"]
    }));

    let written = 0;
    for (const batch of groupBySignature(stamped)) {
      const { error } = await supabase
        .from(spec.table)
        .upsert(batch, { onConflict: "matric_no" });
      if (error) {
        setWriting(false);
        toast.error(`Import failed after ${written} rows: ${error.message}`);
        return;
      }
      written += batch.length;
    }

    setWriting(false);
    toast.success(`Updated ${written} row${written !== 1 ? "s" : ""}.`);
    reset();
  };

  const previewColumns = spec.columns.filter((c) => mappedColumns.includes(c.key));

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{spec.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{spec.blurb}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={handleDownloadTemplate}>
          Download Template
        </Button>
        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="max-w-xs cursor-pointer"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={reading || writing}
        />
        {fileName && (
          <span className="text-sm text-muted-foreground">{fileName}</span>
        )}
        {reading && (
          <span className="text-sm text-muted-foreground">Reading…</span>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          Matches on <strong>Matric No</strong>: an existing row is updated, a
          missing one is created. Column order does not matter and unrecognised
          columns are ignored.{" "}
          <strong>Blank cells are left untouched</strong> — they never overwrite
          a stored value.
        </p>
        <ul className="mt-2 space-y-0.5">
          {spec.columns.map((c) => (
            <li key={c.key}>
              <span className="font-medium text-foreground">{c.label}</span>
              {c.required && " (required)"}
              {c.hint && ` — ${c.hint}`}
            </li>
          ))}
        </ul>
      </div>

      {rows.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-green-600">
              {validRows.length} ready
            </span>
            {invalidCount > 0 && (
              <span className="font-medium text-destructive">
                {invalidCount} row{invalidCount !== 1 ? "s" : ""} skipped
              </span>
            )}
            <span className="text-muted-foreground">
              Writing:{" "}
              {previewColumns
                .filter((c) => c.key !== "matric_no")
                .map((c) => c.label)
                .join(", ")}
            </span>
          </div>

          <div className="max-h-96 overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  {previewColumns.map((c) => (
                    <TableHead key={c.key} className="whitespace-nowrap">
                      {c.label}
                    </TableHead>
                  ))}
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => {
                  const ok = row.errors.length === 0;
                  return (
                    <TableRow
                      key={i}
                      className={ok ? "" : "bg-red-50 dark:bg-red-950/30"}
                    >
                      <TableCell>{i + 1}</TableCell>
                      {previewColumns.map((c) => {
                        const value = row.payload[c.key];
                        return (
                          <TableCell key={c.key} className="whitespace-nowrap">
                            {value === undefined ? (
                              <span className="text-muted-foreground">—</span>
                            ) : typeof value === "boolean" ? (
                              value ? "Yes" : "No"
                            ) : (
                              String(value)
                            )}
                          </TableCell>
                        );
                      })}
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

          <div className="flex items-center gap-3">
            <Button
              onClick={handleWrite}
              disabled={writing || validRows.length === 0}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {writing
                ? "Saving…"
                : `Update ${validRows.length} Row${
                    validRows.length !== 1 ? "s" : ""
                  }`}
            </Button>
            <Button variant="outline" onClick={reset} disabled={writing}>
              Clear
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- the specs -- */

const MATRIC_COLUMN: ImportColumn = {
  key: "matric_no",
  label: "Matric No",
  type: "text",
  required: true,
  aliases: ["matric", "matricnumber", "matricnum", "studentid", "student"]
};

export const LMS_ACTIVITY_SPEC: ImportSpec = {
  table: "a_lms_activity",
  title: "LMS activity",
  blurb:
    "Update course participation, visits and last login from a CN export. Writes to a_lms_activity.",
  templateName: "lms_activity_template.xlsx",
  sheetName: "LMS Activity",
  columns: [
    MATRIC_COLUMN,
    {
      key: "cp_w1",
      label: "CP Week 1",
      type: "number",
      aliases: ["cpw1", "w1", "week1", "cp1", "participationw1"],
      hint: "0–1 fraction; a value ending in % is divided by 100"
    },
    {
      key: "cp_w2",
      label: "CP Week 2",
      type: "number",
      aliases: ["cpw2", "w2", "week2", "cp2", "participationw2"]
    },
    {
      key: "cp_w3",
      label: "CP Week 3",
      type: "number",
      aliases: ["cpw3", "w3", "week3", "cp3", "participationw3"]
    },
    {
      key: "latest_cp",
      label: "Latest CP",
      type: "number",
      aliases: ["latestcp", "cp", "currentcp", "participation"]
    },
    {
      key: "course_visits",
      label: "Course Visits",
      type: "number",
      aliases: ["coursevisits", "visits", "totalvisits"]
    },
    {
      key: "last_login_at",
      label: "Last Login",
      type: "timestamp",
      aliases: ["lastloginat", "lastlogin", "lastlogindate", "logindate"],
      hint: "any date Excel or JS can read"
    }
  ],
  sample: {
    "Matric No": "MC260139329",
    "CP Week 1": 0.12,
    "CP Week 2": 0.34,
    "CP Week 3": 0.51,
    "Latest CP": 0.51,
    "Course Visits": 24,
    "Last Login": "2026-10-01"
  }
};

export const PAYMENTS_SPEC: ImportSpec = {
  table: "a_payments",
  title: "Payment information",
  blurb:
    "Update payment mode, status and PTPTN proof from a finance export. Writes to a_payments.",
  templateName: "payment_update_template.xlsx",
  sheetName: "Payments",
  columns: [
    MATRIC_COLUMN,
    {
      key: "payment_mode",
      label: "Payment Mode",
      type: "text",
      aliases: ["paymentmode", "mode", "paymenttype"],
      hint: "e.g. PTPTN, SELF, EPF"
    },
    {
      key: "payment_status",
      label: "Payment Status",
      type: "text",
      aliases: ["paymentstatus", "status"],
      hint: "e.g. Paid, Pending, Not Paid"
    },
    {
      key: "ptptn_proof_status",
      label: "PTPTN Proof",
      type: "boolean",
      aliases: ["ptptnproofstatus", "ptptnproof", "proof"],
      hint: "true/false, yes/no or 1/0"
    },
    {
      key: "ol_accepted",
      label: "Offer Letter Accepted",
      type: "boolean",
      aliases: ["olaccepted", "offerletter", "offerletteraccepted", "ol"],
      hint: "true/false; leave blank to keep the current answer"
    }
  ],
  sample: {
    "Matric No": "MC260139329",
    "Payment Mode": "PTPTN",
    "Payment Status": "Pending",
    "PTPTN Proof": "TRUE",
    "Offer Letter Accepted": "TRUE"
  }
};
