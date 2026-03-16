"use client";

import { StudentMetrics } from "@/components/student-metrics";
import { Student } from "@/lib/types/database";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { SelectItem } from "@radix-ui/react-select";
import { useState } from "react";

interface StudentMetricsProps {
  data: Student[];
  intake: string;
}

export function StudentAttritionDashboard({
  data,
  intake
}: StudentMetricsProps) {
  const [selectedIntake, setSelectedIntake] = useState(intake ?? "MAR26");
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

  function handleIntakeChange(intake: string) {
    window.location.href = `/dashboard?intake=${intake}`;
  }

  console.log(intake, selectedIntake);

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start">
      {/* Header */}
      <header className="border-b border-border">
        <div className=" mx-auto px-6 py-4 w-full">
          <div className="flex items-center  justify-between gap-4 w-full">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                UNITAR Student Health
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor student engagement and identify at-risk students
              </p>
            </div>

            <Select
              value={selectedIntake}
              onValueChange={(value) => {
                setSelectedIntake(value);
                handleIntakeChange(value);
              }}
            >
              <SelectTrigger className="py-4 w-full">
                <SelectValue placeholder="Intake" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>C1</SelectLabel>
                  <SelectItem value="NOV25">Nov-25</SelectItem>
                  <SelectItem value="JAN26">Jan-26</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>C2</SelectLabel>
                  <SelectItem value="MAR26">Mar-26</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* <Badge>{intake}</Badge> */}
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
