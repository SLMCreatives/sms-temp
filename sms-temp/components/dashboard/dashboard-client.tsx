"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis
} from "recharts";
import { ArrowRight, MonitorX, TriangleAlert, Users } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { DashboardRow } from "@/lib/dashboard-data";
import { STUDY_LEVELS, studyLevelOf, type StudyLevel } from "@/lib/study-level";
import { getChecks } from "@/lib/student-progress";
import { INTAKES, intakeLabel } from "@/lib/intakes";

/**
 * The dashboard, split by cohort.
 *
 * Active and at-risk students answer different questions — "how far has
 * outreach got?" versus "who is leaving and why?" — so they get different
 * panels rather than one page of averages that hides both.
 *
 * Colour: the validated diverging pair (blue confirmed / red reported-not-done,
 * neutral for not-yet-asked) and a single-hue ordinal ramp for at-risk
 * severity. Green/orange is deliberately avoided — the pair collides under
 * protanopia. Marks carry colour; text never does, and every plotted value also
 * appears in a table.
 */

/**
 * The one hue recharts fills with. The funnel's diverging pair and the
 * severity ramp are CSS custom properties instead (--pos / --neg / --track /
 * --sev-1..3), declared as literal arbitrary classes on the page wrapper —
 * Tailwind only emits classes it can see as static strings, so the hexes
 * cannot be interpolated from here.
 */
const POS = { light: "#2a78d6", dark: "#3987e5" };

const AT_RISK_STATUSES = ["At Risk", "Deferred", "Withdraw"];
const ALL = "all";

const nf = new Intl.NumberFormat("en-US");
const fmt = (n: number) => nf.format(n);
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

type Row = DashboardRow & { level: StudyLevel };

/* ---------------------------------------------------------------- chrome -- */

