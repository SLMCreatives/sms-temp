"use client";

import { StudentMetrics } from "@/components/student-metrics";
import { Student } from "@/lib/types/database";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "./ui/carousel";

interface StudentMetricsProps {
  data: Student[];
}

export function StudentAttritionDashboard({ data }: StudentMetricsProps) {
  const db_students = data;

  const online_students = db_students.filter(
    (student) => student.study_mode === "Online"
  );

  const mar26 = online_students.filter(
    (student) =>
      student.intake_code === "MAR26" && student.study_mode === "Online"
  );

  const jan26 = online_students.filter(
    (student) =>
      student.intake_code === "JAN26" && student.study_mode === "Online"
  );

  const nov25 = online_students.filter(
    (student) =>
      student.intake_code === "NOV25" && student.study_mode === "Online"
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
      <header className="border-b border-border w-full flex">
        <div className=" mx-auto px-6 py-4 w-full items-center justify-between gap-10">
          <div className="flex items-center  justify-between gap-4 w-full">
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
          <Carousel>
            <CarouselContent className="w-full">
              <CarouselItem>
                <div className=" w-full mx-auto">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    March 26
                  </h3>
                  <StudentMetrics data={mar26} />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="w-full mx-auto">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    January 26
                  </h3>
                  <StudentMetrics data={jan26} />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="w-full mx-auto">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    November 25
                  </h3>
                  <StudentMetrics data={nov25} />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </main>
    </div>
  );
}
