"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, List, UserSearch } from "lucide-react";

import FiltersSection, {
  ALL,
  emptyFilters,
  MobileFilters,
  STUDY_MODES
} from "./filters-section";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "../ui/drawer";
import { NewStudentCard } from "./student-card";
import { StudentDashboardRow } from "@/lib/types/database";
import {
  LEVEL_GROUPS,
  getStudentLevel,
  levelGroupOf
} from "@/lib/student-level";
import {
  CHECK_SEGMENTS,
  checkDotClass,
  checkStateLabel,
  getChecks,
  getProgress,
  isSegmentPending,
  SegmentKey
} from "@/lib/student-progress";
import { initialsOf } from "@/app/student/studentColumns";

type View = "board" | "list";

/** One column per step in the sequence, then everything. */
const BOARD_COLUMNS: { key: SegmentKey | "all"; label: string }[] = [
  ...CHECK_SEGMENTS.map((s) => ({ key: s.value, label: s.label })),
  { key: "all" as const, label: "All students" }
];

/** The check sequence as coloured dots. */
function CheckDots({ student }: { student: StudentDashboardRow }) {
  const checks = getChecks(student);
  return (
    <span className="flex items-center gap-1">
      {checks.map((c) => (
        <span
          key={c.key}
          title={`${c.label}: ${checkStateLabel(c)}`}
          className={`h-2 w-2 rounded-full ${checkDotClass(c)}`}
        />
      ))}
    </span>
  );
}