function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border bg-card p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function CardTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex w-fit gap-1 rounded-lg bg-muted/50 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
          {o.count !== undefined && (
            <span className="ml-1.5 text-muted-foreground">
              {fmt(o.count)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-[150px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

/* ----------------------------------------------------------------- marks -- */

/** Horizontal magnitude bars, single hue — no legend needed for one series. */
function MagnitudeChart({
  data,
  height = 200
}: {
  data: { name: string; count: number }[];
  height?: number;
}) {
  const config = {
    count: { label: "Students", theme: POS }
  } satisfies ChartConfig;

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        No students match these filters.
      </p>
    );
  }

  return (
    // aspectRatio:auto overrides ChartContainer's default aspect-video, which
    // would otherwise fight the fixed height.
    <ChartContainer
      config={config}
      style={{ height, aspectRatio: "auto" }}
      className="w-full"
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 36, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="0" />
        <XAxis type="number" dataKey="count" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        {/* 4px rounded data-end, square at the baseline. */}
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} barSize={16}>
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/** One outreach stage: confirmed / reported-no / not asked, as a stacked bar. */
function FunnelRow({
  label,
  yes,
  no,
  pending
}: {
  label: string;
  yes: number;
  no: number;
  pending: number;
}) {
  const segments = [
    { key: "yes", n: yes, color: "var(--pos)" },
    { key: "no", n: no, color: "var(--neg)" },
    { key: "pending", n: pending, color: "var(--track)" }
  ].filter((s) => s.n > 0);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium">{label}</p>
        <p className="shrink-0 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{fmt(yes)}</span>{" "}
          confirmed · {fmt(no)} no · {fmt(pending)} pending
        </p>
      </div>
      <div
        className="flex h-2 w-full gap-[2px]"
        role="img"
        aria-label={`${label}: ${yes} confirmed, ${no} reported not done, ${pending} not asked yet`}
      >
        {segments.map((s) => (
          <div
            key={s.key}
            className="rounded-[4px]"
            style={{ flexGrow: s.n, flexBasis: 0, backgroundColor: s.color }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ page -- */

export function DashboardClient({ rows }: { rows: DashboardRow[] }) {
  const [cohort, setCohort] = useState<"active" | "risk">("active");
  const [intake, setIntake] = useState(ALL);
  const [mode, setMode] = useState(ALL);
  const [level, setLevel] = useState(ALL);
  const [faculty, setFaculty] = useState(ALL);

  const withLevel = useMemo<Row[]>(
    () => rows.map((r) => ({ ...r, level: studyLevelOf(r.programme_name) })),
    [rows]
  );

  const faculties = useMemo(
    () =>
      [...new Set(withLevel.map((r) => r.faculty_code).filter(Boolean))].sort() as string[],
    [withLevel]
  );

  // Filters apply before the cohort split, so both tab counts describe the
  // same filtered population.
  const scoped = useMemo(
    () =>
      withLevel.filter((r) => {
        if (intake !== ALL && r.intake_code !== intake) return false;
        if (mode !== ALL && r.study_mode !== mode) return false;
        if (level !== ALL && r.level !== level) return false;
        if (faculty !== ALL && r.faculty_code !== faculty) return false;
        return true;
      }),
    [withLevel, intake, mode, level, faculty]
  );

  const activeRows = useMemo(
    () => scoped.filter((r) => r.status === "Active"),
    [scoped]
  );
  const riskRows = useMemo(
    () => scoped.filter((r) => AT_RISK_STATUSES.includes(r.status ?? "")),
    [scoped]
  );

  const view = cohort === "active" ? activeRows : riskRows;

  const byFaculty = useMemo(() => countBy(view, (r) => r.faculty_code), [view]);
  const byLevel = useMemo(
    () =>
      STUDY_LEVELS.map((l) => ({
        name: l,
        count: view.filter((r) => r.level === l).length
      })).filter((d) => d.count > 0),
    [view]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 [--neg:#e34948] [--pos:#2a78d6] [--sev-1:#86b6ef] [--sev-2:#3987e5] [--sev-3:#1c5cab] [--track:#f0efec] dark:[--neg:#e66767] dark:[--pos:#3987e5] dark:[--sev-1:#9ec5f4] dark:[--sev-3:#184f95] dark:[--track:#383835]">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {fmt(rows.length)} students across the{" "}
          {INTAKES.map((i) => i.label).join(" and ")} intakes.
        </p>
      </header>

      {/* Cohort split — the primary axis of the page. */}
      <div className="mb-4">
        <Segmented
          value={cohort}
          onChange={setCohort}
          options={[
            { value: "active", label: "Active", count: activeRows.length },
            { value: "risk", label: "At risk", count: riskRows.length }
          ]}
        />
      </div>

      {/* Filters, in one row above the panels. */}
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-card p-3">
        <FilterSelect
          label="Intake"
          value={intake}
          onChange={setIntake}
          options={INTAKES.map((i) => i.value)}
        />
        <FilterSelect
          label="Study mode"
          value={mode}
          onChange={setMode}
          options={["Online", "Conventional"]}
        />
        <FilterSelect
          label="Level"
          value={level}
          onChange={setLevel}
          options={[...STUDY_LEVELS]}
        />
        <FilterSelect
          label="Faculty"
          value={faculty}
          onChange={setFaculty}
          options={faculties}
        />
        {(intake !== ALL || mode !== ALL || level !== ALL || faculty !== ALL) && (
          <button
            type="button"
            onClick={() => {
              setIntake(ALL);
              setMode(ALL);
              setLevel(ALL);
              setFaculty(ALL);
            }}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>

      {cohort === "active" ? (
        <ActivePanels rows={view} byFaculty={byFaculty} byLevel={byLevel} />
      ) : (
        <RiskPanels rows={view} byFaculty={byFaculty} byLevel={byLevel} />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- active --- */

function ActivePanels({
  rows,
  byFaculty,
  byLevel
}: {
  rows: Row[];
  byFaculty: { name: string; count: number }[];
  byLevel: { name: string; count: number }[];
}) {
  const stages = useMemo(() => buildFunnel(rows), [rows]);
  const lms = rows.filter((r) => r.a_lms_activity);
  const neverLoggedIn = lms.filter((r) => !r.a_lms_activity?.last_login_at).length;
  const contacted = stages[0];

  const weekly = useMemo(
    () => [
      { name: "Week 1", count: lms.filter((r) => (r.a_lms_activity?.cp_w1 ?? 0) > 0).length },
      { name: "Week 2", count: lms.filter((r) => (r.a_lms_activity?.cp_w2 ?? 0) > 0).length },
      { name: "Week 3", count: lms.filter((r) => (r.a_lms_activity?.cp_w3 ?? 0) > 0).length }
    ],
    [lms]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Users}
          label="Active students"
          value={fmt(rows.length)}
          sub="matching the current filters"
        />
        <StatTile
          icon={ArrowRight}
          label="Contacted"
          value={fmt(contacted.yes)}
          sub={`${pct(contacted.yes, contacted.total)}% · ${fmt(contacted.pending)} to go`}
        />
        <StatTile
          icon={MonitorX}
          label="Never logged in to CN"
          value={fmt(neverLoggedIn)}
          sub={`of ${fmt(lms.length)} with CN data`}
        />
        <StatTile
          icon={TriangleAlert}
          label="No participation yet"
          value={fmt(lms.filter((r) => !r.a_lms_activity?.latest_cp).length)}
          sub="zero course participation"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle
            title="Outreach progress"
            hint="Each step opens once the one before it has an answer."
          />
          <div className="space-y-4">
            {/* Explicit props, not {...s}: the stage carries its own `key`
                field, which a spread would apply over React's. */}
            {stages.map((s) => (
              <FunnelRow
                key={s.key}
                label={s.label}
                yes={s.yes}
                no={s.no}
                pending={s.pending}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-4 text-[11px] text-muted-foreground">
            <Legend color="var(--pos)" label="Confirmed" />
            <Legend color="var(--neg)" label="Reported not done" />
            <Legend color="var(--track)" label="Not asked yet" />
          </div>
        </Card>

        <Card>
          <CardTitle
            title="CN participation by week"
            hint="Students with any recorded course participation that week."
          />
          <MagnitudeChart data={weekly} height={180} />
        </Card>

        <Card>
          <CardTitle title="By faculty" />
          <MagnitudeChart data={byFaculty} />
        </Card>

        <Card>
          <CardTitle title="By study level" />
          <MagnitudeChart data={byLevel} />
        </Card>
      </div>

      <Card>
        <CardTitle
          title="Study mode by level"
          hint="Every plotted value, and the outreach rate behind it."
        />
        <LevelModeTable rows={rows} />
      </Card>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-[2px]"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {label}
    </span>
  );
}

/** The breakdown the filters are steering — level down, mode across. */
function LevelModeTable({ rows }: { rows: Row[] }) {
  const modes = useMemo(
    () => [...new Set(rows.map((r) => r.study_mode).filter(Boolean))].sort() as string[],
    [rows]
  );

  const body = STUDY_LEVELS.map((level) => {
    const inLevel = rows.filter((r) => r.level === level);
    const contacted = inLevel.filter((r) => r.contacted === true).length;
    const lms = inLevel.filter((r) => r.a_lms_activity);
    const loggedIn = lms.filter((r) => r.a_lms_activity?.last_login_at).length;
    return {
      level,
      perMode: modes.map((m) => inLevel.filter((r) => r.study_mode === m).length),
      total: inLevel.length,
      contacted,
      loggedIn,
      lmsTracked: lms.length
    };
  }).filter((r) => r.total > 0);

  if (body.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        No students match these filters.
      </p>
    );
  }

  const totals = {
    perMode: modes.map((_, i) => body.reduce((a, r) => a + r.perMode[i], 0)),
    total: body.reduce((a, r) => a + r.total, 0),
    contacted: body.reduce((a, r) => a + r.contacted, 0),
    loggedIn: body.reduce((a, r) => a + r.loggedIn, 0),
    lmsTracked: body.reduce((a, r) => a + r.lmsTracked, 0)
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Level</TableHead>
            {modes.map((m) => (
              <TableHead key={m} className="text-right">
                {m}
              </TableHead>
            ))}
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Contacted</TableHead>
            <TableHead className="text-right">Logged in to CN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="tabular-nums">
          {body.map((r) => (
            <TableRow key={r.level}>
              <TableCell className="font-medium">{r.level}</TableCell>
              {r.perMode.map((n, i) => (
                <TableCell key={modes[i]} className="text-right">
                  {fmt(n)}
                </TableCell>
              ))}
              <TableCell className="text-right font-semibold">
                {fmt(r.total)}
              </TableCell>
              <TableCell className="text-right">
                {fmt(r.contacted)}{" "}
                <span className="text-muted-foreground">
                  ({pct(r.contacted, r.total)}%)
                </span>
              </TableCell>
              <TableCell className="text-right">
                {r.lmsTracked ? (
                  <>
                    {fmt(r.loggedIn)}{" "}
                    <span className="text-muted-foreground">
                      ({pct(r.loggedIn, r.lmsTracked)}%)
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t-2">
            <TableCell className="font-semibold">All levels</TableCell>
            {totals.perMode.map((n, i) => (
              <TableCell key={modes[i]} className="text-right font-semibold">
                {fmt(n)}
              </TableCell>
            ))}
            <TableCell className="text-right font-semibold">
              {fmt(totals.total)}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {fmt(totals.contacted)}{" "}
              <span className="font-normal text-muted-foreground">
                ({pct(totals.contacted, totals.total)}%)
              </span>
            </TableCell>
            <TableCell className="text-right font-semibold">
              {fmt(totals.loggedIn)}{" "}
              <span className="font-normal text-muted-foreground">
                ({pct(totals.loggedIn, totals.lmsTracked)}%)
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

/* ----------------------------------------------------------------- risk --- */

const INTENTS = [
  { key: "deciding", label: "Still deciding" },
  { key: "defer", label: "Intends to defer" },
  { key: "withdraw", label: "Intends to withdraw" }
] as const;

function RiskPanels({
  rows,
  byFaculty,
  byLevel
}: {
  rows: Row[];
  byFaculty: { name: string; count: number }[];
  byLevel: { name: string; count: number }[];
}) {
  const count = (status: string) => rows.filter((r) => r.status === status).length;

  const intentData = INTENTS.map((i) => ({
    name: i.label,
    count: rows.filter((r) => r.at_risk_intent === i.key).length
  }));

  // Fills come from the per-bar <Cell> severity steps; the config only names
  // the series for the tooltip.
  const intentConfig = {
    count: { label: "Students" }
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={TriangleAlert}
          label="At risk or leaving"
          value={fmt(rows.length)}
          sub="matching the current filters"
        />
        <StatTile
          icon={TriangleAlert}
          label="Withdrawn"
          value={fmt(count("Withdraw"))}
          sub="status set to Withdraw"
        />
        <StatTile
          icon={TriangleAlert}
          label="Deferred"
          value={fmt(count("Deferred"))}
          sub="status set to Deferred"
        />
        <StatTile
          icon={TriangleAlert}
          label="Flagged at risk"
          value={fmt(count("At Risk"))}
          sub="still enrolled, needs a call"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle
            title="Stated intent"
            hint="Recorded when the student was flagged."
          />
          {/*
            One hue stepped light-to-dark by severity, not three identities —
            deciding, defer, withdraw are an ordered scale. A single-hue ramp
            has no colourblind failure mode, so the order itself is the signal.
          */}
          <ChartContainer
            config={intentConfig}
            style={{ height: 180, aspectRatio: "auto" }}
            className="w-full"
          >
            <BarChart
              accessibilityLayer
              data={intentData}
              layout="vertical"
              margin={{ left: 4, right: 36, top: 4, bottom: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="0" />
              <XAxis type="number" dataKey="count" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={130}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                {intentData.map((d, i) => (
                  <Cell key={d.name} fill={`var(--sev-${i + 1})`} />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>

        <Card>
          <CardTitle title="By faculty" />
          <MagnitudeChart data={byFaculty} height={180} />
        </Card>

        <Card>
          <CardTitle title="By study level" />
          <MagnitudeChart data={byLevel} height={180} />
        </Card>
      </div>

      <Card>
        <CardTitle
          title="Students needing attention"
          hint="Every at-risk, deferred and withdrawn student in the current filters."
        />
        <RiskTable rows={rows} />
      </Card>
    </div>
  );
}

function RiskTable({ rows }: { rows: Row[] }) {
  const [sort, setSort] = useState<"name" | "status" | "faculty">("status");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      if (sort === "name") return (a.full_name ?? "").localeCompare(b.full_name ?? "");
      if (sort === "faculty")
        return (a.faculty_code ?? "").localeCompare(b.faculty_code ?? "");
      return (a.status ?? "").localeCompare(b.status ?? "");
    });
    return copy;
  }, [rows, sort]);

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        No at-risk students match these filters.
      </p>
    );
  }

  const header = (key: typeof sort, label: string) => (
    <TableHead>
      <button
        type="button"
        onClick={() => setSort(key)}
        className={`transition-colors hover:text-foreground ${
          sort === key ? "text-foreground underline underline-offset-4" : ""
        }`}
      >
        {label}
      </button>
    </TableHead>
  );

  return (
    <div className="max-h-[520px] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            {header("name", "Student")}
            {header("faculty", "Faculty")}
            <TableHead>Level</TableHead>
            <TableHead>Mode</TableHead>
            {header("status", "Status")}
            <TableHead>Intent</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={r.matric_no}>
              <TableCell>
                <Link
                  href={`/student/${r.matric_no}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {r.full_name ?? r.matric_no}
                </Link>
                <span className="block text-[11px] text-muted-foreground">
                  {r.matric_no} · {intakeLabel(r.intake_code)}
                </span>
              </TableCell>
              <TableCell className="text-xs">{r.faculty_code ?? "—"}</TableCell>
              <TableCell className="text-xs">{r.level}</TableCell>
              <TableCell className="text-xs">{r.study_mode ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[11px] font-normal">
                  {r.status ?? "—"}
                </Badge>
              </TableCell>
              <TableCell className="text-xs">
                {INTENTS.find((i) => i.key === r.at_risk_intent)?.label ?? "—"}
              </TableCell>
              <TableCell className="max-w-[260px] text-xs text-muted-foreground">
                {r.at_risk_reason?.trim() || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ---------------------------------------------------------------- shared -- */

function countBy(rows: Row[], pick: (r: Row) => string | null) {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = pick(r)?.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** Per-stage totals from the same getChecks() the workspace uses. */
function buildFunnel(rows: Row[]) {
  const template = getChecks({});
  const stages = template.map((c) => ({
    key: c.key,
    label: c.label,
    yes: 0,
    no: 0,
    pending: 0,
    total: 0
  }));

  for (const row of rows) {
    getChecks(row).forEach((check, i) => {
      if (!check.applicable) return;
      const stage = stages[i];
      stage.total += 1;
      if (check.answer === true) stage.yes += 1;
      else if (check.answer === false) stage.no += 1;
      else stage.pending += 1;
    });
  }

  return stages;
}
