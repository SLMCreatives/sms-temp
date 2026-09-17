"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ContactRound, Users, UserRound } from "lucide-react";

import { DataTable } from "./data-table";
import { newStudentColumns, initialsOf } from "./studentColumns";
import NewStudentList from "@/components/new/student-list";
import { StudentDashboardRow } from "@/lib/types/database";
import { SST_MEMBERS, SstMember } from "@/lib/sst-members";
import { INTAKES } from "@/lib/intakes";
import { useIntake } from "@/components/new/intake-context";

export type { Intake } from "@/lib/intakes";

type Scope = "mine" | "all";

interface StudentWorkspaceProps {
  data: StudentDashboardRow[];
  /** SST identity of the signed-in user, if they are on the roster. */
  currentSst: SstMember | null;
  isManager: boolean;
  /**
   * Set on /student/sst/[member]: the list is pinned to that member and the
   * mine/all toggle is hidden.
   */
  lockedSst?: SstMember | null;
  title?: string;
  subtitle?: string;
}

/** Segmented control used for both the intake switch and the scope switch. */
function Segmented<T extends string>({
  value,
  onChange,
  options
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: React.ElementType }[];
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function StudentWorkspace({
  data,
  currentSst,
  isManager,
  lockedSst = null,
  title = "Students",
  subtitle
}: StudentWorkspaceProps) {
  const { intake, setIntake } = useIntake();
  // Default to the signed-in member's own students; managers and anyone not on
  // the roster start on the full list because "mine" would be empty for them.
  const [scope, setScope] = React.useState<Scope>(
    currentSst && !isManager ? "mine" : "all"
  );

  const scopedSst = lockedSst ?? (scope === "mine" ? currentSst : null);

  const visibleData = React.useMemo(() => {
    return data.filter((student) => {
      if (student.intake_code !== intake) return false;
      if (scopedSst && student.sst_id !== scopedSst.id) return false;
      return true;
    });
  }, [data, intake, scopedSst]);

  const scopeLabel = scopedSst
    ? `${scopedSst.name}'s students`
    : "All students";

  // Downloads the students in the current scope as a .vcf. Scoped by intake and
  // owner — not by the table's column filters — so the label says what it does.
  const contactsHref =
    `/student/contacts?intake=${encodeURIComponent(intake)}` +
    (scopedSst ? `&sst=${scopedSst.id}` : "");
  const contactsWithPhone = visibleData.filter(
    (s) => s.phone || s.email
  ).length;

  return (
    <div className="flex w-full flex-col gap-3 xl:min-h-0 xl:flex-1">
      <header className="flex flex-col gap-2 xl:shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {lockedSst && (
              <Link
                href="/student"
                aria-label="Back to all students"
                className="grid h-9 w-9 place-items-center rounded-lg border text-muted-foreground transition hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}
            {lockedSst && (
              <span
                className={`grid h-9 w-9 place-items-center rounded-full text-xs font-semibold ${lockedSst.badgeClass}`}
              >
                {initialsOf(lockedSst.name)}
              </span>
            )}
            <div>
              <h1 className="text-lg font-semibold leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {subtitle ?? "Student Success Team · engagement workspace"}
              </p>
            </div>
          </div>

          <Segmented
            value={intake}
            onChange={setIntake}
            options={INTAKES.map((i) => ({ value: i.value, label: i.label }))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b pb-2">
          {!lockedSst && currentSst && (
            <Segmented<Scope>
              value={scope}
              onChange={setScope}
              options={[
                { value: "mine", label: "My students", icon: UserRound },
                { value: "all", label: "All students", icon: Users }
              ]}
            />
          )}

          <a
            href={contactsHref}
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/25 hover:text-foreground"
            title={`Save ${contactsWithPhone} contacts to your phone as a .vcf file`}
          >
            <ContactRound className="h-3.5 w-3.5" />
            Save contacts
            <span className="tabular-nums opacity-60">
              {contactsWithPhone}
            </span>
          </a>

          <nav className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Team
            </span>
            {SST_MEMBERS.map((member) => {
              const active = lockedSst?.id === member.id;
              return (
                <Link
                  key={member.id}
                  href={`/student/sst/${member.slug}`}
                  className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs transition ${
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold ${member.badgeClass}`}
                  >
                    {initialsOf(member.name)}
                  </span>
                  {member.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="lg:hidden">
        <NewStudentList data={visibleData} />
      </div>

      <div className="hidden lg:block xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
        <DataTable
          data={visibleData}
          columns={newStudentColumns}
          showSstFilter={!scopedSst}
          scopeLabel={scopeLabel}
        />
      </div>
    </div>
  );
}
