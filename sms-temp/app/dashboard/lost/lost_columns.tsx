"use client";

import { Students } from "@/app/student/studentColumns";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowRightCircle,
  ArrowUpDown,
  Mail,
  MessageCircle,
  Phone
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import Link from "next/link";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type StudentProps = {
  student: Students[];
};

export const columns: ColumnDef<Students>[] = [
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => (
      <div className="flex items-center min-w-[150px] lg:w-[175px]">
        <div className="hidden lg:flex">
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
        </div>
        <div className="flex lg:hidden">
          <Drawer>
            <DrawerTrigger>
              <p className="text-sm leading-none text-muted-foreground truncate tracking-tighter capitalize">
                {row.original.full_name.toLocaleLowerCase()}
              </p>
            </DrawerTrigger>
            <DrawerContent className="w-full min-h-1/2 lg:max-w-2xl mx-auto overflow-scroll">
              <div className="w-full mx-auto p-8 flex flex-col gap-2 overflow-visible min-h-full">
                <DrawerTitle className="w-full flex flex-row justify-between py-6">
                  {row.original.matric_no}
                  <div className="flex flex-row gap-4">
                    <Link
                      href={`tel:6${row.original.phone.replace(/[-]/g, "")}`}
                    >
                      <Phone className="h-6 w-6 text-cyan-500" />
                    </Link>
                    <Link
                      href={`https://wa.me/6${row.original.phone.replace(
                        /[-]/g,
                        ""
                      )}`}
                    >
                      <MessageCircle className="h-6 w-6 text-green-500" />
                    </Link>
                    <Link href={`mailto:${row.original.email}`}>
                      <Mail className="h-6 w-6 text-slate-500" />
                    </Link>
                  </div>
                </DrawerTitle>
                <p className="text-2xl font-bold line-clamp-2 ">
                  {row.original.full_name}
                </p>
                <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                  <Label
                    htmlFor="programme_code"
                    className="text-xs italic text-slate-500"
                  >
                    Programme Name
                  </Label>
                  <Input
                    name="programme_code"
                    readOnly
                    value={row.original.programme_name}
                  />
                  <Label
                    htmlFor="email"
                    className="text-xs italic text-slate-500"
                  >
                    Email
                  </Label>
                  <Input
                    name="email"
                    readOnly
                    value={row.original.email.toLocaleLowerCase()}
                  />
                  <Label
                    htmlFor="phone"
                    className="text-xs italic text-slate-500"
                  >
                    Phone No.
                  </Label>
                  <Input name="phone" readOnly value={row.original.phone} />
                  <Label
                    htmlFor="nationality"
                    className="text-xs italic text-slate-500"
                  >
                    Nationality
                  </Label>
                  <Input
                    name="nationality"
                    readOnly
                    value={row.original.nationality}
                  />
                  <Label
                    htmlFor="status"
                    className="text-xs italic text-slate-500"
                  >
                    Status
                  </Label>
                  <Input
                    name="status"
                    readOnly
                    value={row.original.status}
                    className={`w-full ${
                      row.original.status === "Active"
                        ? "text-green-500 font-bold"
                        : "text-red-500 font-bold"
                    }`}
                  />

                  <p className="text-md font-bold col-span-2">CN Activity</p>
                  <Label
                    htmlFor="lms_activity"
                    className="text-xs italic text-slate-500"
                  >
                    W3 Course Progress
                  </Label>
                  <Input
                    name="lms_activity"
                    readOnly
                    value={
                      Math.round(
                        row.original.jan26_lms_activity !== null
                          ? row.original.jan26_lms_activity.course_progress *
                              100
                          : 0
                      ) + "% (as of 6/10/25)"
                    } //row.original.lms_activity.course_progress * 100 + "%"}
                    className={`w-full ${
                      row.original.jan26_lms_activity &&
                      row.original.jan26_lms_activity.course_progress < 0.2
                        ? "text-red-500 font-bold"
                        : ""
                    }`}
                  />
                  <Label
                    htmlFor="engagement"
                    className="text-xs italic text-slate-500"
                  >
                    Tried Reaching Out
                  </Label>
                  <Input
                    name="engagement"
                    readOnly
                    value={
                      (row.original.jan26_engagements !== null
                        ? row.original.jan26_engagements.length
                        : 0) + " time(s)"
                    }
                    className={`w-full ${
                      row.original.jan26_engagements &&
                      row.original.jan26_engagements.length >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  />
                </div>
                <Link
                  href={`/student/${row.original.matric_no}`}
                  target="_blank"
                >
                  <div className="flex flex-row gap-2 justify-between w-full py-8 group hover:cursor-pointer">
                    <p className="text-md group-hover:font-bold">
                      Student Page
                    </p>
                    <div className="flex flex-row gap-2">
                      <ArrowRightCircle className="w-6 h-6 text-orange-500 group-hover:text-orange-600" />
                    </div>
                  </div>
                </Link>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
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
      const orientationDate = new Date("2026-01-10");

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
