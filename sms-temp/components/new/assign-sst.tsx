"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getSstById } from "@/lib/sst-members";

const supabase = createClient();

/** PostgREST caps a select at 1000 rows, so long lists are read in pages. */
const PAGE_SIZE = 1000;
/** Matric numbers per update statement, to keep the URL a sane length. */
const UPDATE_CHUNK = 200;
const ALL_INTAKES = "__all__";

/** Mirrors the `sst` table — the roster is read from there, not hardcoded. */
type SstRow = {
  id: number;
  full_name: string;
  nickname: string | null;
  role: string | null;
  is_active: boolean;
  max_load: number | null;
};

type PoolStudent = {
  matric_no: string;
  full_name: string | null;
  intake_code: string | null;
  status: string | null;
};

type PlanRow = {
  member: SstRow;
  take: number;
  matrics: string[];
};

const displayName = (m: SstRow) => m.nickname?.trim() || m.full_name;

/** Headline number. Proportional figures — tabular is for table columns. */
function Stat({
  label,
  value,
  hint,
  accent
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 text-2xl font-semibold leading-none ${
          accent ? "text-sky-600 dark:text-sky-400" : ""
        }`}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}

/**
 * Caseload as one hue at two strengths: the load they already carry, then what
 * this run would add. Every row is name-labelled, so the bar carries magnitude
 * only — never identity.
 */
function LoadBar({
  current,
  incoming,
  scale
}: {
  current: number;
  incoming: number;
  scale: number;
}) {
  const pct = (n: number) => (scale > 0 ? (n / scale) * 100 : 0);
  return (
    <div className="flex h-2 w-full gap-[2px] overflow-hidden rounded-[4px] bg-muted">
      <div
        className="h-full rounded-[4px] bg-sky-500/35"
        style={{ width: `${pct(current)}%` }}
      />
      {incoming > 0 && (
        <div
          className="h-full rounded-[4px] bg-sky-500"
          style={{ width: `${pct(incoming)}%` }}
        />
      )}
    </div>
  );
}

export default function AssignSST() {
  const [roster, setRoster] = useState<SstRow[]>([]);
  const [pool, setPool] = useState<PoolStudent[]>([]);
  const [allIntakes, setAllIntakes] = useState<string[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loads, setLoads] = useState<Record<number, number>>({});
  const [loadingData, setLoadingData] = useState(true);

  const [intake, setIntake] = useState<string>(ALL_INTAKES);
  const [activeOnly, setActiveOnly] = useState(true);

  const [included, setIncluded] = useState<Record<number, boolean>>({});
  const [counts, setCounts] = useState<Record<number, number>>({});

  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");

  /* ----------------------------- data load ---------------------------- */

  const fetchRoster = useCallback(async () => {
    const { data, error } = await supabase
      .from("sst")
      .select("id, full_name, nickname, role, is_active, max_load")
      .eq("is_active", true)
      .order("id");

    if (error) {
      toast.error(`Could not load the SST roster: ${error.message}`);
      return [] as SstRow[];
    }
    // The manager oversees the team but carries no caseload.
    return ((data ?? []) as SstRow[]).filter((m) => m.role !== "Manager");
  }, []);

  const fetchPool = useCallback(async () => {
    const rows: PoolStudent[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("a_students")
        .select("matric_no, full_name, intake_code, status")
        .is("sst_id", null)
        .order("intake_code", { ascending: true })
        .order("matric_no", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        toast.error(`Could not load unassigned students: ${error.message}`);
        return rows;
      }
      rows.push(...((data ?? []) as PoolStudent[]));
      if (!data || data.length < PAGE_SIZE) break;
    }
    return rows;
  }, []);

  /**
   * Every intake on record, not just the ones with unassigned students left.
   * Deriving the filter from the pool alone leaves a one-entry dropdown once a
   * cohort is fully assigned, which reads as a broken control.
   */
  const fetchIntakes = useCallback(async () => {
    const codes = new Set<string>();
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("a_students")
        .select("intake_code")
        .not("intake_code", "is", null)
        .order("intake_code", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) break;
      data?.forEach((r) => r.intake_code && codes.add(r.intake_code));
      if (!data || data.length < PAGE_SIZE) break;
    }
    return [...codes].sort();
  }, []);

  /** Current caseload per member, counted under the same filters as the pool. */
  const fetchLoads = useCallback(
    async (members: SstRow[], intakeCode: string, onlyActive: boolean) => {
      /** One counting query, scoped to the filters currently on screen. */
      const countWith = async (sstId: number | null) => {
        let q = supabase
          .from("a_students")
          .select("matric_no", { count: "exact", head: true });
        if (sstId !== null) q = q.eq("sst_id", sstId);
        if (intakeCode !== ALL_INTAKES) q = q.eq("intake_code", intakeCode);
        if (onlyActive) q = q.eq("status", "Active");
        const { count } = await q;
        return count ?? 0;
      };

      const [entries, total] = await Promise.all([
        Promise.all(
          members.map(
            async (m) => [m.id, await countWith(m.id)] as const
          )
        ),
        countWith(null)
      ]);

      return {
        loads: Object.fromEntries(entries) as Record<number, number>,
        total
      };
    },
    []
  );

  const refresh = useCallback(async () => {
    setLoadingData(true);
    const [members, students, intakes] = await Promise.all([
      fetchRoster(),
      fetchPool(),
      fetchIntakes()
    ]);
    setRoster(members);
    setPool(students);
    setAllIntakes(intakes);
    setIncluded((prev) =>
      Object.fromEntries(members.map((m) => [m.id, prev[m.id] ?? true]))
    );
    setLoadingData(false);
  }, [fetchRoster, fetchPool, fetchIntakes]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Caseloads are filter-dependent, so they refetch when the filters move.
  useEffect(() => {
    if (roster.length === 0) return;
    let stale = false;
    fetchLoads(roster, intake, activeOnly).then((next) => {
      if (stale) return;
      setLoads(next.loads);
      setTotalStudents(next.total);
    });
    return () => {
      stale = true;
    };
  }, [roster, intake, activeOnly, fetchLoads]);

  /* ------------------------------ derived ----------------------------- */

  /**
   * Intakes with students still waiting come first, each labelled with how many
   * are unassigned, so the filter doubles as a summary of where the work is.
   */
  const intakeOptions = useMemo(() => {
    const unassigned = new Map<string, number>();
    for (const s of pool) {
      if (!s.intake_code) continue;
      unassigned.set(s.intake_code, (unassigned.get(s.intake_code) ?? 0) + 1);
    }
    const codes = [...new Set([...unassigned.keys(), ...allIntakes])];
    return codes
      .map((code) => ({ code, waiting: unassigned.get(code) ?? 0 }))
      .sort((a, b) => b.waiting - a.waiting || a.code.localeCompare(b.code));
  }, [pool, allIntakes]);

  const filteredPool = useMemo(
    () =>
      pool.filter(
        (s) =>
          (intake === ALL_INTAKES || s.intake_code === intake) &&
          (!activeOnly || s.status === "Active")
      ),
    [pool, intake, activeOnly]
  );

  const selectedMembers = useMemo(
    () => roster.filter((m) => included[m.id]),
    [roster, included]
  );

  const totalRequested = selectedMembers.reduce(
    (sum, m) => sum + (counts[m.id] ?? 0),
    0
  );
  const overAllocated = Math.max(0, totalRequested - filteredPool.length);
  const leftover = Math.max(0, filteredPool.length - totalRequested);

  /** Slices the filtered pool into one contiguous block per member. */
  const plan = useMemo<PlanRow[]>(() => {
    let cursor = 0;
    return selectedMembers
      .map((member) => {
        const take = Math.min(
          counts[member.id] ?? 0,
          Math.max(0, filteredPool.length - cursor)
        );
        const matrics = filteredPool
          .slice(cursor, cursor + take)
          .map((s) => s.matric_no);
        cursor += take;
        return { member, take, matrics };
      })
      .filter((row) => row.take > 0);
  }, [selectedMembers, counts, filteredPool]);

  const totalPlanned = plan.reduce((sum, row) => sum + row.take, 0);
  const takeFor = (id: number) =>
    included[id] ? Math.min(counts[id] ?? 0, filteredPool.length) : 0;

  /** Bars share one scale so row lengths are comparable. */
  const barScale = useMemo(
    () =>
      Math.max(1, ...roster.map((m) => (loads[m.id] ?? 0) + takeFor(m.id))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roster, loads, counts, included, filteredPool.length]
  );

  const spread = useMemo(() => {
    const after = roster.map((m) => (loads[m.id] ?? 0) + takeFor(m.id));
    if (after.length === 0) return 0;
    return Math.max(...after) - Math.min(...after);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, loads, counts, included, filteredPool.length]);

  /* ------------------------------ actions ----------------------------- */

  const splitEvenly = () => {
    if (selectedMembers.length === 0) {
      toast.error("Tick at least one SST member first.");
      return;
    }
    const base = Math.floor(filteredPool.length / selectedMembers.length);
    const remainder = filteredPool.length % selectedMembers.length;
    setCounts((prev) => ({
      ...prev,
      ...Object.fromEntries(
        selectedMembers.map((m, i) => [m.id, base + (i < remainder ? 1 : 0)])
      )
    }));
  };

  /**
   * Tops up the lightest caseloads first until the pool runs out, which is what
   * "fair" usually means here — an even split ignores who is already loaded.
   */
  const levelLoads = () => {
    if (selectedMembers.length === 0) {
      toast.error("Tick at least one SST member first.");
      return;
    }
    const after = new Map(
      selectedMembers.map((m) => [m.id, loads[m.id] ?? 0] as const)
    );
    for (let i = 0; i < filteredPool.length; i++) {
      let lightest = selectedMembers[0].id;
      for (const m of selectedMembers) {
        if ((after.get(m.id) ?? 0) < (after.get(lightest) ?? 0)) lightest = m.id;
      }
      after.set(lightest, (after.get(lightest) ?? 0) + 1);
    }
    setCounts((prev) => ({
      ...prev,
      ...Object.fromEntries(
        selectedMembers.map((m) => [
          m.id,
          (after.get(m.id) ?? 0) - (loads[m.id] ?? 0)
        ])
      )
    }));
  };

  const clearCounts = () =>
    setCounts(Object.fromEntries(roster.map((m) => [m.id, 0])));

  const setCount = (id: number, raw: string) => {
    const n = Number.parseInt(raw, 10);
    setCounts((prev) => ({
      ...prev,
      [id]: Number.isNaN(n) ? 0 : Math.max(0, n)
    }));
  };

  const toggleMember = (id: number, on: boolean) => {
    setIncluded((prev) => ({ ...prev, [id]: on }));
    if (!on) setCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  const runAssignment = async () => {
    setConfirming(false);
    setRunning(true);

    let done = 0;
    for (const row of plan) {
      for (let i = 0; i < row.matrics.length; i += UPDATE_CHUNK) {
        const chunk = row.matrics.slice(i, i + UPDATE_CHUNK);
        const { error } = await supabase
          .from("a_students")
          .update({ sst_id: row.member.id })
          .in("matric_no", chunk);

        if (error) {
          setRunning(false);
          setProgress("");
          toast.error(
            `Stopped after ${done} student(s): ${error.message}. Students already written keep their new SST.`
          );
          await refresh();
          return;
        }
        done += chunk.length;
        setProgress(`${done} of ${totalPlanned}`);
      }
    }

    setRunning(false);
    setProgress("");
    toast.success(
      `Assigned ${done} student(s) across ${plan.length} SST member(s).`
    );
    clearCounts();
    await refresh();
  };

  /* -------------------------------- UI -------------------------------- */

  const assignedInScope = roster.reduce(
    (sum, m) => sum + (loads[m.id] ?? 0),
    0
  );
  const scopeLabel =
    intake === ALL_INTAKES ? "all intakes" : intake.toString();
  const nothingToAssign = !loadingData && filteredPool.length === 0;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-base">Initial SST assignment</CardTitle>
        <CardDescription>
          Choose who gets students and how many, preview the split, then
          confirm.
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loadingData || running}
          >
            {loadingData ? "Loading…" : "Refresh"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Where the work is, before any controls. */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {loadingData ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[74px] rounded-lg" />
            ))
          ) : (
            <>
              <Stat
                label="Unassigned"
                value={filteredPool.length}
                hint={`in ${scopeLabel}`}
                accent={filteredPool.length > 0}
              />
              <Stat
                label="Assigned"
                value={assignedInScope}
                hint={`across ${roster.length} SST`}
              />
              <Stat
                label="Students in scope"
                value={totalStudents}
                hint={activeOnly ? "Active only" : "all statuses"}
              />
              <Stat
                label="Caseload spread"
                value={spread}
                hint="heaviest − lightest"
              />
            </>
          )}
        </div>

        {/* Filters define the pool of students up for assignment. */}
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-lg bg-muted/30 p-3">
          <div className="grid gap-1.5">
            <Label htmlFor="assign-intake" className="text-xs">
              Intake
            </Label>
            <Select value={intake} onValueChange={setIntake}>
              <SelectTrigger id="assign-intake" className="h-9 w-56 text-sm">
                <SelectValue placeholder="All intakes" />
              </SelectTrigger>
              {/* popper, not the item-aligned default: with only a handful of
                  intakes the aligned panel opens on top of the trigger and
                  looks like it never opened at all. */}
              <SelectContent position="popper" sideOffset={4} align="start">
                <SelectItem value={ALL_INTAKES}>
                  All intakes ({pool.length} unassigned)
                </SelectItem>
                {intakeOptions.map(({ code, waiting }) => (
                  <SelectItem key={code} value={code}>
                    {code} ({waiting} unassigned)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex h-9 cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={activeOnly}
              onCheckedChange={(v) => setActiveOnly(v === true)}
            />
            Active students only
          </label>

          <div className="ml-auto flex h-9 items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={splitEvenly}
              disabled={nothingToAssign || running}
            >
              Split evenly
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={levelLoads}
              disabled={nothingToAssign || running}
            >
              Level caseloads
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCounts}
              disabled={running}
            >
              Clear
            </Button>
          </div>
        </div>

        {nothingToAssign && (
          <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
            Every student in {scopeLabel} already has an SST. Pick another
            intake, or use{" "}
            <span className="text-foreground">Refresh</span> after importing new
            students.
          </p>
        )}

        {/* One row per member: identity, load, and the number they'd take. */}
        <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
          <div className="hidden grid-cols-[auto_11rem_1fr_4rem_6rem_5rem] items-center gap-3 border-b bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:grid">
            <span className="w-4" />
            <span>SST member</span>
            <span>Caseload</span>
            <span className="text-right">Current</span>
            <span className="text-right">Assign</span>
            <span className="text-right">After</span>
          </div>

          {loadingData
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="m-3 h-8" />
              ))
            : roster.map((m) => {
                const on = !!included[m.id];
                const take = takeFor(m.id);
                const current = loads[m.id] ?? 0;
                const member = getSstById(m.id);
                return (
                  <div
                    key={m.id}
                    className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 border-b px-3 py-2.5 last:border-b-0 sm:grid-cols-[auto_11rem_1fr_4rem_6rem_5rem] ${
                      on ? "" : "opacity-55"
                    }`}
                  >
                    <Checkbox
                      checked={on}
                      onCheckedChange={(v) => toggleMember(m.id, v === true)}
                      aria-label={`Include ${displayName(m)}`}
                      disabled={running}
                    />

                    <div className="flex min-w-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          member?.badgeClass ??
                          "border-0 bg-muted text-muted-foreground"
                        }
                      >
                        {displayName(m)}
                      </Badge>
                      <span className="truncate text-xs text-muted-foreground">
                        {m.role}
                      </span>
                    </div>

                    <div className="col-span-3 sm:col-span-1">
                      <LoadBar
                        current={current}
                        incoming={take}
                        scale={barScale}
                      />
                    </div>

                    <span className="hidden text-right text-sm tabular-nums text-muted-foreground sm:block">
                      {current}
                    </span>

                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className="col-start-3 row-start-1 h-8 w-24 text-right tabular-nums sm:col-start-auto sm:row-start-auto sm:w-full"
                      value={String(counts[m.id] ?? 0)}
                      onChange={(e) => setCount(m.id, e.target.value)}
                      disabled={!on || running || nothingToAssign}
                      aria-label={`Students to assign to ${displayName(m)}`}
                    />

                    <span className="hidden text-right text-sm font-medium tabular-nums sm:block">
                      {current + take}
                      {take > 0 && (
                        <span className="ml-1 text-xs font-normal text-sky-600 dark:text-sky-400">
                          +{take}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
        </div>

        {overAllocated > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            You asked for {overAllocated} more than there are students. Only the
            first {filteredPool.length} will be assigned, in row order.
          </p>
        )}
      </CardContent>

      {/* The commit bar: what will happen, and the button that does it. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 pt-4">
        <p className="text-sm text-muted-foreground">
          {totalPlanned > 0 ? (
            <>
              <span className="font-medium text-foreground">
                {totalPlanned}
              </span>{" "}
              student(s) to {plan.length} SST member(s) ·{" "}
              {leftover > 0 ? `${leftover} left unassigned` : "pool cleared"}
            </>
          ) : (
            "Nothing staged yet."
          )}
        </p>
        <div className="flex items-center gap-3">
          {progress && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {progress}
            </span>
          )}
          <Button
            onClick={() => setConfirming(true)}
            disabled={running || loadingData || totalPlanned === 0}
          >
            {running ? "Assigning…" : "Review & assign"}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm SST assignment</AlertDialogTitle>
            <AlertDialogDescription>
              {totalPlanned} unassigned student(s)
              {intake === ALL_INTAKES ? "" : ` from ${intake}`}
              {activeOnly ? " with status Active" : ""} will be assigned as
              follows. This writes to the student records immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ul className="space-y-1.5 text-sm">
            {plan.map((row) => (
              <li key={row.member.id} className="flex justify-between gap-4">
                <span>{displayName(row.member)}</span>
                <span className="tabular-nums">
                  <span className="text-sky-600 dark:text-sky-400">
                    +{row.take}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    ({loads[row.member.id] ?? 0} →{" "}
                    {(loads[row.member.id] ?? 0) + row.take})
                  </span>
                </span>
              </li>
            ))}
            <li className="flex justify-between gap-4 border-t pt-1.5 text-muted-foreground">
              <span>Remaining unassigned</span>
              <span className="tabular-nums">{leftover}</span>
            </li>
          </ul>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runAssignment}>
              Assign {totalPlanned} student(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
