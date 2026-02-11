import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { Students } from "@/app/student/studentColumns";
//import { ChevronRight } from "lucide-react";
import StudentListLegend from "@/components/legend";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { StudentList } from "@/components/student-list-nov25";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("nov25_students")
    .select("*, nov25_payment(*), nov25_engagements(*), nov25_lms_activity(*)");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function Jan26CPage() {
  const ptptn_data = await getData();
  const ptptn_active = ptptn_data.filter(
    (student) => student.status === "Active"
  );
  const ptptn = ptptn_active
    .filter((student) => student.nov25_payment?.payment_mode === "PTPTN")
    .toSorted((a, b) =>
      a.nov25_payment.proof === "FALSE"
        ? -1
        : b.nov25_payment.proof === "FALSE"
          ? 1
          : 0
    );

  const amirul_ptptn = ptptn.filter((student) => student.sst_id === 1);
  const farzana_ptptn = ptptn.filter((student) => student.sst_id === 2);
  const najwa_ptptn = ptptn.filter((student) => student.sst_id === 3);
  const ayu_ptptn = ptptn.filter((student) => student.sst_id === 4);
  /* 

  const uniqueProgrammesFoundation = [
    ...new Set(
      ptptn
        .filter((student) => student.study_level === "Foundation")
        .map((item) => item.programme_name)
    )
  ];

  const uniqueProgrammesDiploma = [
    ...new Set(
      ptptn
        .filter((student) => student.study_level === "Diploma")
        .map((item) => item.programme_name)
    )
  ];

  const uniqueProgrammesBachelor = [
    ...new Set(
      ptptn
        .filter((student) => student.study_level === "Bachelor")
        .map((item) => item.programme_name)
    )
  ];
 */
  /* const ptptn_amirul = ptptn_active.filter(
      (student) =>
        student.nov25_payment?.payment_mode === "PTPTN" &&
        student.nov25_payment.proof === "TRUE"
    ); */

  const ptptnFalse = ptptn_active.filter(
    (student) =>
      student.nov25_payment?.payment_mode === "PTPTN" &&
      student.nov25_payment.proof === "FALSE"
  );

  const ptptnPercentage = Math.round((ptptnFalse.length / ptptn.length) * 100);

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start gap-4 px-8 py-6">
      <p className="text-3xl italic font-bold">Online | Nov 25</p>
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
                  {ptptn_active.length}
                </span>
              </Label>
              <Progress id="active" value={100} className=" h-5"></Progress>
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-col w-full">
        <StudentListLegend />
      </div>
      <Tabs className="w-full" defaultValue="ptptn">
        <TabsList className="w-full">
          <TabsTrigger value="ptptn">PTPTN</TabsTrigger>
          <TabsTrigger value="amirul">Amirul</TabsTrigger>
          <TabsTrigger value="ayu">Ayu</TabsTrigger>
          <TabsTrigger value="farzana">Farzana</TabsTrigger>
          <TabsTrigger value="najwa">Najwa</TabsTrigger>
        </TabsList>
        <TabsContent value="ptptn" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold ">PTPTN Students</p>
          {ptptn.map((student, index) => (
            <StudentList
              key={student.matric_no}
              student={student}
              index={index}
              lms_activity={student.lms_activity}
            />
          ))}
        </TabsContent>
        <TabsContent value="amirul" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold ">Amirul</p>

          <div className="flex flex-col gap-2 pb-4 lg:grid grid-cols-2 border-b-2 border-b-foreground/10">
            {amirul_ptptn.map((student, index) => (
              <StudentList
                key={index}
                student={student}
                index={index}
                lms_activity={student.lms_activity}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ayu" className="flex flex-col gap-4 ">
          <p className="text-sm italic font-bold ">Ayu</p>
          <div className="flex flex-col gap-2 pb-4 lg:grid grid-cols-2 border-b-2 border-b-foreground/10">
            {ayu_ptptn.map((student, index) => (
              <StudentList
                key={student.matric_no}
                student={student}
                index={index}
                lms_activity={student.lms_activity}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="farzana" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold ">Farzana</p>

          <div className="flex flex-col gap-2 pb-4 lg:grid grid-cols-2 border-b-2 border-b-foreground/10">
            {farzana_ptptn.map((student, index) => (
              <StudentList
                key={student.matric_no}
                student={student}
                index={index}
                lms_activity={student.lms_activity}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="najwa" className="flex flex-col gap-4">
          <p className="text-sm italic font-bold ">Najwa</p>

          <div className="flex flex-col gap-2 pb-4 lg:grid grid-cols-2 border-b-2 border-b-foreground/10">
            {najwa_ptptn.map((student, index) => (
              <StudentList
                key={student.matric_no}
                student={student}
                index={index}
                lms_activity={student.lms_activity}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
