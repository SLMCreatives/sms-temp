"use client";

import { WhatsAppCell } from "@/components/new/whatsapp-cell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StudentDashboardRow } from "@/lib/types/database";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckCheck,
  Laptop,
  MessageCircle,
  Phone,
  School,
  TriangleAlert,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { getSstById } from "@/lib/sst-members";
import {
  getStudentLevel,
  levelGroupOf,
  parseLevelGroupFilter
} from "@/lib/student-level";
import {
  checkDotClass,
  checkStateLabel,
  getChecks,
  getProgress,
  isSegmentPending
} from "@/lib/student-progress";

export type Engagements = {
  [x: string]: string | number | Date;
  id: string;
  matric_no: string;
  channel: string;
  direction: string;
  subject: string;
  body: string;
  handled_by: string;
  sentiment: string;
  outcome: string;
  next_action_date: string;
  created_at: string;
};

export type Comments = {
  id: string;
  engagement_id: string;
  created_at: string;
  created_by: string;
  comment: string;
  likes: number;
  parent_id: string;
  user_id: string;
};

export type LMSActivity = {
  matric_no: string;
  last_login_at: string;
  total_minutes: number;
  course_progress: number;
  submitted_assignments: number;
  srb_progress: number;
  updated_at: string;
};

export type Payment = {
  id: string;
  matric_no: string;
  payment_mode: string;
  payment_status: string;
  proof: string;
};

export type SSTMember = {
  id: string;
  full_name: string;
  is_active: boolean;
  email: string;
  phone: string;
  role: string;
  max_load: number;
  nickname: string;
  current_week_count: number;
};

export type Students = {
  matric_no: string;
  full_name: string;
  email: string;
  phone: string;
  programme_code: string;
  programme_name: string;
  faculty_code: string;
  status: string;
  sst_id: number;
  admission_date: string;
  nationality: string;
  entry_type: string;
  study_mode: string;
  study_level: string;
  engagements: Engagements[];
  lms_activity: LMSActivity;
  lms_activity_w1: LMSActivity;
  lms_activity_w2: LMSActivity;
  lms_activity_w3: LMSActivity;
  lms_activity_w4: LMSActivity;
  jan26_lms_activity: LMSActivity;
  jan26_lms_activity_w1: LMSActivity;
  jan26_lms_activity_w2: LMSActivity;
  jan26_engagements: Engagements[];
  jan26_c_engagements: Engagements[];
  nov25_lms_activity: LMSActivity;
  nov25_lms_activity_w1: LMSActivity;
  nov25_engagements: Engagements[];
  sept25_engagements: Engagements[];
  engagements_union_all: Engagements[];
  lms_activity_union_all: LMSActivity;
  jan26_payment: Payment;
  jan26_c_payment: Payment;
  nov25_payment: Payment;
};

export type ProgressionStudents = {
  matric_no: string;
  full_name: string;
  email: string;
  phone: string;
  faculty_code: string;
  nationality: string;
  study_mode: string;
  study_level: string;
  programme_name: string;
  ec_name: string;
  ec_number: string;
  engagement_status: string;
  registration_status: string;
};

export const studentColumns: ColumnDef<Students>[] = [
  {
    header: "No.",
    accessorKey: "index",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableColumnFilter: false,
    size: 10
  },
  {
    accessorKey: "matric_no",
    header: "Matrix ID"
  },
  {
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 max-w-[100px]">
          <div>{row.getValue("full_name")}</div>
        </div>
      );
    },
    size: 30
  },
  {
    accessorKey: "programme_code",
    header: "Programme"
  },
  {
    accessorKey: "faculty_code",
    header: "Faculty"
  },
  {
    accessorKey: "status",
    header: "Status"
  },
  {
    header: "Contact",
    accessorKey: "phone",
    cell: ({ row }) => {
      const phoneNo = row.getValue("phone");
      const formattedPhone = (phoneNo as string).replace(/[-]/g, "");
      return (
        <div className="flex items-center gap-2">
          <Button variant="link" size={"icon"} asChild>
            <Link
              href={`tel:6${formattedPhone}`}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              <Phone className="h-5 w-5 text-cyan-500" />
            </Link>
          </Button>
          <Button variant="link" size={"icon"} asChild>
            <Link
              href={`https://wa.me/6${formattedPhone}`}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
            </Link>
          </Button>
        </div>
      );
    }
  }
];

