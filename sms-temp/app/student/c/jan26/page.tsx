import { StudentListConven } from "@/components/student-list-c";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { Students } from "@/app/student/studentColumns";
import { ChevronRight } from "lucide-react";
import StudentListLegend from "@/components/legend";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("jan26_c_students")
    .select("*, jan26_c_payment(*)");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function SITPage() {
  const sit_data = await getData();
  const sit_active = sit_data.filter((student) => student.status === "Active");

  /* const uniqueProgrammesMaster = [
    ...new Set(
      sit_active
        .filter((student) => student.study_level === "Master")
        .map((item) => item.programme_name)
    )
  ]; */

  const uniqueProgrammesFoundation = [
    ...new Set(
      sit_active
        .filter((student) => student.study_level === "Foundation")
        .map((item) => item.programme_name)
    )
  ];

  const uniqueProgrammesDiploma = [
    ...new Set(
      sit_active
        .filter((student) => student.study_level === "Diploma")
        .map((item) => item.programme_name)
    )
  ];

  const uniqueProgrammesBachelor = [
    ...new Set(
      sit_active
        .filter((student) => student.study_level === "Bachelor")
        .map((item) => item.programme_name)
    )
  ];

  const notloggedin = sit_active.filter(
    (student) => student.jan26_lms_activity?.last_login_at === null
  );

  const notloggedinPercentage = Math.round(
    (notloggedin.length / sit_active.length) * 100
  );

  const zeroprogress = sit_active.filter(
    (student) =>
      !notloggedin.includes(student) &&
      student.jan26_lms_activity?.course_progress === 0
  );

  const zeroprogressPercentage = Math.round(
    (zeroprogress.length / sit_active.length) * 100
  );

  const less20progress = sit_active.filter(
    (student) =>
      !notloggedin.includes(student) &&
      student.jan26_lms_activity?.course_progress !== 0 &&
      student.jan26_lms_activity?.course_progress <= 0.2
  );

  const less20progressPercentage = Math.round(
    (less20progress.length / sit_active.length) * 100
  );

  const ptptn = sit_active.filter(
    (student) => student.jan26_payment?.payment_mode === "PTPTN"
  );

  const ptptnFalse = sit_active.filter(
    (student) =>
      student.jan26_payment?.payment_mode === "PTPTN" &&
      student.jan26_payment.proof === "FALSE"
  );

  const ptptnPercentage = Math.round((ptptnFalse.length / ptptn.length) * 100);

  //const ptptnPercentage = Math.round((ptptn.length / sit_active.length) * 100);
  /* const engaged = sit_active.filter((student) =>
    student.engagements.some((item) => item.created_at > "2025-09-28")
  );

  const woneengaged = sit_active.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at <= "2025-09-28")
  );

  const wonepercentage = Math.round(
    (woneengaged.length / sit_active.length) * 100
  );

  const wthreeengaged = sit_active.filter((student) =>
    student.engagements.some((item) => item.created_at >= "2025-10-06")
  );

  const wthreepercentage = Math.round(
    (wthreeengaged.length / sit_active.length) * 100
  );

  const wfourengaged = sit_active.filter((student) =>
    student.engagements.some((item) => item.created_at >= "2025-10-13")
  );

  const wfourpercentage = Math.round(
    (wfourengaged.length / sit_active.length) * 100
  );

  const engagedPercentage = Math.round(
    (engaged.length / sit_active.length) * 100
  );

  const foundation = sit_active.filter(
    (student) =>
      student.study_level === "Foundation" &&
      (student.lms_activity?.course_progress <= 0.2 ||
        student.lms_activity?.last_login_at === null)
  );
  const master = sit_active.filter(
    (student) =>
      student.study_level === "Master" &&
      (student.lms_activity?.course_progress <= 0.2 ||
        student.lms_activity?.last_login_at === null)
  );
  const diploma = sit_active.filter(
    (student) =>
      student.study_level === "Diploma" &&
      (student.lms_activity?.course_progress <= 0.2 ||
        student.lms_activity?.last_login_at === null)
  );
  const bachelor = sit_active.filter(
    (student) =>
      student.study_level === "Bachelor" &&
      (student.lms_activity?.course_progress <= 0.2 ||
        student.lms_activity?.last_login_at === null)
  );

  const foundationNotEngaged = foundation.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at >= "2025-10-13")
  );
  const masterNotEngaged = master.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at >= "2025-10-13")
  );
  const diplomaNotEngaged = diploma.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at >= "2025-10-13")
  );
  const bachelorNotEngaged = bachelor.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at >= "2025-10-13")
  );

  const toengage = sit_active.filter(
    (student) =>
      student.lms_activity?.course_progress <= 0.2 ||
      student.lms_activity?.last_login_at === null
  );

  const w4NotEngaged = toengage.filter(
    (student) =>
      !student.engagements.some((item) => item.created_at >= "2025-10-13")
  ); */

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start gap-4 px-8 py-6">
      <p className="text-3xl italic font-bold">Conventional | Jan 26</p>
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
                  {sit_active.length}
                </span>
              </Label>
              <Progress id="active" value={100} className=" h-5"></Progress>
              <Label
                htmlFor="notloggedin"
                className="flex flex-row w-full justify-between"
              >
                Not Logged In{" "}
                <span className="italic text-muted-foreground">
                  {notloggedin.length} ({notloggedinPercentage}%)
                </span>
              </Label>
              <Progress
                id="notloggedin"
                value={notloggedinPercentage}
                className=" h-5"
              ></Progress>

              <Label
                htmlFor="zeroprogress"
                className="flex flex-row w-full justify-between"
              >
                0% Progress{" "}
                <span className="italic text-muted-foreground">
                  {zeroprogress.length} ({zeroprogressPercentage}%)
                </span>
              </Label>
              <Progress
                id="zeroprogress"
                value={zeroprogressPercentage}
                className=" h-5"
              ></Progress>
              <Label
                htmlFor="less20progress"
                className="flex flex-row w-full justify-between"
              >
                ≤20% Progress{" "}
                <span className="italic text-muted-foreground">
                  {less20progress.length} ({less20progressPercentage}%)
                </span>
              </Label>
              <Progress
                id="less20progress"
                value={less20progressPercentage}
                className=" h-5"
              ></Progress>

              <Label
                htmlFor="ptptn"
                className="flex flex-row w-full justify-between"
              >
                PTPTN No Proof{" "}
                <span className="italic text-muted-foreground">
                  {ptptnFalse.length}/{ptptn.length}
                </span>
              </Label>
              <Progress
                id="ptptn"
                value={ptptnPercentage}
                className=" h-5"
              ></Progress>
              {/* <Label
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
              <Label
                htmlFor="week4engaged"
                className="flex flex-row w-full justify-between"
              >
                W4 Engaged{" "}
                <span className="italic text-muted-foreground">
                  {wfourengaged.length} ({wfourpercentage}%)
                </span>
              </Label>
              <Progress
                id="week3engaged"
                value={wfourpercentage}
                className=" h-5"
              ></Progress>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            W4 (At Risk only) - (13/10 - 17/10) by Level
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-y-2 gap-x-4 justify-between w-full mr-4">
              <Label className="flex flex-row w-full justify-between">
                Total At Risk
                <span className="italic text-muted-foreground">
                  {toengage.length - w4NotEngaged.length}/{toengage.length}
                </span>
              </Label>
              <Progress
                value={
                  ((toengage.length - w4NotEngaged.length) / toengage.length) *
                  100
                }
                className=" h-5 "
              ></Progress>
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
              /> */}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-col w-full">
        <StudentListLegend />
      </div>
      <Tabs className="w-full" defaultValue="foundation">
        <TabsList className="w-full">
          <TabsTrigger value="foundation">FDT</TabsTrigger>
          <TabsTrigger value="diploma">DIP</TabsTrigger>
          <TabsTrigger value="bachelor">BAC</TabsTrigger>
        </TabsList>
        <TabsContent value="foundation" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold ">Foundation Students</p>
          {uniqueProgrammesFoundation.map((programme, index) => (
            <div key={index}>
              <p className="text-md font-bold py-2">
                <ChevronRight className="min-w-4 min-h-4 inline-block" />
                {programme}
              </p>
              <div className="flex flex-col gap-2 pb-4 lg:grid grid-cols-2 border-b-2 border-b-foreground/10">
                {sit_data
                  .filter((student) => student.programme_name === programme)
                  .map((student, index) => (
                    <StudentListConven
                      key={student.matric_no}
                      student={student}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="diploma" className="flex flex-col gap-4 ">
          <p className="text-sm italic font-bold ">Diploma Students</p>
          {uniqueProgrammesDiploma.map((programme, index) => (
            <div key={index}>
              <p className="text-md font-bold py-2">
                <ChevronRight className="min-w-4 min-h-4 inline-block" />
                {programme}
              </p>
              <div className="flex flex-col gap-2 pb-4 lg:grid grid-cols-2 border-b-2 border-b-foreground/10">
                {sit_data
                  .filter((student) => student.programme_name === programme)
                  .map((student, index) => (
                    <StudentListConven
                      key={student.matric_no}
                      student={student}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="bachelor" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold ">Bachelor Students</p>
          {uniqueProgrammesBachelor.map((programme, index) => (
            <div key={index}>
              <p className="text-md font-bold py-2">
                <ChevronRight className="min-w-4 min-h-4 inline-block" />
                {programme}
              </p>
              <div className="flex flex-col gap-2 pb-4 lg:grid grid-cols-2 border-b-2 border-b-foreground/10">
                {sit_data
                  .filter((student) => student.programme_name === programme)
                  .map((student, index) => (
                    <StudentListConven
                      key={student.matric_no}
                      student={student}
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
