/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { StudentMetrics } from "@/components/student-metrics";
import { ProgressChart } from "@/components/progress-chart";
import { EngagementOutcomes } from "@/components/engagement-outcomes";
import { StudentStatusTable } from "@/components/student-status-table";
import { Activity } from "lucide-react";

type Faculty = "all" | "FOB" | "FEH" | "SIT";

export function StudentAttritionDashboard() {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty>("all");
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Student Attrition Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor student engagement and identify at-risk students
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="semester">This Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 ">
        <Tabs
          value={selectedFaculty}
          onValueChange={(faculty) => setSelectedFaculty(faculty as Faculty)}
          className="space-y-6"
        >
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">All Faculties</TabsTrigger>
            <TabsTrigger value="FOB">FOB</TabsTrigger>
            <TabsTrigger value="FEH">FEH</TabsTrigger>
            <TabsTrigger value="SIT">SIT</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedFaculty} className="space-y-6">
            {/* Key Metrics */}
            <StudentMetrics faculty={selectedFaculty} timeRange={timeRange} />

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <ProgressChart faculty={selectedFaculty} timeRange={timeRange} />
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Login Activity Trend
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Students not logged in over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <Activity className="w-8 h-8 mr-2" />
                    <span>Login activity visualization</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Outcomes */}
            {/*  <EngagementOutcomes
              faculty={selectedFaculty}
              timeRange={timeRange}
            /> */}

            {/* Student Status Table */}
            {/* <StudentStatusTable faculty={selectedFaculty} /> */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