/** Two-letter monogram for the row avatar. */
export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic avatar tint so the same student keeps the same colour. */
const AVATAR_TINTS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-200"
];

function tintFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

/** Small coloured dot + label, quieter than a filled pill on every row. */
function StatusDot({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={`h-1.5 w-1.5 rounded-full ${tone}`} />
      <span className="text-[11px]">{label}</span>
    </span>
  );
}

/** Weekly course-progress cell: a thin bar with the value beneath it. */
function ProgressCell({ value }: { value: number }) {
  const pct = Math.round((value ?? 0) * 100);
  const bar =
    pct === 0
      ? "bg-red-400 dark:bg-red-500"
      : pct < 40
        ? "bg-amber-400 dark:bg-amber-500"
        : "bg-emerald-400 dark:bg-emerald-500";
  return (
    <div className="flex flex-col items-center gap-1 min-w-[42px]">
      <div className="h-1 w-9 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${Math.max(pct, pct === 0 ? 0 : 4)}%` }}
        />
      </div>
      <span
        className={`text-[10px] tabular-nums ${
          pct === 0 ? "text-red-600 dark:text-red-400 font-semibold" : "text-muted-foreground"
        }`}
      >
        {pct}%
      </span>
    </div>
  );
}

export const newStudentColumns: ColumnDef<StudentDashboardRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 32
  },
  {
    accessorKey: "full_name",
    id: "name",
    header: "Student",
    enableHiding: false,
    cell: ({ row }) => {
      const s = row.original;
      const lms = s.a_lms_activity;
      const zeroLogin = s.study_mode === "Online" && (lms?.course_visits ?? 0) === 0;
      return (
        <div className="flex items-center gap-2.5 min-w-[210px]">
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${tintFor(
              s.matric_no ?? s.full_name
            )}`}
          >
            {initialsOf(s.full_name)}
          </span>
          <span className="flex flex-col min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-medium capitalize text-foreground">
                {s.full_name?.toLowerCase()}
              </span>
              {s.at_risk && (
                <TriangleAlert
                  aria-label="Flagged at risk"
                  className="h-3 w-3 shrink-0 text-amber-500"
                />
              )}
              {zeroLogin && (
                <span
                  title="No CN logins"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
                />
              )}
            </span>
            <span className="truncate font-mono text-[10px] text-muted-foreground">
              {s.matric_no}
            </span>
          </span>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const name = String(row.getValue("name")).toLowerCase();
      const matric = String(row.original.matric_no).toLowerCase();
      const status = String(row.original.status).toLowerCase();
      const outcome = String(
        row.original.a_engagements?.at(-1)?.outcome
      ).toLowerCase();

      const search = String(filterValue).toLowerCase();

      return (
        name.includes(search) ||
        matric.includes(search) ||
        status.includes(search) ||
        outcome.includes(search)
      );
    }
  },
  {
    accessorKey: "campus_code",
    id: "Campus Code",
    header: "Campus",
    filterFn: "equalsString",
    cell: ({ row }) => (
      <span className="text-[11px] text-muted-foreground">
        {row.original.campus_code || "—"}
      </span>
    )
  },
  {
    accessorFn: (row) => getStudentLevel(row.programme_name) ?? "",
    id: "study_level",
    header: "Level",
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const value = String(filterValue);
      const group = parseLevelGroupFilter(value);
      if (group) return levelGroupOf(row.original.programme_name) === group;
      return getStudentLevel(row.original.programme_name) === value;
    },
    cell: ({ row }) => (
      <span className="text-[11px] text-muted-foreground">
        {getStudentLevel(row.original.programme_name) ?? "—"}
      </span>
    )
  },
  {
    accessorKey: "study_mode",
    id: "study_mode",
    header: "Mode",
    cell: ({ row }) => {
      const online = row.original.study_mode === "Online";
      const Icon = online ? Laptop : School;
      return (
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] ${
            online
              ? "text-violet-600 dark:text-violet-300"
              : "text-amber-600 dark:text-amber-300"
          }`}
        >
          <Icon className="h-3 w-3" />
          {online ? "Online" : "Conv."}
        </span>
      );
    }
  },
  {
    accessorKey: "status",
    id: "Status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      const tone =
        s === "Active"
          ? "bg-emerald-500"
          : s === "At Risk"
            ? "bg-amber-500"
            : s === "Deferred"
              ? "bg-sky-500"
              : s === "Withdraw"
                ? "bg-red-500"
                : "bg-muted-foreground";
      return <StatusDot tone={tone} label={s ?? "—"} />;
    }
  },
  {
    // Three dots mirroring the check sequence on the record panel. Not
    // sortable on purpose — the stat tiles above the table do the filtering.
    id: "checks",
    header: "Checks",
    enableSorting: false,
    filterFn: (row, _columnId, filterValue) => {
      const checks = getChecks(row.original);
      if (filterValue === "declined")
        return checks.some((c) => c.applicable && c.answer === false);
      // Every applicable step answered — a reported "no" counts, the work is
      // done either way. PTPTN students need four, everyone else three.
      if (filterValue === "complete") return getProgress(row.original).complete;
      if (
        filterValue === "contacted" ||
        filterValue === "onboarding" ||
        filterValue === "login" ||
        filterValue === "ptptn"
      ) {
        return isSegmentPending(row.original, filterValue);
      }
      return true;
    },
    cell: ({ row }) => {
      const checks = getChecks(row.original);
      return (
        <span className="flex items-center justify-center gap-1">
          {checks.map((c) => (
            <span
              key={c.key}
              title={`${c.label}: ${checkStateLabel(c)}`}
              className={`h-2 w-2 rounded-full ${checkDotClass(c)}`}
            />
          ))}
        </span>
      );
    }
  },
  {
    accessorKey: "at_risk",
    id: "at_risk",
    header: "Risk",
    filterFn: (row, _columnId, filterValue) => {
      if (typeof filterValue !== "boolean") return true;
      return !!row.original.at_risk === filterValue;
    },
    cell: ({ row }) =>
      row.original.at_risk ? (
        <TriangleAlert className="h-3.5 w-3.5 text-amber-500" />
      ) : (
        <span className="text-[11px] text-muted-foreground">—</span>
      )
  },
  {
    accessorKey: "a_payments.payment_mode",
    id: "payment_mode",
    header: "Payment",
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const pm = row.original.a_payments?.payment_mode ?? "";
      const isSelf = pm.toLowerCase().includes("self");
      const isPtptn = pm.toUpperCase().includes("PTPTN");
      if (filterValue === "SELF") return isSelf;
      if (filterValue === "PTPTN") return isPtptn;
      // "Other" selects everything that isn't SELF or PTPTN (incl. blank values)
      if (filterValue === "Other") return !isSelf && !isPtptn;
      return pm === filterValue;
    },
    cell: ({ row }) => {
      const pm = row.original.a_payments?.payment_mode;
      if (!pm) return <span className="text-[11px] text-muted-foreground">—</span>;
      const cls =
        pm === "PTPTN"
          ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
          : pm.toLowerCase().includes("self")
            ? "border-sky-200 text-sky-700 dark:border-sky-800 dark:text-sky-300"
            : "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300";
      return (
        <Badge
          variant="outline"
          className={`h-5 rounded-md px-1.5 text-[10px] font-medium ${cls}`}
        >
          {pm}
        </Badge>
      );
    }
  },
  {
    accessorKey: "a_payments.ptptn_proof_status",
    id: "ptptn_proof_status",
    header: "Proof",
    filterFn: (row, _columnId, filterValue) => {
      if (typeof filterValue !== "boolean") return true;
      return !!row.original.a_payments?.ptptn_proof_status === filterValue;
    },
    cell: ({ row }) => {
      const isPTPTN = row.original.a_payments?.payment_mode === "PTPTN";
      const approved = row.original.a_payments?.ptptn_proof_status;
      if (!isPTPTN) {
        return (
          <span className="text-[11px] text-muted-foreground">
            {row.original.a_payments?.payment_status ?? "—"}
          </span>
        );
      }
      return approved ? (
        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-500" />
      );
    }
  },
  {
    accessorKey: "a_lms_activity.course_visits",
    id: "course_visits",
    header: ({ column }) => (
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Visits
        <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    filterFn: (row, _columnId, filterValue) => {
      // Used by the "Zero logins" quick filter in the toolbar.
      if (filterValue !== "zero") return true;
      return (row.original.a_lms_activity?.course_visits ?? 0) === 0;
    },
    cell: ({ row }) => {
      const visits = row.original.a_lms_activity?.course_visits ?? 0;
      const cls =
        visits === 0
          ? "text-red-600 dark:text-red-400 font-semibold"
          : visits < 5
            ? "text-amber-600 dark:text-amber-400 font-medium"
            : "text-foreground";
      return <span className={`tabular-nums text-[11px] ${cls}`}>{visits}</span>;
    }
  },
  {
    accessorKey: "a_lms_activity.cp_w1",
    id: "CP W1",
    header: "W1",
    cell: ({ row }) => <ProgressCell value={row.original.a_lms_activity?.cp_w1 ?? 0} />
  },
  {
    accessorKey: "a_lms_activity.cp_w2",
    id: "CP W2",
    header: "W2",
    cell: ({ row }) => <ProgressCell value={row.original.a_lms_activity?.cp_w2 ?? 0} />
  },
  {
    accessorKey: "a_lms_activity.cp_w3",
    id: "CP W3",
    header: "W3",
    cell: ({ row }) => <ProgressCell value={row.original.a_lms_activity?.cp_w3 ?? 0} />
  },
  {
    accessorKey: "a_engagements",
    id: "No of Engagements",
    header: "Eng.",
    filterFn: (row, _columnId, filterValue) => {
      // Used by the "Never engaged" quick filter in the toolbar.
      if (filterValue !== "none") return true;
      return (row.original.a_engagements?.length ?? 0) === 0;
    },
    cell: ({ row }) => {
      const count = row.original.a_engagements?.length ?? 0;
      return (
        <span
          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[10px] font-semibold tabular-nums ${
            count === 0
              ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300"
              : "bg-muted text-foreground"
          }`}
        >
          {count}
        </span>
      );
    }
  },
  {
    accessorKey: "a_engagements",
    id: "Outcome",
    header: ({ column }) => (
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last outcome
        <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ row }) => {
      const outcome = row.original.a_engagements?.at(-1)?.outcome;
      return (
        <span className="block max-w-[130px] truncate text-[11px] text-muted-foreground">
          {outcome ? outcome.replace(/[._-]/g, " ") : "—"}
        </span>
      );
    }
  },
  {
    accessorKey: "sst_id",
    id: "sst_id",
    header: "Owner",
    cell: ({ row }) => {
      const member = getSstById(row.original.sst_id);
      if (!member) {
        return <span className="text-[11px] text-muted-foreground">—</span>;
      }
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold ${member.badgeClass}`}
          >
            {initialsOf(member.name)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {member.name}
          </span>
        </span>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: "equalsString"
  },
  {
    id: "WhatsApp",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex justify-end pr-1">
        <WhatsAppCell
          phone={row.original.phone}
          studentName={row.original.full_name}
        />
      </div>
    ),
    size: 40
  }
];
