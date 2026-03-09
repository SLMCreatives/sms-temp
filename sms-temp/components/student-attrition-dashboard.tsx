"use client";

import { StudentMetrics } from "@/components/student-metrics";
import { Student } from "@/lib/types/database";

interface StudentMetricsProps {
  data: Student[];
  intake: string;
}

export function StudentAttritionDashboard({
  data,
  intake
}: StudentMetricsProps) {
  const db_students = data;

  const online_students = db_students.filter(
    (student) => student.study_mode === "Online"
  );

  const Janonline = online_students.filter(
    (student) =>
      student.intake_code === intake && student.study_mode === "Online"
  );

  /*   const db_fob = db_students?.filter(
    (student) => student.faculty_code === "FOB"
  );

  const db_feh = db_students?.filter(
    (student) => student.faculty_code === "FEH"
  );

  const db_sit = db_students?.filter(
    (student) => student.faculty_code === "FAiFT"
  ); */

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start">
      {/* Header */}
      <header className="border-b border-border">
        <div className=" mx-auto px-6 py-4">
          <div className="flex items-center  justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                UNITAR Student Health
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
        <div className="flex flex-col gap-6">
          <StudentMetrics data={Janonline} />
        </div>
      </main>
    </div>
  );
}
