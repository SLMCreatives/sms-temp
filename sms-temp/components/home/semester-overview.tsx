import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  MessageSquare,
  MonitorX,
  TriangleAlert
} from "lucide-react";

import type { FunnelStage, HomeStats, Tally } from "@/lib/home-stats";
import { Button } from "@/components/ui/button";

/**
 * The signed-in home page: where the current intake stands, at a glance.
 *
 * Every value on this page is rendered as text as well as drawn, so nothing is
 * locked behind a hover — it stays readable on touch, in print, and to a screen
 * reader, and the page ships no client JavaScript.
 *
 * Colours are the validated diverging pair (blue for confirmed, red for
 * reported-not-done, neutral for not-yet-asked) rather than the obvious
 * green/orange, which collide under protanopia. Both steps clear the CVD,
 * normal-vision and 3:1 contrast gates against this app's own surfaces in light
 * and dark. Marks carry the colour; text never does.
 */

const nf = new Intl.NumberFormat("en-US");
const fmt = (n: number) => nf.format(n);
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

/** Light/dark steps for the data marks, swapped on the `.dark` class. */
const VIZ_VARS = [
  "[--pos:#2a78d6] dark:[--pos:#3987e5]",
  "[--neg:#e34948] dark:[--neg:#e66767]",
  "[--track:#f0efec] dark:[--track:#383835]",
  "[--pos-soft:#cde2fb] dark:[--pos-soft:#184f95]"
].join(" ");

