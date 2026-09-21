"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getPaginationRowModel,
  ColumnPinningState,
  ColumnFiltersState,
  VisibilityState,
  getFilteredRowModel,
  getFacetedRowModel
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import * as React from "react";
import { DataTablePagination } from "@/components/ui/paginationControls";
import { NewStudentCard } from "@/components/new/student-card";
import { StudentDashboardRow } from "@/lib/types/database";
import {
  BanknoteArrowUp,
  CheckCheck,
  LogIn,
  PhoneCall,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TriangleAlert,
  UserCheck,
  Users,
  UserSearch,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SST_MEMBERS } from "@/lib/sst-members";
import {
  LEVEL_GROUPS,
  levelGroupFilterValue,
  levelOptionsFrom,
  parseLevelGroupFilter
} from "@/lib/student-level";
import { getChecks, getProgress } from "@/lib/student-progress";
import { CN_ACTIVITY_FILTERS, getCnFilter } from "@/lib/cn-activity";

const ALL = "all";

/** Readable names for ids that would otherwise show raw in the Columns menu. */
const COLUMN_LABELS: Record<string, string> = {
  sst_id: "Owner",
  checks: "Checks",
  at_risk: "At risk",
  study_level: "Level",
  study_mode: "Mode",
  payment_mode: "Payment",
  ptptn_proof_status: "Proof",
  course_visits: "CN visits",
  "No of Engagements": "Engagements"
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Show the owner filter — only useful when viewing more than one caseload. */
  showSstFilter?: boolean;
  /** Describes the current scope in the first stat card. */
  scopeLabel?: string;
}

/** Human-readable text for the active-filter chips under the toolbar. */
function filterChipLabel(id: string, value: unknown) {
  if (id === "ptptn_proof_status") return "PTPTN proof pending";
  if (id === "course_visits") return getCnFilter(value)?.chip ?? "CN activity";
  if (id === "at_risk") return "Flagged at risk";
  if (id === "No of Engagements") return "Never engaged";
  if (id === "checks") {
    if (value === "contacted") return "Not contacted yet";
    if (value === "onboarding") return "Onboarding pending";
    if (value === "login") return "Login check pending";
    if (value === "ptptn") return "PTPTN check pending";
    if (value === "declined") return "Reported not done";
    if (value === "complete") return "Fully checked";
    return "Checks incomplete";
  }
  if (id === "sst_id") {
    const member = SST_MEMBERS.find((m) => String(m.id) === String(value));
    return member ? `Owner: ${member.name}` : `Owner: ${String(value)}`;
  }
  if (id === "payment_mode") return `Payment: ${String(value)}`;
  if (id === "Campus Code") return `Campus: ${String(value)}`;
  if (id === "study_level") {
    const group = parseLevelGroupFilter(String(value));
    if (group) {
      return `Level: ${
        LEVEL_GROUPS.find((g) => g.value === group)?.label ?? group
      }`;
    }
    return `Level: ${String(value)}`;
  }
  if (id === "study_mode") return String(value);
  return String(value);
}

