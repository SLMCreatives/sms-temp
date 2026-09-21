"use client";

import {
  BanknoteArrowUp,
  ContactRound,
  History,
  Mail,
  MessageCircle,
  Phone,
  UserCircle,
  X
} from "lucide-react";
import Link from "next/link";

import StudentInfo from "./student-info";
import StudentPayment from "./student-payment";
import StudentChecks from "./student-checks";
import EditStudent from "./edit-student";
import StudentEngagement from "./student-engagement";
import OfferLetterToggle from "./offer-letter-toggle";
import { PanelCard } from "./panel-card";
import { StudentDashboardRow } from "@/lib/types/database";
import { getSstById } from "@/lib/sst-members";
import { initialsOf } from "@/app/student/studentColumns";
import { getStudentLevel } from "@/lib/student-level";
import { getProgress } from "@/lib/student-progress";

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
    // Stacked cards in one scroll container — the aside owns the scrolling.
    <div key={index} className="flex flex-col gap-3">
      {/* Identity ------------------------------------------------------- */}
      {/*
        Pinned to the top of the panel scroll so the name, status and quick
        actions stay visible while the sections below scroll under it.
        position:sticky is itself a positioned value, so the absolutely
        placed edit/close buttons still anchor to this card.
      */}
      <PanelCard
        bodyClassName="p-3"
        className="relative xl:sticky xl:top-0 xl:z-20 xl:shadow-sm"
      >
        <div className="flex items-start gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initialsOf(student.full_name)}
          </span>
          <div className="min-w-0 flex-1 pr-12">
            <h2 className="truncate text-[14px] font-semibold capitalize leading-tight">
              {student.full_name?.toLowerCase()}
            </h2>
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              {student.matric_no}
            </p>
          </div>
          <div className="absolute right-2 top-2 flex items-center gap-0.5">
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

        <div className="mt-2.5 flex flex-wrap items-center gap-1">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
              STATUS_TONE[student.status ?? ""] ??
              "bg-muted text-muted-foreground"
            }`}
          >
            {student.status ?? "—"}
          </span>
          {level && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {level}
            </span>
          )}
          {student.campus_code && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {student.campus_code}
            </span>
          )}
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {student.study_mode === "Online" ? "Online" : "Conventional"}
          </span>
          {owner && (
            <span
              className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium ${owner.badgeClass}`}
            >
              {owner.name}
            </span>
          )}
        </div>

        <OfferLetterToggle student={student} />

        <div className="mt-2.5 grid grid-cols-4 gap-1.5">
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
          <a
            href={`/student/contacts?matric=${encodeURIComponent(student.matric_no)}`}
            title="Save this student to your phone contacts"
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px] font-medium transition ${
              phone || student.email
                ? "hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
                : "pointer-events-none opacity-40"
            }`}
          >
            <ContactRound className="h-3.5 w-3.5" />
            Save
          </a>
        </div>

        <div className="mt-2.5 grid grid-cols-3 divide-x rounded-lg border bg-muted/30">
          <div className="px-2 py-1 text-center">
            <p
              className={`text-[13px] font-semibold tabular-nums ${
                visits === 0 ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              {visits}
            </p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
              CN visits
            </p>
          </div>
          <div className="px-2 py-1 text-center">
            <p className="text-[13px] font-semibold tabular-nums">
              {Math.round((student.a_lms_activity?.latest_cp ?? 0) * 100)}%
            </p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
              Progress
            </p>
          </div>
          <div className="px-2 py-1 text-center">
            <p
              className={`text-[13px] font-semibold tabular-nums ${
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
      </PanelCard>

      {/* Details -------------------------------------------------------- */}
      <PanelCard title="Student details" icon={UserCircle} collapsible>
        <StudentInfo student={student} />
      </PanelCard>

      {/* Checks, retention risk and remarks each render their own card. */}
      <StudentChecks student={student} />

      {/* Secondary sections, collapsed so the panel stays short ---------- */}
      <PanelCard
        title="Payment"
        icon={BanknoteArrowUp}
        collapsible
        defaultOpen={false}
      >
        <StudentPayment student={student} />
      </PanelCard>

      <PanelCard
        title="Engagement history"
        icon={History}
        collapsible
        defaultOpen={false}
      >
        <StudentEngagement student={student} />
      </PanelCard>
    </div>
  );
}
