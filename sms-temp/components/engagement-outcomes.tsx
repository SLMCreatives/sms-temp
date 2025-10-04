"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface EngagementOutcomesProps {
  faculty: string;
  timeRange: string;
}

export function EngagementOutcomes({ faculty }: EngagementOutcomesProps) {
  // Mock data - would come from API in production
  const allFacultiesData = [
    {
      faculty: "FOB",
      excellent: 245,
      good: 412,
      fair: 178,
      poor: 98,
      atRisk: 45
    },
    {
      faculty: "FEH",
      excellent: 312,
      good: 524,
      fair: 201,
      poor: 132,
      atRisk: 62
    },
    {
      faculty: "SIT",
      excellent: 198,
      good: 387,
      fair: 156,
      poor: 112,
      atRisk: 49
    }
  ];

  const singleFacultyData = [
    { category: "Excellent", count: 245 },
    { category: "Good", count: 412 },
    { category: "Fair", count: 178 },
    { category: "Poor", count: 98 },
    { category: "At Risk", count: 45 }
  ];

  const isAllFaculties = faculty === "all";

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Engagement Outcomes</CardTitle>
        <CardDescription className="text-muted-foreground">
          {isAllFaculties
            ? "Student engagement levels across all faculties"
            : `Student engagement levels for ${faculty}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {isAllFaculties ? (
            <BarChart data={allFacultiesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
              <XAxis
                dataKey="faculty"
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
              <Legend
                wrapperStyle={{
                  color: "oklch(0.97 0 0)",
                  fontSize: "12px"
                }}
              />
              <Bar
                dataKey="excellent"
                fill="oklch(0.68 0.20 160)"
                name="Excellent"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="good"
                fill="oklch(0.65 0.25 265)"
                name="Good"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="fair"
                fill="oklch(0.72 0.19 85)"
                name="Fair"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="poor"
                fill="oklch(0.75 0.18 45)"
                name="Poor"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="atRisk"
                fill="oklch(0.55 0.23 25)"
                name="At Risk"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <BarChart data={singleFacultyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
              <XAxis
                dataKey="category"
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
              <Bar
                dataKey="count"
                fill="oklch(0.65 0.25 265)"
                name="Students"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
