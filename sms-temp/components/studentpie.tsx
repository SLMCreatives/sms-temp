/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { TrendingUp } from "lucide-react";
import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Students } from "@/app/student/studentColumns";

export const description = "A pie chart with a label";

/* const chartData = [
  { browser: "Not Logged In", visitors: 275, fill: "var(--color-not_logged)" },
  { browser: "0% Progress", visitors: 200, fill: "var(--color-zero)" },
  { browser: "20% Progress", visitors: 187, fill: "var(--color-twenty)" },
  { browser: "No Response", visitors: 173, fill: "var(--color-no_response)" },
  { browser: "Active", visitors: 90, fill: "var(--color-active)" }
]; */

const chartConfig = {
  visitors: {
    label: "Visitors"
  },
  not_logged: {
    label: "Not Logged In"
  },
  zero: {
    label: "Zero Progress"
  },
  twenty: {
    label: "20% Progress"
  },

  active: {
    label: "Active"
  }
} satisfies ChartConfig;

interface StudentChartProps {
  data: Students[];
}

export function StudentPieChart({ data }: StudentChartProps) {
  const db_students = data as Students[];
  const active_students = db_students.filter(
    (student) => student.status === "Active"
  );
  const not_logged_in = active_students.filter(
    (student) =>
      student.lms_activity && student.lms_activity.last_login_at === null
  );

  const zero_progress = db_students.filter(
    (student) =>
      student.lms_activity &&
      student.lms_activity.course_progress === 0 &&
      !not_logged_in.includes(student)
  );

  const low_progress = db_students.filter(
    (student) =>
      student.lms_activity &&
      student.lms_activity.course_progress <= 0.2 &&
      !zero_progress.includes(student) &&
      !not_logged_in.includes(student)
  );

  /* const engaged = db_students.filter((student) =>
    student.engagements.some(
      (engagement) => engagement && engagement.created_at > "2025-09-22"
    )
  ); */

  const not_loggedin_engaged = not_logged_in.filter((student) =>
    student.engagements.some(
      (engagement) => engagement && engagement.created_at > "2025-09-22"
    )
  );

  const zero_engaged = zero_progress.filter((student) =>
    student.engagements.some(
      (engagement) => engagement && engagement.created_at > "2025-09-22"
    )
  );

  const low_engaged = low_progress.filter((student) =>
    student.engagements.some(
      (engagement) => engagement && engagement.created_at > "2025-09-22"
    )
  );

  const no_response = db_students.filter((student) =>
    student.engagements.some(
      (engagement) =>
        engagement &&
        engagement.created_at > "2025-09-22" &&
        engagement.outcome === "no_response"
    )
  );

  const therest = active_students.filter(
    (student) =>
      !not_logged_in.includes(student) &&
      !zero_progress.includes(student) &&
      !low_progress.includes(student)
  );

  const chartData2 = [
    {
      browser: "Not Logged In",
      visitors: not_logged_in.length,
      fill: "darkred"
    },
    {
      browser: "0% Progress",
      visitors: zero_progress.length,
      fill: "red"
    },
    { browser: "20% Progress", visitors: low_progress.length, fill: "orange" },
    { browser: "Active", visitors: therest.length, fill: "green" }
  ];
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Student Progress</CardTitle>
        <CardDescription>
          {active_students.length} Active Students
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[300px] w-full"
        >
          <PieChart className="h-full space-y-2 p-2">
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData2} dataKey="visitors" label nameKey="browser" />
            <ChartLegend />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div> 
      </CardFooter> */}
    </Card>
  );
}
