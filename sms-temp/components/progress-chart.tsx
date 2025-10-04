"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface ProgressChartProps {
  faculty: string;
  timeRange: string;
}

export function ProgressChart({ faculty, timeRange }: ProgressChartProps) {
  // Mock data - would come from API in production
  const data = [
    { date: "Week 1", zero: 120, low: 380, active: 2500 },
    { date: "Week 2", zero: 135, low: 395, active: 2470 },
    { date: "Week 3", zero: 142, low: 410, active: 2448 },
    { date: "Week 4", zero: 156, low: 428, active: 2416 }
  ];

  console.log(faculty, timeRange);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">
          Student Progress Distribution
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Tracking zero, low, and active progress students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorZero" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.55 0.23 25)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.55 0.23 25)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.72 0.19 85)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.72 0.19 85)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.65 0.25 265)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.65 0.25 265)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
            <XAxis
              dataKey="date"
              stroke="oklch(0.6 0 0)"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="oklch(0.6 0 0)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.18 0 0)",
                border: "1px solid oklch(0.25 0 0)",
                borderRadius: "8px",
                color: "oklch(0.97 0 0)"
              }}
            />
            <Area
              type="monotone"
              dataKey="zero"
              stackId="1"
              stroke="oklch(0.55 0.23 25)"
              fill="url(#colorZero)"
              name="Zero Progress"
            />
            <Area
              type="monotone"
              dataKey="low"
              stackId="1"
              stroke="oklch(0.72 0.19 85)"
              fill="url(#colorLow)"
              name="Low Progress"
            />
            <Area
              type="monotone"
              dataKey="active"
              stackId="1"
              stroke="oklch(0.65 0.25 265)"
              fill="url(#colorActive)"
              name="Active"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
