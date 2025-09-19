"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

export type Engagements = {
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

export type LMSActivity = {
  matric_no: string;
  last_login_at: string;
  total_minutes: number;
  course_progress: number;
  submitted_assignments: number;
  srb_progress: number;
  updated_at: string;
};

export type Students = {
  matric_no: string;
  full_name: string;
  email: string;
  phone: string;
  programme_code: string;
  programme_name: string;
  faculty_code: string;
  status: "Active" | "Lost" | "Withdrawn" | "Deferred" | "change-program";
  admission_date: string;
  nationality: string;
  entry_type: string;
  study_mode: string;
  study_level: string;
  engagements: Engagements[];
  lms_activity: LMSActivity;
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
