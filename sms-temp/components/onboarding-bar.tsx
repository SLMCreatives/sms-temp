/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

export default function StudentBarChart({ chartData, chartConfig }: any) {
  return (
    <>
      <ChartContainer config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 0, bottom: 0, left: 80 }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tickFormatter={(item) => item}
            hide
          />
          <XAxis dataKey="value" type="number" hide />
          <Bar dataKey="value" barSize={30} radius={[0, 5, 5, 0]}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <LabelList
              dataKey="name"
              position="left"
              className="text-xs text-white text-nowrap"
            />
            <LabelList
              dataKey="value"
              position="right"
              className="text-xs text-foreground"
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </>
  );
}
