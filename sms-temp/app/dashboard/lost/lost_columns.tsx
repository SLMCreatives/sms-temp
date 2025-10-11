"use client";

import { Students } from "@/app/student/studentColumns";
import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type StudentProps = {
  student: Students[];
};

export const columns: ColumnDef<Students>[] = [
  {
    header: "No.",
    cell: ({ row }) => row.index + 1
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 w-[100px] overflow-clip">
        <span>{row.original.full_name}</span>
      </div>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => row.original.status.slice(0, 1)
  },
  {
    accessorKey: "admission_date",
    header: "Reg Date"
  },
  {
    header: "Wait Time",
    cell: ({ row }) => {
      const properregDate = {
        day: row.original.admission_date.split("/")[0],
        month: row.original.admission_date.split("/")[1],
        year: row.original.admission_date.split("/")[2]
      };

      const registrationDate = new Date(
        `${properregDate.year}-${properregDate.month}-${properregDate.day}`
      );
      const orientationDate = new Date("2025-09-13");

      const diffTime = () => {
        if (registrationDate > orientationDate) {
          return Math.abs(
            registrationDate.getTime() - orientationDate.getTime()
          );
        } else {
          return Math.abs(
            orientationDate.getTime() - registrationDate.getTime()
          );
        }
      };
      const diffDays = Math.ceil(diffTime() / (1000 * 60 * 60 * 24));
      const diffMonths = Math.ceil(diffTime() / (1000 * 60 * 60 * 24 * 30));
      const finalDiff = () => {
        if (registrationDate < orientationDate && diffDays < 30) {
          return `${diffDays}d`;
        } else if (registrationDate > orientationDate && diffDays < 30) {
          return `Missed ${diffDays}d`;
        } else {
          return `${diffMonths - 1}m ${diffDays - 30}d`;
        }
      };

      return (
        <div className="flex items-center justify-center">
          <span className={diffDays < 30 ? "" : "text-red-600"}>
            {finalDiff()}
          </span>
        </div>
      );
    }
  }
];
