"use client";

import { StudentMetrics } from "@/components/student-metrics";
import { Student } from "@/lib/types/database";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { AttritionBarChart } from "./attrition-bar-chart";
//import { StudentVerticalStats } from "./new/right-sidebar";

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
      <header className=" w-full flex">
        <div className=" mx-auto px-6 py-4 w-full items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 grid grid-cols-4 gap-6">
        <div className="w-full mx-auto col-span-3">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Attrition Rate (by Year)
          </h3>
          <AttritionBarChart data={db_students} />
        </div>
        <div className="col-span-1 h-full w-full">
          <Carousel
            opts={{
              align: "center",
              loop: true
            }}
          >
            <CarouselContent className="w-full ">
              <CarouselItem>
                <div className=" w-full mx-auto">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    March 2026
                  </h3>
                  <StudentMetrics data={mar26} />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="w-full mx-auto">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    January 2026
                  </h3>
                  <StudentMetrics data={jan26} />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="w-full mx-auto">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    November 2025
                  </h3>
                  <StudentMetrics data={nov25} />
                </div>
              </CarouselItem>
            </CarouselContent>
            {/*  <CarouselPrevious />
            <CarouselNext /> */}
          </Carousel>
          {/* 
          <StudentVerticalStats data={mar26} /> */}
        </div>
        <div className="flex flex-col gap-6 col-span-3 py-6"></div>
      </main>
    </div>
  );
}
