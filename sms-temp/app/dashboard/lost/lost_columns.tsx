"use client";

import { Students } from "@/app/student/studentColumns";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div className="flex items-center w-[150px] lg:w-[175px]">
        <HoverCard>
          <HoverCardTrigger asChild>
            <p className="text-sm leading-none text-muted-foreground truncate tracking-tighter capitalize">
              {row.original.full_name.toLocaleLowerCase()}
            </p>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 flex flex-col gap-2 p-4">
            <p className="text-xl font-semibold">{row.original.full_name}</p>
            <div className="grid grid-cols-2 gap-2 justify-between">
              <Label className="text-sm">Matric No.</Label>
              <Input
                type="text"
                className="text-sm"
                readOnly
                defaultValue={row.original.matric_no}
              />
              <Label className="text-sm">Phone</Label>
              <Input
                type="text"
                className="text-sm"
                readOnly
                defaultValue={row.original.phone}
              />
            </div>
          </HoverCardContent>
        </HoverCard>
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm font-bold leading-none text-muted-foreground truncate">
              {row.original.full_name}
            </p>
          </TooltipTrigger>
          <TooltipContent>{row.original.full_name}</TooltipContent>
        </Tooltip> */}
      </div>
    )
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <p className="text-sm font-bold leading-none text-muted-foreground bg-stone-300 px-2 py-1 rounded-sm">
          {row.original.status.slice(0, 1)}
        </p>
      </div>
    )
  },
  {
    accessorKey: "admission_date",
    header: "Reg Date",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.admission_date.split("/")[0] +
          "/" +
          row.original.admission_date.split("/")[1]}
      </div>
    )
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