function StudentTile({
  student,
  onOpen
}: {
  student: StudentDashboardRow;
  onOpen: () => void;
}) {
  const progress = getProgress(student);
  const level = getStudentLevel(student.programme_name);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl border bg-card p-2.5 text-left transition active:scale-[0.99]"
    >
      <div className="flex items-start gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
          {initialsOf(student.full_name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium capitalize leading-tight">
            {student.full_name?.toLowerCase()}
          </p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">
            {student.matric_no}
          </p>
        </div>
        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
          {progress.done}/{progress.total}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <CheckDots student={student} />
        <span className="flex min-w-0 items-center gap-1">
          {level && (
            <span className="truncate rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
              {level}
            </span>
          )}
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
            {student.study_mode === "Online" ? "Online" : "Conv."}
          </span>
        </span>
      </div>
    </button>
  );
}

export default function NewStudentList({
  data
}: {
  data: StudentDashboardRow[];
}) {
  const [view, setView] = useState<View>("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<MobileFilters>(emptyFilters);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [selectedMatric, setSelectedMatric] = useState<string | null>(null);
  const observerTarget = useRef(null);

  const matchesQuery = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (student: StudentDashboardRow) =>
      !query ||
      !!student.full_name?.toLowerCase().includes(query) ||
      !!student.matric_no?.toLowerCase().includes(query);
  }, [searchQuery]);

  // Anything not "Online" counts as Conventional, matching the rest of the app.
  const modeOf = (student: StudentDashboardRow) =>
    student.study_mode === "Online" ? "Online" : "Conventional";

  // Search, academic band and study mode apply to both views.
  const scoped = useMemo(
    () =>
      data.filter(
        (student) =>
          matchesQuery(student) &&
          (filters.group === ALL ||
            levelGroupOf(student.programme_name) === filters.group) &&
          (filters.mode === ALL || modeOf(student) === filters.mode)
      ),
    [data, matchesQuery, filters.group, filters.mode]
  );

  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL]: scoped.length };
    for (const s of CHECK_SEGMENTS) {
      counts[s.value] = scoped.filter((st) =>
        isSegmentPending(st, s.value)
      ).length;
    }
    return counts;
  }, [scoped]);

  // Band counts respect the mode filter and vice versa, so each row shows what
  // picking it would actually yield.
  const groupCounts = useMemo(() => {
    const base = data.filter(
      (s) =>
        matchesQuery(s) && (filters.mode === ALL || modeOf(s) === filters.mode)
    );
    const counts: Record<string, number> = { [ALL]: base.length };
    for (const g of LEVEL_GROUPS) {
      counts[g.value] = base.filter(
        (s) => levelGroupOf(s.programme_name) === g.value
      ).length;
    }
    return counts;
  }, [data, matchesQuery, filters.mode]);

  const modeCounts = useMemo(() => {
    const base = data.filter(
      (s) =>
        matchesQuery(s) &&
        (filters.group === ALL ||
          levelGroupOf(s.programme_name) === filters.group)
    );
    const counts: Record<string, number> = { [ALL]: base.length };
    for (const m of STUDY_MODES) {
      counts[m.value] = base.filter((s) => modeOf(s) === m.value).length;
    }
    return counts;
  }, [data, matchesQuery, filters.group]);

  // List view additionally honours the segment chips.
  const listStudents = useMemo(() => {
    const segment = filters.segment;
    if (segment === ALL) return scoped;
    return scoped.filter((s) => isSegmentPending(s, segment));
  }, [scoped, filters.segment]);

  const visibleStudents = useMemo(
    () => listStudents.slice(0, displayLimit),
    [listStudents, displayLimit]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < listStudents.length) {
          setDisplayLimit((prev) => prev + 20);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [displayLimit, listStudents.length]);

  useEffect(() => {
    setDisplayLimit(20);
  }, [searchQuery, filters, view]);

  // Re-read the selected student from props so the drawer reflects a check the
  // moment router.refresh() lands, instead of holding a stale snapshot.
  const selected = selectedMatric
    ? (data.find((s) => s.matric_no === selectedMatric) ?? null)
    : null;

  const views: { value: View; label: string; icon: React.ElementType }[] = [
    { value: "board", label: "Board", icon: LayoutGrid },
    { value: "list", label: "List", icon: List }
  ];

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">
            {view === "board" ? scoped.length : listStudents.length}
          </span>{" "}
          of {data.length} students
        </p>

        <div className="inline-flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
          {views.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setView(option.value)}
              aria-pressed={view === option.value}
              className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[11px] font-medium transition ${
                view === option.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <option.icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <FiltersSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        segmentCounts={segmentCounts}
        groupCounts={groupCounts}
        modeCounts={modeCounts}
        showSegments={view === "list"}
      />

      {view === "board" ? (
        // Swipeable columns — one segment fills the screen at a time.
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {BOARD_COLUMNS.map((column) => {
            const key = column.key;
            const students =
              key === "all"
                ? scoped
                : scoped.filter((s) => isSegmentPending(s, key));
            return (
              <section
                key={column.key}
                className="flex w-[82vw] max-w-[320px] shrink-0 snap-start flex-col rounded-xl border bg-muted/20 sm:w-[300px]"
              >
                <header className="flex items-center justify-between gap-2 border-b px-3 py-2">
                  <h3 className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {column.label}
                  </h3>
                  <span className="shrink-0 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                    {students.length}
                  </span>
                </header>

                <div className="flex max-h-[62vh] flex-col gap-2 overflow-y-auto p-2">
                  {students.length === 0 ? (
                    <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
                      Nothing here.
                    </p>
                  ) : (
                    students
                      .slice(0, 50)
                      .map((student) => (
                        <StudentTile
                          key={student.matric_no}
                          student={student}
                          onOpen={() => setSelectedMatric(student.matric_no)}
                        />
                      ))
                  )}
                  {students.length > 50 && (
                    <p className="px-2 py-2 text-center text-[10px] text-muted-foreground">
                      Showing 50 of {students.length}
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleStudents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <UserSearch className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No students found</p>
              <p className="text-xs text-muted-foreground">
                Try clearing a filter or the search box.
              </p>
            </div>
          ) : (
            visibleStudents.map((student) => (
              <StudentTile
                key={student.matric_no}
                student={student}
                onOpen={() => setSelectedMatric(student.matric_no)}
              />
            ))
          )}
          <div ref={observerTarget} className="h-4" />
        </div>
      )}

      {/*
        One controlled drawer for the whole list. The previous version mounted a
        Drawer per row, which meant 20+ dialogs in the tree at once.
      */}
      <Drawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelectedMatric(null)}
      >
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{selected?.full_name ?? "Student"} — record</DrawerTitle>
            <DrawerDescription>
              Checks, details, payment and engagement history.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-3 pb-6">
            {selected && (
              <NewStudentCard
                student={selected}
                index={0}
                onClose={() => setSelectedMatric(null)}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