/**
 * A headline metric that doubles as a saved view — clicking it applies the
 * matching column filter, clicking again clears it.
 */
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  of,
  tone = "neutral",
  active = false,
  onClick
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub?: string;
  /** Denominator for the share shown next to the value. */
  of?: number;
  tone?: "neutral" | "danger" | "warning" | "success";
  active?: boolean;
  onClick?: () => void;
}) {
  const accents = {
    neutral: "text-muted-foreground",
    danger: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    success: "text-emerald-600 dark:text-emerald-400"
  };
  const activeRing = {
    neutral: "ring-foreground/30 bg-muted/50",
    danger: "ring-red-400 bg-red-50 dark:bg-red-950/40",
    warning: "ring-amber-400 bg-amber-50 dark:bg-amber-950/40",
    success: "ring-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
  };

  const interactive = typeof onClick === "function";
  const pct = of && of > 0 ? Math.round((value / of) * 100) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      aria-pressed={interactive ? active : undefined}
      title={
        interactive
          ? active
            ? "Filtering — click to clear"
            : "Click to filter"
          : undefined
      }
      className={`flex flex-col gap-1 rounded-lg border bg-card px-2.5 py-2 text-left transition ${
        interactive
          ? "cursor-pointer hover:border-foreground/25"
          : "cursor-default"
      } ${active ? `ring-2 ${activeRing[tone]}` : ""}`}
    >
      <span className="flex items-center gap-1 truncate">
        <Icon className={`h-3 w-3 shrink-0 ${accents[tone]}`} />
        <span className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </span>
      <span className="flex items-baseline gap-1.5">
        <span
          className={`text-xl font-semibold leading-none tabular-nums ${
            tone === "neutral" ? "text-foreground" : accents[tone]
          }`}
        >
          {value}
        </span>
        {pct !== null && (
          <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
            {pct}%
          </span>
        )}
      </span>
      <span className="truncate text-[10px] leading-tight text-muted-foreground">
        {sub ?? " "}
      </span>
    </button>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showSstFilter = false,
  scopeLabel = "In view"
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ["select", "name"],
    right: []
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnPinning,
      rowSelection,
      columnVisibility,
      columnFilters
    },
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    // Key rows by matric number, not by array index. With index ids a reorder
    // would leave the selection pointing at whichever student landed on that
    // index, silently swapping the record panel to someone else.
    getRowId: (row) => (row as StudentDashboardRow).matric_no,
    enableMultiRowSelection: false,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    // Lets the CN select count each option against every OTHER active filter,
    // so picking one tier does not zero out the numbers beside the others.
    getFacetedRowModel: getFacetedRowModel(),
    autoResetPageIndex: false
  });

  const rows = data as StudentDashboardRow[];
  const searchRef = React.useRef<HTMLInputElement>(null);

  // "/" focuses search, the way most CRMs do it.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        el?.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Options come from the rows in scope, so a level or campus with no students
  // never shows up as a dead end in the dropdown.
  const levelOptions = React.useMemo(() => levelOptionsFrom(rows), [rows]);
  const campusOptions = React.useMemo(
    () =>
      Array.from(
        new Set(rows.map((s) => s.campus_code).filter(Boolean) as string[])
      ).sort(),
    [rows]
  );

  const getFilter = (id: string) =>
    (table.getColumn(id)?.getFilterValue() as string) ?? ALL;
  const setFilter = (id: string, value: string) =>
    table.getColumn(id)?.setFilterValue(value === ALL ? undefined : value);

  const search = (table.getColumn("name")?.getFilterValue() as string) ?? "";
  const activeFilters = columnFilters.filter((f) => f.id !== "name");
  const hasAnything =
    activeFilters.length > 0 || search.length > 0 || sorting.length > 0;

  /** Toggles one of the metric-card quick views on or off. */
  const toggleQuickFilter = (id: string, value: unknown) => {
    const column = table.getColumn(id);
    if (!column) return;
    column.setFilterValue(column.getFilterValue() === value ? undefined : value);
  };

  const visible = table
    .getFilteredRowModel()
    .rows.map((r) => r.original as StudentDashboardRow);

  // Metrics follow the check sequence, so each tile is the next thing to work.
  // "Pending" means unanswered — a reported "no" counts as done, not outstanding.
  const notContacted = visible.filter(
    (s) => !getChecks(s)[0].answered
  ).length;
  const contacted = visible.length - notContacted;
  const onboardingPending = visible.filter((s) => {
    const c = getChecks(s);
    return c[0].answered && !c[1].answered;
  }).length;
  const loginPending = visible.filter((s) => {
    const c = getChecks(s);
    return c[1].answered && !c[2].answered;
  }).length;
  const ptptnPending = visible.filter((s) => {
    const c = getChecks(s)[3];
    return c.applicable && !c.answered;
  }).length;

  // How many came back negative, shown as the sub-label on each tile.
  const declined = [1, 2, 3].map(
    (i) =>
      visible.filter((s) => {
        const c = getChecks(s)[i];
        return c.applicable && c.answer === false;
      }).length
  );

  const ptptnApplicable = visible.filter(
    (s) => getChecks(s)[3].applicable
  ).length;
  const atRisk = visible.filter((s) => !!s.at_risk).length;
  // Confirmed zeros only — students CN has been read for and reports no visits.
  // The students we simply hold no CN data for are counted separately and put
  // in the sub-label, so the gap is visible instead of inflating the headline.
  // Counted against every filter EXCEPT this one, so each tier shows what
  // picking it would actually yield rather than collapsing to 0 once one is on.
  const cnCounts = React.useMemo(() => {
    const scope = (
      table.getColumn("course_visits")?.getFacetedRowModel().rows ?? []
    ).map((r) => r.original as StudentDashboardRow);
    const counts: Record<string, number> = { [ALL]: scope.length };
    for (const option of CN_ACTIVITY_FILTERS) {
      counts[option.value] = scope.filter(option.matches).length;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columnFilters, data]);
  // Every applicable step answered. Shown as its own tile so the team can pull
  // up the finished caseload, and subtracted for the "still outstanding" count.
  const allDone = visible.filter((s) => getProgress(s).complete).length;
  const outstanding = visible.length - allDone;

  // Once the filter is on, the visible rows ARE the not-contacted ones, so the
  // tile flips to report that instead of a "0 contacted" that reads as an error.
  const notContactedActive =
    table.getColumn("checks")?.getFilterValue() === "contacted";

  // Deliberately the unfiltered selection. getFilteredSelectedRowModel() drops
  // the row the moment it stops matching the active filter, so ticking a check
  // while filtered by that very check — "2 · Onboarding", tick onboarding —
  // unmounted the whole panel mid-edit and left the user hunting for the
  // student again. Selection is keyed by matric_no via getRowId, so it also
  // survives the realtime data swaps. The record now closes only when asked.
  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  // Lets the open record say so when it is no longer in the list behind it.
  const visibleIds = React.useMemo(
    () => new Set(visible.map((s) => s.matric_no)),
    [visible]
  );

  return (
    <div className="flex w-full flex-col gap-3 xl:min-h-0 xl:flex-1">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:shrink-0 xl:grid-cols-7">
        <MetricCard
          icon={Users}
          label={scopeLabel}
          value={visible.length}
          of={data.length}
          sub={outstanding ? `${outstanding} still outstanding` : "all checks done"}
        />
        <MetricCard
          icon={PhoneCall}
          label={notContactedActive ? "1 · Not contacted" : "1 · Contacted"}
          value={notContactedActive ? notContacted : contacted}
          of={visible.length}
          sub={
            notContactedActive
              ? "showing these"
              : notContacted
                ? `${notContacted} to go`
                : "all reached"
          }
          tone={notContacted > 0 ? "warning" : "neutral"}
          active={notContactedActive}
          onClick={() => toggleQuickFilter("checks", "contacted")}
        />
        <MetricCard
          icon={UserCheck}
          label="2 · Onboarding"
          value={onboardingPending}
          of={visible.length}
          sub={declined[0] ? `pending · ${declined[0]} no reply` : "pending"}
          tone={onboardingPending > 0 ? "danger" : "neutral"}
          active={table.getColumn("checks")?.getFilterValue() === "onboarding"}
          onClick={() => toggleQuickFilter("checks", "onboarding")}
        />
        <MetricCard
          icon={LogIn}
          label="3 · Zero login"
          value={loginPending}
          of={visible.length}
          sub={declined[1] ? `pending · ${declined[1]} no login` : "pending"}
          tone={loginPending > 0 ? "warning" : "neutral"}
          active={table.getColumn("checks")?.getFilterValue() === "login"}
          onClick={() => toggleQuickFilter("checks", "login")}
        />
        <MetricCard
          icon={BanknoteArrowUp}
          label="4 · PTPTN"
          value={ptptnPending}
          of={ptptnApplicable}
          sub={
            ptptnApplicable
              ? declined[2]
                ? `of ${ptptnApplicable} · ${declined[2]} not applied`
                : `of ${ptptnApplicable} PTPTN`
              : "no PTPTN students"
          }
          tone={ptptnPending > 0 ? "warning" : "neutral"}
          active={table.getColumn("checks")?.getFilterValue() === "ptptn"}
          onClick={() => toggleQuickFilter("checks", "ptptn")}
        />
        <MetricCard
          icon={CheckCheck}
          label="Fully checked"
          value={allDone}
          of={visible.length}
          sub={allDone ? "every step answered" : "none complete yet"}
          tone="success"
          active={table.getColumn("checks")?.getFilterValue() === "complete"}
          onClick={() => toggleQuickFilter("checks", "complete")}
        />
        <MetricCard
          icon={TriangleAlert}
          label="At risk"
          value={atRisk}
          of={visible.length}
          sub="flagged"
          tone={atRisk > 0 ? "danger" : "neutral"}
          active={table.getColumn("at_risk")?.getFilterValue() === true}
          onClick={() => toggleQuickFilter("at_risk", true)}
        />
      </div>

      <div
        className={`grid grid-cols-1 items-start gap-3 xl:min-h-0 xl:flex-1 xl:grid-rows-[minmax(0,1fr)] xl:items-stretch ${
          hasSelection ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "xl:grid-cols-1"
        }`}
      >
        <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card xl:min-h-0">
          <div className="flex shrink-0 flex-col gap-2.5 border-b px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  value={search}
                  onChange={(event) =>
                    table.getColumn("name")?.setFilterValue(event.target.value)
                  }
                  className="h-9 border-0 bg-muted/50 pl-8 pr-16 text-[13px] shadow-none focus-visible:ring-1"
                  placeholder="Search name, matric, status or outcome"
                />
                {search ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => table.getColumn("name")?.setFilterValue("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground sm:block">
                    /
                  </kbd>
                )}
              </div>

              <Select
                value={getFilter("study_level")}
                onValueChange={(value) => setFilter("study_level", value)}
              >
                <SelectTrigger className="h-9 w-auto gap-1.5 border-0 bg-muted/50 text-[13px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All levels</SelectItem>
                  <SelectSeparator />
                  {LEVEL_GROUPS.map((group) => (
                    <SelectItem
                      key={group.value}
                      value={levelGroupFilterValue(group.value)}
                    >
                      {group.label}
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  {levelOptions.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={getFilter("Campus Code")}
                onValueChange={(value) => setFilter("Campus Code", value)}
              >
                <SelectTrigger className="h-9 w-auto gap-1.5 border-0 bg-muted/50 text-[13px]">
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All campuses</SelectItem>
                  <SelectSeparator />
                  {campusOptions.map((campus) => (
                    <SelectItem key={campus} value={campus}>
                      {campus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={getFilter("payment_mode")}
                onValueChange={(value) => setFilter("payment_mode", value)}
              >
                <SelectTrigger className="h-9 w-auto gap-1.5 border-0 bg-muted/50 text-[13px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All methods</SelectItem>
                  <SelectSeparator />
                  <SelectItem value="PTPTN">PTPTN</SelectItem>
                  <SelectItem value="SELF">Self paying</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/*
                Shares the course_visits filter with the "0 CN visits" tile —
                the tiers are nested, so only one can apply and the two
                controls stay in step with each other.
              */}
              <Select
                value={getFilter("course_visits")}
                onValueChange={(value) => setFilter("course_visits", value)}
              >
                <SelectTrigger className="h-9 w-auto gap-1.5 border-0 bg-muted/50 text-[13px]">
                  <SelectValue placeholder="CN activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All CN activity</SelectItem>
                  <SelectSeparator />
                  {/*
                    SelectLabel reads Radix's group context, so it only works
                    inside a SelectGroup. The tiers are Active-only and the
                    counts say so too — without the caption the numbers look
                    wrong next to the table.
                  */}
                  <SelectGroup>
                    <SelectLabel className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                      Active students only
                    </SelectLabel>
                    {CN_ACTIVITY_FILTERS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex w-full items-center gap-2">
                          {option.label}
                          <span className="tabular-nums text-muted-foreground">
                            {cnCounts[option.value] ?? 0}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={
                  (table.getColumn("study_mode")?.getFilterValue() as string) ??
                  ALL
                }
                onValueChange={(value) => setFilter("study_mode", value)}
              >
                <SelectTrigger className="h-9 w-auto gap-1.5 border-0 bg-muted/50 text-[13px]">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All modes</SelectItem>
                  <SelectSeparator />
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Conventional">Conventional</SelectItem>
                </SelectContent>
              </Select>

              {showSstFilter && (
                <Select
                  value={getFilter("sst_id")}
                  onValueChange={(value) => setFilter("sst_id", value)}
                >
                  <SelectTrigger className="h-9 w-auto gap-1.5 border-0 bg-muted/50 text-[13px]">
                    <SelectValue placeholder="Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All owners</SelectItem>
                    <SelectSeparator />
                    {SST_MEMBERS.map((member) => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="ml-auto flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Columns</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs">
                      Visible columns
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="text-xs capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {COLUMN_LABELS[column.id] ?? column.id}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5"
                  disabled={!hasAnything}
                  onClick={() => {
                    table.resetColumnFilters();
                    table.resetSorting();
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() =>
                      table.getColumn(filter.id)?.setFilterValue(undefined)
                    }
                    className="inline-flex items-center gap-1 rounded-full border bg-background py-0.5 pl-2.5 pr-1.5 text-[11px] text-muted-foreground transition hover:border-foreground/25 hover:text-foreground"
                  >
                    {filterChipLabel(filter.id, filter.value)}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Owns the leftover height at xl+, so the sticky header and the
              horizontal scrollbar stay on screen together. */}
          <div className="min-h-[320px] max-h-[60vh] overflow-auto xl:max-h-none xl:min-h-0 xl:flex-1">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-t-0 hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => {
                      // Sticky lives on the cells, not on <thead> — browsers
                      // only reliably honour position:sticky on th/td.
                      const pinned =
                        header.column.id === "select" ||
                        header.column.id === "name";
                      return (
                      <TableHead
                        key={header.id}
                        className={`sticky top-0 h-9 whitespace-nowrap border-b bg-card px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground ${
                          pinned ? "z-40" : "z-30"
                        } ${header.column.id === "select" ? "left-0" : ""} ${
                          header.column.id === "name" ? "left-10" : ""
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const selected = row.getIsSelected();
                    return (
                      <TableRow
                        key={row.id}
                        data-state={selected && "selected"}
                        onClick={() => row.toggleSelected()}
                        className={`group cursor-pointer border-t transition-colors ${
                          selected ? "bg-muted hover:bg-muted" : "hover:bg-muted"
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={`h-11 px-3 py-0 align-middle ${
                              cell.column.id === "select" ||
                              cell.column.id === "name"
                                ? // Pinned cells need an opaque background or
                                  // scrolled columns show through them.
                                  `sticky z-20 ${
                                    selected
                                      ? "bg-muted"
                                      : "bg-card group-hover:bg-muted"
                                  }`
                                : ""
                            } ${cell.column.id === "select" ? "left-0" : ""} ${
                              cell.column.id === "name" ? "left-10" : ""
                            }`}
                          >
                            {selected && cell.column.id === "select" && (
                              <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
                            )}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="h-64">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <UserSearch className="h-7 w-7 text-muted-foreground/40" />
                        <p className="text-sm font-medium">
                          No students match these filters
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try clearing a filter or widening your search.
                        </p>
                        {hasAnything && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1 h-8"
                            onClick={() => {
                              table.resetColumnFilters();
                              table.resetSorting();
                            }}
                          >
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="shrink-0 border-t px-1">
            <DataTablePagination table={table} />
          </div>
        </div>

        {/*
          Rendered once only — the grid places it in the side rail at xl and
          stacks it under the table below that. Rendering it twice would mount
          the engagement form twice.
        */}
        {hasSelection && (
          <aside className="xl:min-h-0 xl:overflow-y-auto">
            {selectedRows.toReversed().map((row, index) => (
              <NewStudentCard
                key={row.id}
                student={row.original as StudentDashboardRow}
                index={index + 1}
                filteredOut={!visibleIds.has(row.id)}
                onClearFilters={() => table.resetColumnFilters()}
                onClose={() => row.toggleSelected(false)}
              />
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
