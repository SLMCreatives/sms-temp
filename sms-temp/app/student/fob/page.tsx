import { StudentList } from "@/components/student-list";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { Students } from "../studentColumns";
import { ChevronRight } from "lucide-react";
import StudentListLegend from "@/components/legend";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("students")
    .select("*, lms_activity(*), engagements(*)")
    .eq("faculty_code", "FOB");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function FoBPage() {
  const fob_data = await getData();
  const fob_active = fob_data.filter((student) => student.status === "Active");
  const uniqueProgrammesMaster = [
    ...new Set(
      fob_data
        .filter(
          (student) =>
            student.study_level === "Master" && student.status === "Active"
        )
        .map((item) => item.programme_name)
    )
  ];

  const uniqueProgrammesFoundation = [
    ...new Set(
      fob_data
        .filter(
          (student) =>
            student.study_level === "Foundation" && student.status === "Active"
        )
        .map((item) => item.programme_name)
    )
  ];

  const uniqueProgrammesDiploma = [
    ...new Set(
      fob_data
        .filter(
          (student) =>
            student.study_level === "Diploma" && student.status === "Active"
        )
        .map((item) => item.programme_name)
    )
  ];

  const uniqueProgrammesBachelor = [
    ...new Set(
      fob_data
        .filter(
          (student) =>
            student.study_level === "Bachelor" && student.status === "Active"
        )
        .map((item) => item.programme_name)
    )
  ];

  const uniqueProgrammesDoctorate = [
    ...new Set(
      fob_data
        .filter(
          (student) =>
            student.study_level === "Doctorate" && student.status === "Active"
        )
        .map((item) => item.programme_name)
    )
  ];

  const engaged = fob_active.filter((student) =>
    student.engagements.some(
      (item) =>
        item.created_at > "2025-09-28" && item.created_at <= "2025-10-05"
    )
  );

  const wthreeengaged = fob_active.filter((student) =>
    student.engagements.some((item) => item.created_at > "2025-10-05")
  );

  const wthreepercentage = Math.round(
    (wthreeengaged.length / fob_active.length) * 100
  );

  const woneengaged = fob_active.filter((student) =>
    student.engagements.some((item) => item.created_at <= "2025-09-28")
  );

  const wonepercentage = Math.round(
    (woneengaged.length / fob_active.length) * 100
  );

  const engagedPercentage = Math.round(
    (engaged.length / fob_active.length) * 100
  );

  const foundation = fob_active.filter(
    (student) => student.study_level === "Foundation"
  );
  const master = fob_active.filter(
    (student) => student.study_level === "Master"
  );
  const diploma = fob_active.filter(
    (student) => student.study_level === "Diploma"
  );
  const bachelor = fob_active.filter(
    (student) => student.study_level === "Bachelor"
  );
  const doctorate = fob_active.filter(
    (student) => student.study_level === "Doctorate"
  );

  const foundationNotEngaged = foundation.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at > "2025-10-06")
  );
  const masterNotEngaged = master.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at > "2025-10-06")
  );
  const diplomaNotEngaged = diploma.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at > "2025-10-06")
  );
  const bachelorNotEngaged = bachelor.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at > "2025-10-06")
  );
  const doctorateNotEngaged = doctorate.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at > "2025-10-06")
  );

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start gap-4 px-8 py-6">
      <p className="text-3xl italic font-bold">FOB</p>
      <p className="text-lg font-bold">Engagement Progress</p>
      <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Overall Progress</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 justify-between w-full">
              <Label
                htmlFor="active"
                className="flex flex-row w-full justify-between"
              >
                Active Students{" "}
                <span className="italic text-muted-foreground">
                  {fob_active.length}
                </span>
              </Label>
              <Progress id="active" value={100} className=" h-5"></Progress>

              <Label
                htmlFor="wonepercentage"
                className="flex flex-row w-full justify-between"
              >
                W1 Engaged{" "}
                <span className="italic text-muted-foreground">
                  {woneengaged.length} ({wonepercentage}%)
                </span>
              </Label>
              <Progress
                id="wonepercentage"
                value={wonepercentage}
                className=" h-5"
              ></Progress>
              <Label
                htmlFor="week2engaged"
                className="flex flex-row w-full justify-between"
              >
                W2 Engaged{" "}
                <span className="italic text-muted-foreground">
                  {engaged.length} ({engagedPercentage}%)
                </span>
              </Label>
              <Progress
                id="week2engaged"
                value={engagedPercentage}
                className=" h-5"
              ></Progress>
              <Label
                htmlFor="week3engaged"
                className="flex flex-row w-full justify-between"
              >
                W3 Engaged{" "}
                <span className="italic text-muted-foreground">
                  {wthreeengaged.length} ({wthreepercentage}%)
                </span>
              </Label>
              <Progress
                id="week3engaged"
                value={wthreepercentage}
                className=" h-5"
              ></Progress>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            W3 Engagement (06/10 - 11/10) by Level
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-y-2 gap-x-4 justify-between w-full mr-4">
              <Label className="flex flex-row w-full justify-between">
                Foundation
                <span className="italic text-muted-foreground">
                  {foundation.length - foundationNotEngaged.length}/
                  {foundation.length}
                </span>
              </Label>
              <Progress
                value={
                  ((foundation.length - foundationNotEngaged.length) /
                    foundation.length) *
                  100
                }
                className=" h-5 "
              ></Progress>
              <Label className="flex flex-row w-full justify-between">
                Diploma
                <span className="italic text-muted-foreground">
                  {diploma.length - diplomaNotEngaged.length}/{diploma.length}
                </span>
              </Label>
              <Progress
                value={
                  ((diploma.length - diplomaNotEngaged.length) /
                    diploma.length) *
                  100
                }
                max={diploma.length}
                className=" h-5 "
              />
              <Label className="flex flex-row w-full justify-between">
                Bachelor
                <span className="italic text-muted-foreground">
                  {bachelor.length - bachelorNotEngaged.length}/
                  {bachelor.length}
                </span>
              </Label>
              <Progress
                value={
                  ((bachelor.length - bachelorNotEngaged.length) /
                    bachelor.length) *
                  100
                }
                max={bachelor.length}
                className=" h-5"
              />
              <Label className="flex flex-row w-full justify-between">
                Master
                <span className="italic text-muted-foreground">
                  {master.length - masterNotEngaged.length}/{master.length}
                </span>
              </Label>
              <Progress
                value={
                  ((master.length - masterNotEngaged.length) / master.length) *
                  100
                }
                max={master.length}
                className=" h-5 "
              />
              <Label className="flex flex-row w-full justify-between">
                Doctorate
                <span className="italic text-muted-foreground">
                  {doctorate.length - doctorateNotEngaged.length}/
                  {doctorate.length}
                </span>
              </Label>
              <Progress
                value={
                  ((doctorate.length - doctorateNotEngaged.length) /
                    doctorate.length) *
                  100
                }
                max={doctorate.length}
                className="h-5"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-col w-full">
        <StudentListLegend />
      </div>
      <Tabs className="lg:min-w-[760px] w-full" defaultValue="foundation">
        <TabsList className="w-full">
          <TabsTrigger value="foundation">FDT</TabsTrigger>
          <TabsTrigger value="diploma">DIP</TabsTrigger>
          <TabsTrigger value="bachelor">BAC</TabsTrigger>
          <TabsTrigger value="master">MAS</TabsTrigger>
          <TabsTrigger value="doctorate">DOC</TabsTrigger>
        </TabsList>
        <TabsContent value="foundation" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold">Foundation Students</p>
          {uniqueProgrammesFoundation.map((programme, index) => (
            <div key={index}>
              <p className="text-md font-bold py-2">
                <ChevronRight className="min-w-4 min-h-4 inline-block" />
                {programme}
              </p>
              <div className="flex flex-col lg:grid grid-cols-2 gap-2 pb-4 border-b-2 border-b-foreground/10">
                {fob_data
                  .filter((student) => student.programme_name === programme)
                  .map((student, index) => (
                    <StudentList
                      key={student.matric_no}
                      student={student}
                      lms_activity={student.lms_activity}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="diploma" className="flex flex-col  gap-4 ">
          <p className="text-sm italic font-bold ">Diploma Students</p>
          {uniqueProgrammesDiploma.map((programme, index) => (
            <div key={index}>
              <p className="text-md font-bold py-2">
                <ChevronRight className="min-w-4 min-h-4 inline-block" />
                {programme}
              </p>
              <div className="flex flex-col gap-2 lg:grid grid-cols-2 pb-4 border-b-2 border-b-foreground/10">
                {fob_data
                  .filter((student) => student.programme_name === programme)
                  .map((student, index) => (
                    <StudentList
                      key={student.matric_no}
                      student={student}
                      lms_activity={student.lms_activity}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="bachelor" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold">Bachelor Students</p>
          {uniqueProgrammesBachelor.map((programme, index) => (
            <div key={index}>
              <p className="text-md font-bold py-2">
                <ChevronRight className="min-w-4 min-h-4 inline-block" />
                {programme}
              </p>
              <div className="flex flex-col gap-2 pb-4 border-b-2 border-b-foreground/10 lg:grid grid-cols-2">
                {fob_data
                  .filter((student) => student.programme_name === programme)
                  .map((student, index) => (
                    <StudentList
                      key={student.matric_no}
                      student={student}
                      lms_activity={student.lms_activity}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="master" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold">Master Students</p>
          {uniqueProgrammesMaster.map((programme, index) => (
            <div key={index}>
              <p className="text-md font-bold py-2">
                <ChevronRight className="min-w-4 min-h-4 inline-block" />
                {programme}
              </p>
              <div className="flex flex-col gap-2 pb-4 lg:grid grid-cols-2 border-b-2 border-b-foreground/10">
                {fob_data
                  .filter((student) => student.programme_name === programme)
                  .map((student, index) => (
                    <StudentList
                      key={student.matric_no}
                      student={student}
                      lms_activity={student.lms_activity}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="doctorate" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold">Doctorate Students</p>
          {uniqueProgrammesDoctorate.map((programme, index) => (
            <div key={index}>
              <p className="text-md font-bold py-2">
                <ChevronRight className="min-w-4 min-h-4 inline-block" />
                {programme}
              </p>
              <div className="flex flex-col gap-2 pb-4 lg:grid grid-cols-2 border-b-2 border-b-foreground/10">
                {fob_data
                  .filter((student) => student.programme_name === programme)
                  .map((student, index) => (
                    <StudentList
                      key={student.matric_no}
                      student={student}
                      lms_activity={student.lms_activity}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
