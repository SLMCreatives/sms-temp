"use client";

import { useState } from "react";
import { StudentMetrics } from "@/components/student-metrics";
import { Student } from "@/lib/types/database";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { AttritionBarChart } from "./attrition-bar-chart";
import { SSTEngagementTracker } from "./new/sst-engagement-tracker";
import { FacultyTracker } from "./new/faculty-tracker";

interface StudentMetricsProps {
  data: Student[];
}

type IntakeTab = "TOTAL" | "JAN26" | "MAR26" | "MAY26";

const FACULTY_LABELS: Record<string, string> = {
  FOB: "FOB",
  FEH: "FEH",
  FAiFT: "FAiFT"
};

function pct(n: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function IntakeMovementSection({ data }: { data: Student[] }) {
  const [activeTab, setActiveTab] = useState<IntakeTab>("TOTAL");

  const jan26 = data.filter((s) => s.intake_code === "JAN26");
  const mar26 = data.filter((s) => s.intake_code === "MAR26");
  const may26 = data.filter((s) => s.intake_code === "MAY26");

  const cohort =
    activeTab === "TOTAL"
      ? data
      : activeTab === "JAN26"
        ? jan26
        : activeTab === "MAR26"
          ? mar26
          : may26;

  const total = cohort.length;

  // Course progress
  const w1 = cohort.filter((s) => (s.a_lms_activity?.cp_w1 ?? 0) > 0).length;
  const w2 = cohort.filter((s) => (s.a_lms_activity?.cp_w2 ?? 0) > 0).length;
  const w3 = cohort.filter((s) => (s.a_lms_activity?.cp_w3 ?? 0) > 0).length;
  const totalVisits = cohort.reduce(
    (sum, s) => sum + (s.a_lms_activity?.course_visits ?? 0),
    0
  );
  const avgVisits = total ? (totalVisits / total).toFixed(1) : "0";

  // Faculty breakdown
  const facultyMap = new Map<string, number>();
  cohort.forEach((s) => {
    const key = s.faculty_code ?? "Unknown";
    facultyMap.set(key, (facultyMap.get(key) ?? 0) + 1);
  });
  const facultyRows = Array.from(facultyMap.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  // Level breakdown
  const levelMap = new Map<string, number>();
  cohort.forEach((s) => {
    const key = s.study_level ?? "Unknown";
    levelMap.set(key, (levelMap.get(key) ?? 0) + 1);
  });
  const levelRows = Array.from(levelMap.entries()).sort((a, b) => b[1] - a[1]);

  const tabs: IntakeTab[] = ["TOTAL", "JAN26", "MAR26", "MAY26"];

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/40 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "TOTAL" ? "Total" : tab}
            <span className="ml-2 text-xs text-muted-foreground">
              {tab === "TOTAL"
                ? data.length
                : tab === "JAN26"
                  ? jan26.length
                  : tab === "MAR26"
                    ? mar26.length
                    : may26.length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Course Progress — W1, W2, W3 */}
        {[
          { label: "Week 1 (cp_w1)", count: w1 },
          { label: "Week 2 (cp_w2)", count: w2 },
          { label: "Week 3 (cp_w3)", count: w3 }
        ].map(({ label, count }) => (
          <div
            key={label}
            className="bg-card border rounded-xl p-4 flex flex-col gap-3"
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-foreground">
                {count}
              </span>
              <span className="text-sm text-muted-foreground mb-1">
                {pct(count, total)} of intake
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: pct(count, total) }}
              />
            </div>
          </div>
        ))}

        {/* Course Visits */}
        <div className="bg-card border rounded-xl p-4 flex flex-col gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Total Course Visits
          </span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-foreground">
              {totalVisits.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground mb-1">
              avg {avgVisits}/student
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full" />
        </div>
      </div>

      {/* Faculty + Level breakdowns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Faculty */}
        <div className="bg-card border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Faculty Breakdown
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wide border-b">
                <th className="text-left pb-2">Faculty</th>
                <th className="text-right pb-2">Students</th>
                <th className="text-right pb-2">% of Intake</th>
                <th className="w-24 pb-2" />
              </tr>
            </thead>
            <tbody>
              {facultyRows.map(([faculty, count]) => (
                <tr key={faculty} className="border-b last:border-0">
                  <td className="py-2 font-medium text-foreground">
                    {FACULTY_LABELS[faculty] ?? faculty}
                  </td>
                  <td className="py-2 text-right tabular-nums">{count}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">
                    {pct(count, total)}
                  </td>
                  <td className="py-2 pl-3">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: pct(count, total) }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {facultyRows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-muted-foreground text-xs"
                  >
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Level */}
        <div className="bg-card border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Level Breakdown
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wide border-b">
                <th className="text-left pb-2">Level</th>
                <th className="text-right pb-2">Students</th>
                <th className="text-right pb-2">% of Intake</th>
                <th className="w-24 pb-2" />
              </tr>
            </thead>
            <tbody>
              {levelRows.map(([level, count]) => (
                <tr key={level} className="border-b last:border-0">
                  <td className="py-2 font-medium text-foreground">{level}</td>
                  <td className="py-2 text-right tabular-nums">{count}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">
                    {pct(count, total)}
                  </td>
                  <td className="py-2 pl-3">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: pct(count, total) }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {levelRows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-muted-foreground text-xs"
                  >
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StudentAttritionDashboard({ data }: StudentMetricsProps) {
  const online_students = data.filter(
    (student) =>
      student.study_mode === "Online" &&
      ["JAN26", "MAR26", "MAY26"].includes(student.intake_code)
  );

  const mar26 = online_students.filter((s) => s.intake_code === "MAR26");
  const jan26 = online_students.filter((s) => s.intake_code === "JAN26");

  return (
    <div className="flex flex-col w-full">
      <header className="w-full flex">
        <div className="mx-auto px-6 py-4 w-full items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 grid grid-cols-4 gap-6 gap-y-10">
        {/* Attrition Bar Chart */}
        <div className="w-full mx-auto col-span-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Attrition Rate (by Year)
          </h3>
          <AttritionBarChart data={online_students} />
        </div>

        {/* Student Metrics carousel */}
        <div className="col-span-1 h-full w-full">
          <Carousel opts={{ align: "center", loop: true }}>
            <CarouselContent className="w-full">
              <CarouselItem>
                <div className="w-full mx-auto">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    March 2026
                  </h3>
                  <StudentMetrics data={mar26} />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="w-full mx-auto">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    January 2026
                  </h3>
                  <StudentMetrics data={jan26} />
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>

        {/* Engagement Tracker */}
        <div className="flex flex-col gap-4 col-span-3">
          <h3 className="text-xl font-semibold text-foreground">
            Engagement Tracker
          </h3>
          <SSTEngagementTracker data={online_students} />
        </div>

        {/* Faculty Tracker */}
        <div className="flex flex-col gap-4 col-span-4">
          <h3 className="text-xl font-semibold text-foreground">
            Attrition by Faculty
          </h3>
          <FacultyTracker data={online_students} />
        </div>

        {/* Student Movement by Intake */}
        <div className="flex flex-col gap-4 col-span-4">
          <h3 className="text-xl font-semibold text-foreground">
            Student Movement by Intake
          </h3>
          <IntakeMovementSection data={online_students} />
        </div>
      </main>
    </div>
  );
}
