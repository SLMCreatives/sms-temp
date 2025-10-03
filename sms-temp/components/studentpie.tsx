"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

export const description = "A pie chart with a label";

const chartData = [
  { browser: "Not Logged In", visitors: 275, fill: "var(--color-not_logged)" },
  { browser: "0% Progress", visitors: 200, fill: "var(--color-zero)" },
  { browser: "20% Progress", visitors: 187, fill: "var(--color-twenty)" },
  { browser: "No Response", visitors: 173, fill: "var(--color-no_response)" },
  { browser: "Active", visitors: 90, fill: "var(--color-active)" }
];

const chartConfig = {
  visitors: {
    label: "Visitors"
  },
  not_logged: {
    label: "Not Logged In",
    color: "#e5e7eb"
  },
  zero: {
    label: "Zero Progress",
    color: "#22c55e"
  },
  twenty: {
    label: "20% Progress",
    color: "#f59e0b"
  },
  no_response: {
    label: "No Response",
    color: "#ef4444"
  },
  active: {
    label: "Active",
    color: "#3b82f6"
  }
} satisfies ChartConfig;

export function StudentPieChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Student Progress</CardTitle>
        <CardDescription>FOB - FEH - SIT</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" label nameKey="browser" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
