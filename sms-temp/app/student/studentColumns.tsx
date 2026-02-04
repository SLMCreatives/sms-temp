"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

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

export type Students = {
  matric_no: string;
  full_name: string;
  email: string;
  phone: string;
  programme_code: string;
  programme_name: string;
  faculty_code: string;
  status: string;
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
  nov25_lms_activity: LMSActivity;
  nov25_lms_activity_w1: LMSActivity;
  nov25_engagements: Engagements[];
  sept25_engagements: Engagements[];
  engagements_union_all: Engagements[];
  lms_activity_union_all: LMSActivity;
  jan26_payment: {
    id: string;
    matric_no: string;
    payment_mode: string;
    payment_status: string;
    proof: string;
  };
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
    accessorKey: "id",
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
    accessorKey: "full_name",
    header: "Full Name"
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
