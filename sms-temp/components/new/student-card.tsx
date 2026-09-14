"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import {
  MessageCircle,
  BanknoteArrowUp,
  History,
  ListChecks,
  Mail,
  Phone,
  UserCircle,
  X
} from "lucide-react";
import Link from "next/link";
import StudentInfo from "./student-info";
import StudentPayment from "./student-payment";
import { StudentDashboardRow } from "@/lib/types/database";
import EditStudent from "./edit-student";
import StudentEngagement from "./student-engagement";
import StudentChecks from "./student-checks";
import { getProgress } from "@/lib/student-progress";
import { getSstById } from "@/lib/sst-members";
import { initialsOf } from "@/app/student/studentColumns";
import { getStudentLevel } from "@/lib/student-level";

const tabs = [
  { value: "checks", label: "Checks", icon: ListChecks },
  { value: "information", label: "Details", icon: UserCircle },
  { value: "payment", label: "Payment", icon: BanknoteArrowUp },
  { value: "history", label: "History", icon: History }
];

const STATUS_TONE: Record<string, string> = {
  Active:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  "At Risk":
    "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  Deferred: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  Withdraw: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
};

export function NewStudentCard({
  student,
  index,
  onClose
}: {
  student: StudentDashboardRow;
  index: number;
  onClose?: () => void;
}) {
  const owner = getSstById(student.sst_id);
  const level = getStudentLevel(student.programme_name);
  const phone = student.phone?.replace(/[^0-9]/g, "") ?? "";
  const visits = student.a_lms_activity?.course_visits ?? 0;
  const progress = getProgress(student);

  return (
    <section
      key={index}
      className="flex flex-col overflow-hidden rounded-xl border bg-card"
    >
      <header className="relative flex flex-col gap-3 border-b p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initialsOf(student.full_name)}
          </span>
          <div className="min-w-0 flex-1 pr-14">
            <h2 className="truncate text-[15px] font-semibold capitalize leading-tight">
              {student.full_name?.toLowerCase()}
            </h2>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {student.matric_no}
            </p>
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-0.5">
            <EditStudent student={student} />
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close student record"
                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
              STATUS_TONE[student.status ?? ""] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {student.status ?? "—"}
          </span>
          {level && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {level}
            </span>
          )}
          {student.campus_code && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {student.campus_code}
            </span>
          )}
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {student.study_mode === "Online" ? "Online" : "Conventional"}
          </span>
          {owner && (
            <span
              className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-medium ${owner.badgeClass}`}
            >
              {owner.name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <a
            href={phone ? `https://wa.me/6${phone}` : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!phone}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px] font-medium transition ${
              phone
                ? "hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                : "pointer-events-none opacity-40"
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <Link
            href={phone ? `tel:6${phone}` : "#"}
            aria-disabled={!phone}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px] font-medium transition ${
              phone
                ? "hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
                : "pointer-events-none opacity-40"
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </Link>
          <a
            href={student.email ? `mailto:${student.email}` : undefined}
            aria-disabled={!student.email}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px] font-medium transition ${
              student.email
                ? "hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300"
                : "pointer-events-none opacity-40"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </a>
        </div>

        <div className="grid grid-cols-3 divide-x rounded-lg border bg-muted/30">
          <div className="px-2 py-1.5 text-center">
            <p
              className={`text-sm font-semibold tabular-nums ${
                visits === 0 ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              {visits}
            </p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
              CN visits
            </p>
          </div>
          <div className="px-2 py-1.5 text-center">
            <p className="text-sm font-semibold tabular-nums">
              {Math.round((student.a_lms_activity?.latest_cp ?? 0) * 100)}%
            </p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
              Progress
            </p>
          </div>
          <div className="px-2 py-1.5 text-center">
            <p
              className={`text-sm font-semibold tabular-nums ${
                progress.complete
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {progress.done}/{progress.total}
            </p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
              Checks
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="checks" className="flex flex-col">
        <TabsList className="flex shrink-0 items-center gap-0.5 border-b px-2 pt-1.5">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="group flex flex-1 flex-col items-center gap-0.5 rounded-none border-b-2 border-transparent px-1 pb-1.5 pt-1 text-[10px] font-medium text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-foreground hover:text-foreground"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="max-h-[46vh] overflow-y-auto p-4">
          <TabsContent value="checks">
            <StudentChecks student={student} />
          </TabsContent>
          <TabsContent value="information">
            <StudentInfo student={student} />
          </TabsContent>
          <TabsContent value="payment">
            <StudentPayment student={student} />
          </TabsContent>
          <TabsContent value="history">
            <StudentEngagement student={student} />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
