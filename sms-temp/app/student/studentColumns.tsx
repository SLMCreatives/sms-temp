"use client";

import NewChangePaymentForm from "@/components/new/change-payment";
import NewChangePTPTNStatusForm from "@/components/new/change-ptptn-status";
import NewChangeSSTForm from "@/components/new/change-sst";
import NewChangeStatusForm from "@/components/new/change-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { StudentDashboardRow } from "@/lib/types/database";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRightCircle,
  ArrowUpDown,
  MessageCircle,
  Phone
} from "lucide-react";
import Link from "next/link";

type SSTID = "1" | "2" | "3" | "4";

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
    size: 10
  },
  {
    header: "Intake",
    accessorKey: "intake_code",
    cell: ({ row }) => {
      return <div>{row.original.intake_code}</div>;
    },
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    accessorKey: "matric_no",
    header: "Matrix ID"
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-2 w-[250px] overflow-hidden">
              <div>{row.getValue("full_name")}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <div>{row.getValue("full_name")}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }
  },
  {
    accessorKey: "study_mode",
    header: "Study Mode",
    cell: ({ row }) => {
      return (
        <div className="text-center w-full">
          <Badge
            variant={"default"}
            className={`${row.original.study_mode === "Online" ? "bg-emerald-500" : "bg-cyan-500"}`}
          >
            {row.original.study_mode === "Online" ? "O" : "C"}
          </Badge>
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: ({}) => {
      return <div className="flex items-center justify-center">Status</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex text-center justify-center text-xs w-20">
          {" "}
          <NewChangeStatusForm
            matric_no={row.original.matric_no}
            current_status={row.original.status}
          />
        </div>
      );
    }
  },
  {
    accessorKey: "a_lms_activity.course_visits",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Course Visits
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-center w-full">
          {row.original.a_lms_activity?.course_visits}
        </div>
      );
    }
  },
  {
    accessorKey: "a_lms_activity.cp_w1",
    header: "CP W1",
    cell: ({ row }) => {
      return (
        <div className="text-center w-full">
          {row.original.a_lms_activity?.cp_w1
            ? (row.original.a_lms_activity?.cp_w1 * 100).toFixed(0) + "%"
            : "-"}
        </div>
      );
    }
  },
  {
    accessorKey: "a_lms_activity.cp_w2",
    header: "CP W2",
    cell: ({ row }) => {
      return (
        <div className="text-center w-full">
          {row.original.a_lms_activity?.cp_w2
            ? (row.original.a_lms_activity?.cp_w2 * 100).toFixed(0) + "%"
            : "-"}
        </div>
      );
    }
  },
  {
    accessorKey: "a_lms_activity.cp_w3",
    header: "CP W3",
    cell: ({ row }) => {
      return (
        <div className="text-center w-full">
          {row.original.a_lms_activity?.cp_w3
            ? (row.original.a_lms_activity?.cp_w3 * 100).toFixed(0) + "%"
            : "-"}
        </div>
      );
    }
  },
  {
    accessorKey: "a_payments.payment_mode",
    id: "payment_mode",
    header: ({}) => {
      return (
        <div className="w-full items-center justify-center">
          <p>Payment Mode</p>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-2">
          {/* <Badge className="text-xs group" variant={"outline"}>
            {row.original.a_payments?.payment_mode}
          </Badge> */}
          <NewChangePaymentForm
            matric_no={row.original.matric_no}
            payment_mode={row.original.a_payments?.payment_mode as string}
          />
        </div>
      );
    }
  },
  {
    accessorKey: "a_payments.ptptn_proof_status",
    id: "ptptn_proof_status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PTPTN Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center w-full gap-2">
          {row.original.a_payments?.payment_mode === "PTPTN" ? (
            <NewChangePTPTNStatusForm
              matric_no={row.original.matric_no}
              ptptn_proof_status={
                row.original.a_payments?.ptptn_proof_status as boolean
              }
            />
          ) : (
            <div className="flex items-center justify-center w-full text-xs">
              {row.original.a_payments?.payment_status}
            </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "sst_id",
    id: "sst_id",
    header: "Assigned SST",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center">
          <NewChangeSSTForm
            matric_no={row.original.matric_no}
            sst_id={row.original.sst_id?.toString() as SSTID}
          />
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: "equalsString"
  },
  {
    accessorKey: "a_engagements",
    header: ({} = {}) => {
      return (
        <div className="w-full items-center justify-center">
          <p>Engagements</p>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center text-xs">
          {row.original.a_engagements?.length}
        </div>
      );
    }
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center w-full">
          <Button variant={"ghost"} size={"sm"} asChild>
            <Link href={`/student/${row.original.matric_no}`} target="_blank">
              <ArrowRightCircle className="h-8 w-8" />
            </Link>
          </Button>
        </div>
      );
    }
  }
];
