"use client";

import { Search, X } from "lucide-react";

import { Input } from "../ui/input";
import { LEVEL_GROUPS, LevelGroup } from "@/lib/student-level";
import { CHECK_SEGMENTS } from "@/lib/student-progress";

export const ALL = "all";

/** Anything not "Online" is treated as Conventional, as elsewhere in the app. */
export type StudyMode = "Online" | "Conventional";

export const STUDY_MODES: { value: StudyMode; label: string }[] = [
  { value: "Online", label: "Online" },
  { value: "Conventional", label: "Conventional" }
];

export type MobileFilters = {
  segment: (typeof CHECK_SEGMENTS)[number]["value"] | typeof ALL;
  group: LevelGroup | typeof ALL;
  mode: StudyMode | typeof ALL;
};

export const emptyFilters: MobileFilters = {
  segment: ALL,
  group: ALL,
  mode: ALL
};

function Chip({
  active,
  onClick,
  children,
  count
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground"
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`tabular-nums ${active ? "opacity-70" : "opacity-50"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function FiltersSection({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  segmentCounts,
  groupCounts,
  modeCounts,
  showSegments = true
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filters: MobileFilters;
  setFilters: (filters: MobileFilters) => void;
  segmentCounts: Record<string, number>;
  groupCounts: Record<string, number>;
  modeCounts: Record<string, number>;
  /** Hidden in board view, where each segment already has its own column. */
  showSegments?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 border-0 bg-muted/50 pl-8 pr-8 text-[13px] shadow-none"
          placeholder="Search name or matric"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Academic band */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <Chip
          active={filters.group === ALL}
          onClick={() => setFilters({ ...filters, group: ALL })}
          count={groupCounts[ALL]}
        >
          All levels
        </Chip>
        {LEVEL_GROUPS.map((g) => (
          <Chip
            key={g.value}
            active={filters.group === g.value}
            onClick={() => setFilters({ ...filters, group: g.value })}
            count={groupCounts[g.value]}
          >
            {g.label}
          </Chip>
        ))}
      </div>

      {/* Study mode */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <Chip
          active={filters.mode === ALL}
          onClick={() => setFilters({ ...filters, mode: ALL })}
          count={modeCounts[ALL]}
        >
          All modes
        </Chip>
        {STUDY_MODES.map((m) => (
          <Chip
            key={m.value}
            active={filters.mode === m.value}
            onClick={() => setFilters({ ...filters, mode: m.value })}
            count={modeCounts[m.value]}
          >
            {m.label}
          </Chip>
        ))}
      </div>

      {showSegments && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <Chip
            active={filters.segment === ALL}
            onClick={() => setFilters({ ...filters, segment: ALL })}
            count={segmentCounts[ALL]}
          >
            All
          </Chip>
          {CHECK_SEGMENTS.map((s) => (
            <Chip
              key={s.value}
              active={filters.segment === s.value}
              onClick={() => setFilters({ ...filters, segment: s.value })}
              count={segmentCounts[s.value]}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