function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border bg-card p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function CardTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {hint && (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/** Stat tile: label, value, a line of context, and an optional meter. */
function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  meter
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  meter?: number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      {meter !== undefined && (
        // Track is a lighter step of the fill's own ramp, so the state reads
        // across the whole bar rather than only where it is filled.
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--pos-soft)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${meter}%`, backgroundColor: "var(--pos)" }}
          />
        </div>
      )}
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-[2px]"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

/**
 * One outreach stage as a stacked bar. Segments grow by flex so the 2px surface
 * gaps never push the row past 100%, and a zero-count segment is dropped rather
 * than rendered as a sliver.
 */
function FunnelRow({ stage }: { stage: FunnelStage }) {
  const segments = [
    { key: "yes", n: stage.yes, color: "var(--pos)" },
    { key: "no", n: stage.no, color: "var(--neg)" },
    { key: "pending", n: stage.pending, color: "var(--track)" }
  ].filter((s) => s.n > 0);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium">{stage.label}</p>
        <p className="shrink-0 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {fmt(stage.yes)}
          </span>{" "}
          confirmed · {fmt(stage.no)} no · {fmt(stage.pending)} pending
        </p>
      </div>
      <div
        className="flex h-2 w-full gap-[2px]"
        role="img"
        aria-label={`${stage.label}: ${stage.yes} confirmed, ${stage.no} reported not done, ${stage.pending} not asked yet, of ${stage.total}`}
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

/** Single-series magnitude bars — one hue, value at the tip, no legend needed. */
function BarList({ items, total }: { items: Tally[]; total: number }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-xs font-medium">{item.label}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {fmt(item.count)}
              </span>{" "}
              · {pct(item.count, total)}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-[4px]"
            style={{ backgroundColor: "var(--track)" }}
          >
            <div
              className="h-full rounded-[4px]"
              style={{
                width: `${(item.count / max) * 100}%`,
                backgroundColor: "var(--pos)"
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SemesterOverview({ stats }: { stats: HomeStats }) {
  const contacted = stats.funnel[0];
  const onboarding = stats.funnel[1];

  return (
    <div className={`mx-auto w-full max-w-6xl px-5 py-10 ${VIZ_VARS}`}>
      {/* Hero — exactly one oversized figure on the page. */}
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {stats.intakeLabel} intake · Student Success Team
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
          <p className="text-6xl font-semibold leading-none tracking-tight">
            {fmt(stats.total)}
          </p>
          <p className="pb-1 text-sm text-muted-foreground">
            students this semester
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">
              {fmt(stats.active)}
            </span>{" "}
            active
          </span>
          <span>
            <span className="font-semibold text-foreground">
              {fmt(stats.atRisk)}
            </span>{" "}
            at risk
          </span>
          <span>
            <span className="font-semibold text-foreground">
              {fmt(stats.deferred)}
            </span>{" "}
            deferred
          </span>
          <span>
            <span className="font-semibold text-foreground">
              {fmt(stats.withdrawn)}
            </span>{" "}
            withdrawn
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/student">
              Open student list <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      {/* Headline numbers. */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={GraduationCap}
          label="Active students"
          value={fmt(stats.active)}
          sub={`${pct(stats.active, stats.total)}% of the intake`}
          meter={pct(stats.active, stats.total)}
        />
        <StatTile
          icon={MessageSquare}
          label="Contacted"
          value={fmt(contacted.yes)}
          sub={`${fmt(contacted.pending)} still to reach`}
          meter={pct(contacted.yes, contacted.total)}
        />
        <StatTile
          icon={GraduationCap}
          label="Onboarding confirmed"
          value={fmt(onboarding.yes)}
          sub={`${fmt(onboarding.pending)} awaiting an answer`}
          meter={pct(onboarding.yes, onboarding.total)}
        />
        <StatTile
          icon={MonitorX}
          label="Never logged in to CN"
          value={fmt(stats.neverLoggedIn)}
          sub={`of ${fmt(stats.lmsTracked)} with CN data`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Outreach funnel. */}
        <Card className="lg:col-span-3">
          <CardTitle
            title="Outreach progress"
            hint="Each step opens once the one before it has an answer. PTPTN counts only the students paying that way."
          />
          <div className="space-y-4">
            {stats.funnel.map((stage) => (
              <FunnelRow key={stage.key} stage={stage} />
            ))}
          </div>
          {/* Legend — identity never rests on colour alone. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Swatch color="var(--pos)" /> Confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <Swatch color="var(--neg)" /> Reported not done
            </span>
            <span className="flex items-center gap-1.5">
              <Swatch color="var(--track)" /> Not asked yet
            </span>
          </div>
        </Card>

        {/* Needs attention. */}
        <Card className="lg:col-span-2">
          <CardTitle
            title="Needs attention"
            hint="Where the intake is losing momentum."
          />
          <ul className="space-y-3 text-sm">
            <li className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <MonitorX className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Never logged in to CN
              </span>
              <span className="shrink-0 font-semibold">
                {fmt(stats.neverLoggedIn)}
              </span>
            </li>
            <li className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
                No course participation yet
              </span>
              <span className="shrink-0 font-semibold">
                {fmt(stats.zeroParticipation)}
              </span>
            </li>
            <li className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Not yet contacted
              </span>
              <span className="shrink-0 font-semibold">
                {fmt(contacted.pending)}
              </span>
            </li>
            <li className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Payment mode not recorded
              </span>
              <span className="shrink-0 font-semibold">
                {fmt(stats.paymentUnrecorded)}
              </span>
            </li>
          </ul>
          <p className="mt-4 border-t pt-3 text-[11px] leading-relaxed text-muted-foreground">
            CN figures cover the {fmt(stats.lmsTracked)} students with an LMS
            record, not the full {fmt(stats.total)}.
          </p>
        </Card>

        {/* Faculty split. */}
        <Card className="lg:col-span-3">
          <CardTitle title="By faculty" />
          <BarList items={stats.byFaculty} total={stats.total} />
        </Card>

        {/* Study mode + payment. */}
        <Card className="lg:col-span-2">
          <CardTitle title="By study mode" />
          <BarList items={stats.byStudyMode} total={stats.total} />
          <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4 text-xs">
            <span className="text-muted-foreground">Paying by PTPTN</span>
            <span className="font-semibold">{fmt(stats.ptptnPayers)}</span>
          </div>
        </Card>
      </div>

      <p className="mt-8 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        These figures cover private student information. Please don&apos;t share
        screenshots or login access outside the faculty.
      </p>
    </div>
  );
}
