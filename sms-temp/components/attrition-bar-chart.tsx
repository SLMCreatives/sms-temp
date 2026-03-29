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
    color: "#ade8f4"
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
      <CardHeader className="flex flex-col items-start justify-start absolute top-2 left-2">
        <CardTitle className="text-sm font-bold">
          Online Attrition Rate
        </CardTitle>
        <CardDescription className="">
          <div className="flex flex-col gap-2">
            <p className="text-4xl text-muted-foreground pt-2">
              {chartData.find((d) => d.month === lastMonthName)?.[2026] + "%"}
            </p>
            <div className="flex flex-row gap-2 items-center justify-start text-xs">
              <Badge variant="default" className="bg-green-200">
                {vsLastYearAttrition}%
              </Badge>{" "}
              <p className="text-stone-400 dark:text-stone-600 italic text-xs">
                vs 2025
              </p>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full pt-4">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 30,
              right: 10,
              left: 10,
              bottom: 0
            }}
          >
            <CartesianGrid
              vertical={true}
              horizontal={true}
              strokeDasharray="2 2"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              style={{ fontSize: "10px" }}
            />
            {/* <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value + " " + "%"}
              style={{ fontSize: "10px" }}
            /> */}
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="2024"
              stroke="var(--color-2024)"
              strokeWidth={2}
              dot={{ fill: "var(--color-2024)" }}
              type={"natural"}
              activeDot={{ fill: "var(--color-2024)" }}
            />
            <Line
              dataKey="2025"
              stroke="var(--color-2025)"
              strokeWidth={2}
              dot={{ fill: "var(--color-2025)" }}
              type={"natural"}
              activeDot={{ fill: "var(--color-2025)" }}
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
