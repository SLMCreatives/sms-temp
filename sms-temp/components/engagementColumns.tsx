"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Engagements } from "@/app/student/studentColumns";

export const engagementColumns: ColumnDef<Engagements>[] = [
  {
    header: "Date/Time",
    accessorKey: "created_at",
    cell: ({ row }) => row.original.created_at.slice(5, 10)
  },
  {
    header: "Channel",
    accessorKey: "channel"
  },
  {
    header: "Handled By",
    accessorKey: "handled_by"
  },
  {
    header: "Outcome",
    accessorKey: "outcome"
  }
];
