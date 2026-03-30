/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";
import { toDate } from "date-fns";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

const chartData = [
  { month: "January", 2024: 3.7, 2025: 7.1, 2026: 3.7 },
  { month: "February", 2024: 3.7, 2025: 5.6, 2026: 3.8 },
  { month: "March", 2024: 3.8, 2025: 5.1 },
  { month: "April", 2024: 4.2, 2025: 5.6 },
  { month: "May", 2024: 7.7, 2025: 13.5 },
  { month: "June", 2024: 7.2, 2025: 9.4 },
  { month: "July", 2024: 7.2, 2025: 9.4 },
  { month: "August", 2024: 7.9, 2025: 9.0 },
  { month: "September", 2024: 7.9, 2025: 9 },
  { month: "October", 2024: 9.8, 2025: 13.5 },
  { month: "November", 2024: 9.6, 2025: 12.7 },
  { month: "December", 2024: 9.6, 2025: 13.4 }
];

const chartConfig = {
  2026: {
    label: "2026",
    color: "#e63946"
  },
  2025: {
    label: "2025",
    color: "#0096c7"
  },
  2024: {
    label: "2024",
    color: "#2ebfa5"
  }
} satisfies ChartConfig;

export function AttritionBarChart(data: any) {
  const today = new Date();
  const lastMonth = today.getMonth() - 1;
  const lastMonthName = new Date(today.getFullYear(), lastMonth).toLocaleString(
    "default",
    { month: "long" }
  );

  const lastMonthAttrition = chartData.find((d) => d.month === lastMonthName);
  const lastMonthAttrition2026 = lastMonthAttrition?.[2026] || 0;
  const lastMonthAttrition2025 = lastMonthAttrition?.[2025] || 0;
  const lastMonthAttrition2024 = lastMonthAttrition?.[2024] || 0;

  const vsLastYearAttrition = (
    lastMonthAttrition2026 - lastMonthAttrition2025
  ).toFixed(2);

  return (
    <Card className="bg-card border-stone-400/50 border flex flex-col w-full relative">
      <CardHeader className="flex flex-col items-start justify-start absolute top-4 left-10  z-30">
        <CardTitle className="text-sm font-bold italic text-stone-600 dark:text-stone-400">
          Online Attrition Rate
        </CardTitle>
        <CardDescription className="">
          <div className="flex flex-col gap-2">
            <p className="text-4xl text-muted-foreground pt-2">
              {chartData.find((d) => d.month === lastMonthName)?.[2026] + "%"}
            </p>
            <div className="flex flex-row gap-2 items-center justify-start text-xs">
              <Badge
                variant="default"
                className="bg-green-200 dark:bg-green-700"
              >
                {vsLastYearAttrition}%
              </Badge>{" "}
              <p className="text-stone-600 dark:text-stone-400 italic text-xs">
                vs 2025
              </p>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0
            }}
          >
            <CartesianGrid
              vertical={false}
              horizontal={true}
              stroke="#c9cebd dark:#2b2b2b"
              strokeWidth={"0.5"}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              style={{ fontSize: "10px", fill: "#818181 dark:#A5A5A6" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickCount={8}
              domain={[2, 16]}
              tickMargin={10}
              tickFormatter={(value) => value + "%"}
              style={{ fontSize: "10px", fill: "#818181 dark:#A5A5A6" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Separator orientation="horizontal" className="my-2" />
            <Line
              dataKey="2024"
              stroke="var(--color-2024)"
              strokeWidth={2}
              dot={{ fill: "var(--color-2024)" }}
              type={"natural"}
              activeDot={{ fill: "var(--color-2024)" }}
              opacity={0.5}
            />
            <Line
              dataKey="2025"
              stroke="var(--color-2025)"
              strokeWidth={2}
              dot={{ fill: "var(--color-2025)" }}
              type={"natural"}
              activeDot={{ fill: "var(--color-2025)" }}
              opacity={0.5}
            />
            <Line
              dataKey="2026"
              stroke="var(--color-2026)"
              strokeWidth={2}
              dot={{ fill: "var(--color-2026)" }}
              type={"natural"}
              activeDot={{ fill: "var(--color-2026)" }}
              order={0}
            />
          </LineChart>
          {/* <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          style={{ fontSize: "10px", fontWeight: "bold", color: "#6b7280" }}
          textDecoration="capitalize"
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="2026" fill="var(--color-2025)" radius={4} />
        <Bar dataKey="2025" fill="var(--color-2026)" radius={4} />
      </BarChart> */}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
