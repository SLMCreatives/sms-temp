"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentMetrics } from "@/components/student-metrics";
import { Students } from "@/app/student/studentColumns";
import { useState } from "react";
import { StudentPieChart } from "./studentpie";
//import EngagementTimeline from "./engagement-timeline";

interface StudentMetricsProps {
  data: Students[];
}

export function StudentAttritionDashboard({ data }: StudentMetricsProps) {
  const [faculty, setFilter] = useState("all");
  const db_students = data;

  const db_fob = db_students?.filter(
    (student) => student.faculty_code === "FOB"
  );

  const db_feh = db_students?.filter(
    (student) => student.faculty_code === "FEH"
  );

  const db_sit = db_students?.filter(
    (student) => student.faculty_code === "SIT"
  );

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Online Student Health Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor student engagement and identify at-risk students
              </p>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 ">
        <Tabs value={faculty} onValueChange={setFilter} className="space-y-6">
          <TabsList className="border border-border bg-slate-300 sticky top-10">
            <TabsTrigger value="all">Overall</TabsTrigger>
            <TabsTrigger value="FOB">FOB</TabsTrigger>
            <TabsTrigger value="FEH">FEH</TabsTrigger>
            <TabsTrigger value="SIT">SIT</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Key Metrics */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
              <StudentMetrics data={db_students} />
              <StudentPieChart data={db_students} />
            </div>
            {/* Engagement Timeline */}
            {/*             <EngagementTimeline data={db_students} />
             */}{" "}
          </TabsContent>

          <TabsContent value="FOB" className="space-y-6">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <StudentMetrics data={db_fob} />
              <StudentPieChart data={db_fob} />
            </div>
            {/*             <EngagementTimeline data={db_fob} />
             */}{" "}
          </TabsContent>

          <TabsContent value="FEH" className="space-y-6">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <StudentMetrics data={db_feh} />
              <StudentPieChart data={db_feh} />
            </div>
            {/*             <EngagementTimeline data={db_feh} />
             */}{" "}
          </TabsContent>

          <TabsContent value="SIT" className="space-y-6">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <StudentMetrics data={db_sit} />
              <StudentPieChart data={db_sit} />
            </div>
            {/*             <EngagementTimeline data={db_sit} />
             */}{" "}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
