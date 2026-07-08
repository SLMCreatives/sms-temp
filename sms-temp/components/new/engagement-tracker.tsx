"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

const supabase = createClient();

const SST_NAME_TO_ID: Record<string, number> = {
  Amirul: 1,
  Farzana: 2,
  Najwa: 3,
  Ayu: 4,
  Miru: 6
};

const SST_ID_TO_NAME: Record<number, string> = {
  1: "Amirul",
  2: "Farzana",
  3: "Najwa",
  4: "Ayu",
  6: "Miru"
};

interface StudentEngagementRow {
  matric_no: string;
  sst_id: number | null;
  a_engagements: { id: string }[];
}

function getCurrentWeekFriday(): { daysUntilFriday: number; fridayDate: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Days since Monday (ISO week starts Monday): Mon=0 ... Sun=6
  const isoDow = (today.getDay() + 6) % 7;
  // Friday is the 5th day of the ISO week (index 4); negative on Sat/Sun (already passed)
  const daysUntilFriday = 4 - isoDow;
  const fridayDate = new Date(today);
  fridayDate.setDate(today.getDate() + daysUntilFriday);
  return { daysUntilFriday, fridayDate };
}

export function EngagementTracker() {
  const [students, setStudents] = useState<StudentEngagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: authData }) => {
      const fullName: string =
        authData.user?.user_metadata?.full_name ??
        authData.user?.email ??
        "";

      const isSulaiman = fullName.toLowerCase().includes("sulaiman");
      setIsAdmin(isSulaiman);

      let query = supabase
        .from("a_students")
        .select("matric_no, sst_id, a_engagements(id)")
        .eq("intake_code", "July26");

      if (!isSulaiman) {
        const exactId = SST_NAME_TO_ID[fullName];
        const partialKey = !exactId
          ? Object.keys(SST_NAME_TO_ID).find((n) =>
              fullName.toLowerCase().includes(n.toLowerCase())
            )
          : undefined;
        const sstId = exactId ?? (partialKey ? SST_NAME_TO_ID[partialKey] : null);
        if (sstId) query = query.eq("sst_id", sstId);
      }

      const { data } = await query;
      if (data) setStudents(data as StudentEngagementRow[]);
      setLoading(false);
    });
  }, []);

  const { daysUntilFriday, fridayDate } = getCurrentWeekFriday();
  const daysRemaining = Math.max(daysUntilFriday + 1, 0);

  const fridayLabel = fridayDate.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short"
  });

  const total = students.length;
  const engaged = students.filter((s) => s.a_engagements.length > 0).length;
  const notEngaged = total - engaged;
  const progressPct = total > 0 ? Math.round((engaged / total) * 100) : 0;
  const perDay =
    notEngaged > 0 && daysRemaining > 0
      ? Math.ceil(notEngaged / daysRemaining)
      : 0;

  return (
    <Card className="border-0 shadow-none dark:bg-black bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          {isAdmin ? "All SST Tracker" : "My Call Tracker"}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {isAdmin
            ? "Total engagement across all SST members · "
            : "Goal: reach all students by Friday, "}
          <span className="font-medium text-foreground">{fridayLabel}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-xs text-muted-foreground animate-pulse">
            Loading your stats...
          </p>
        ) : (
          <>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{engaged} called</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted/50 py-2 px-1">
                <p className="text-lg font-bold">{total}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Total
                </p>
              </div>
              <div className="rounded-xl bg-green-50 dark:bg-green-950 py-2 px-1">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {engaged}
                </p>
                <p className="text-[10px] text-green-700 dark:text-green-500 leading-tight">
                  Engaged
                </p>
              </div>
              <div className="rounded-xl bg-red-50 dark:bg-red-950 py-2 px-1">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {notEngaged}
                </p>
                <p className="text-[10px] text-red-700 dark:text-red-500 leading-tight">
                  Not Yet
                </p>
              </div>
            </div>

            {/* Daily target — only for personal view */}
            {!isAdmin && (
              notEngaged > 0 ? (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950 px-3 py-2 flex items-center justify-between">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Aim for ~<span className="font-bold text-sm">{perDay}</span>{" "}
                    calls/day
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    {daysRemaining}d left
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-green-50 dark:bg-green-950 px-3 py-2 text-center">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                    All students reached!
                  </p>
                </div>
              )
            )}

            {/* Per-member breakdown — admin only */}
            {isAdmin && (
              <div className="space-y-3 pt-1 border-t">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  By SST Member
                </p>
                {Object.entries(SST_ID_TO_NAME).map(([idStr, name]) => {
                  const id = Number(idStr);
                  const memberStudents = students.filter((s) => s.sst_id === id);
                  const memberTotal = memberStudents.length;
                  const memberEngaged = memberStudents.filter(
                    (s) => s.a_engagements.length > 0
                  ).length;
                  const memberPct =
                    memberTotal > 0
                      ? Math.round((memberEngaged / memberTotal) * 100)
                      : 0;
                  return (
                    <div key={id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium">{name}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {memberEngaged}/{memberTotal}
                          <span className="ml-1 text-[10px]">({memberPct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all duration-500"
                          style={{ width: `${memberPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
