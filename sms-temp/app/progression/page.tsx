import { createClient } from "@/lib/supabase/client";
import { ProgressionStudents } from "../student/studentColumns";
import { PStudentList } from "@/components/p-student-list";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

const supabase = createClient();

async function getData(): Promise<ProgressionStudents[]> {
  const { data: students, error } = await supabase
    .from("dec25_p_students")
    .select("*");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as ProgressionStudents[];
}

export default async function ProgressionPage() {
  const studentList = await getData();

  const fia = studentList
    .filter(
      (student) =>
        student.programme_name === "FOUNDATION IN ARTS" ||
        student.programme_name === "FOUNDATION IN ARTS (ONLINE)"
    )
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const fim = studentList
    .filter(
      (student) =>
        student.programme_name === "FOUNDATION IN MANAGEMENT" ||
        student.programme_name === "FOUNDATION IN MANAGEMENT (ONLINE)"
    )
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const diba = studentList
    .filter(
      (student) =>
        student.programme_name === "DIPLOMA IN BUSINESS ADMINISTRATION" ||
        student.programme_name === "DIPLOMA IN BUSINESS ADMINISTRATION (ONLINE)"
    )
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const dece = studentList
    .filter(
      (student) =>
        student.programme_name === "DIPLOMA IN EARLY CHILDHOOD EDUCATION" ||
        student.programme_name ===
          "DIPLOMA IN EARLY CHILDHOOD EDUCATION - ONLINE"
    )
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  /* const registeredStudents = studentList.filter(
    (student) => student.registration_status === "Registered for 2026"
  ); */

  const fia_registered = fia.filter(
    (student) => student.registration_status === "Registered for 2026"
  );

  const fia_progression_rate = (
    (fia_registered.length / fia.length) *
    100
  ).toFixed(2);

  const fim_registered = fim.filter(
    (student) => student.registration_status === "Registered for 2026"
  );
  const fim_progression_rate = (
    (fim_registered.length / fim.length) *
    100
  ).toFixed(2);

  const diba_registered = diba.filter(
    (student) => student.registration_status === "Registered for 2026"
  );

  const diba_progression_rate = (
    (diba_registered.length / diba.length) *
    100
  ).toFixed(2);

  const dece_registered = dece.filter(
    (student) => student.registration_status === "Registered for 2026"
  );

  const dece_progression_rate = (
    (dece_registered.length / dece.length) *
    100
  ).toFixed(2);

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-5xl items-start justify-start px-4 py-10">
      <h1 className="font-bold text-2xl">January 2026 Progression</h1>

      <p className="text-muted-foreground italic">
        {studentList.length} students
      </p>

      <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            Progression Numbers (as of 30/12/2025)
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-x-8 justify-between w-full">
              <Label
                htmlFor="fia_progression"
                className="flex flex-row w-full justify-between"
              >
                FiA | {fia_registered.length}/{fia.length} students
                <span className="italic text-muted-foreground">
                  {fia_progression_rate}%
                </span>
              </Label>
              <Progress
                id="fia_progression"
                value={parseFloat(fia_progression_rate)}
                className=" h-5"
              ></Progress>
              <Label
                htmlFor="fim_progression"
                className="flex flex-row w-full justify-between"
              >
                FiM | {fim_registered.length}/{fim.length} students
                <span className="italic text-muted-foreground">
                  {fim_progression_rate}%
                </span>
              </Label>
              <Progress
                id="fim_progression"
                value={parseFloat(fim_progression_rate)}
                className=" h-5"
              ></Progress>
              <Label
                htmlFor="diba_progression"
                className="flex flex-row w-full justify-between"
              >
                DIBA | {diba_registered.length}/{diba.length} students
                <span className="italic text-muted-foreground">
                  {diba_progression_rate}%
                </span>
              </Label>
              <Progress
                id="diba_progression"
                value={parseFloat(diba_progression_rate)}
                className=" h-5"
              ></Progress>
              <Label
                htmlFor="dece_progression"
                className="flex flex-row w-full justify-between"
              >
                DECE | {dece_registered.length}/{dece.length} students
                <span className="italic text-muted-foreground">
                  {dece_progression_rate}%
                </span>
              </Label>
              <Progress
                id="dece_progression"
                value={parseFloat(dece_progression_rate)}
                className=" h-5"
              ></Progress>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Tabs
        defaultValue="fia"
        className="min-w-full pt-6 border-t-1 border-t-slate-200"
      >
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="fia">FIA</TabsTrigger>
          <TabsTrigger value="fim">FIM</TabsTrigger>
          <TabsTrigger value="diba">DIBA</TabsTrigger>
          <TabsTrigger value="dece">DECE</TabsTrigger>
        </TabsList>
        <TabsContent value="fia">
          <Label className="mb-4 text-lg font-semibold">
            Foundation in Arts ({fia.length} students)
          </Label>
          <div className="flex flex-col md:grid grid-cols-2 gap-2">
            {fia.map((student, index) => (
              <PStudentList
                key={student.matric_no}
                student={student}
                index={index}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="fim">
          <Label className=" mb-4 text-lg font-semibold">
            Foundation in Management ({fim.length} students)
          </Label>
          <div className="flex flex-col md:grid grid-cols-2 gap-2">
            {fim.map((student, index) => (
              <PStudentList
                key={student.matric_no}
                student={student}
                index={index}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="diba">
          <Label className="mb-4 text-lg font-semibold">
            Diploma in Business Administration ({diba.length} students)
          </Label>
          <div className="flex flex-col md:grid grid-cols-2 gap-2">
            {diba.map((student, index) => (
              <PStudentList
                key={student.matric_no}
                student={student}
                index={index}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="dece">
          <Label className="mb-4 text-lg font-semibold">
            Diploma in Early Childhood Education ({dece.length} students)
          </Label>
          <div className="flex flex-col md:grid grid-cols-2 gap-2">
            {dece.map((student, index) => (
              <PStudentList
                key={student.matric_no}
                student={student}
                index={index}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      {/* <Label className="mt-8 mb-4 text-lg font-semibold">
        Foundation in Management ({fim.length} students)
      </Label>
      {fim.map((student, index) => (
        <PStudentList key={student.matric_no} student={student} index={index} />
      ))}
      <Label className="mt-8 mb-4 text-lg font-semibold">
        Foundation in Arts ({fia.length} students)
      </Label>
      {fia.map((student, index) => (
        <PStudentList key={student.matric_no} student={student} index={index} />
      ))}
      <Label className="mt-8 mb-4 text-lg font-semibold">
        Diploma in Business Administration ({diba.length} students)
      </Label>
      {diba.map((student, index) => (
        <PStudentList key={student.matric_no} student={student} index={index} />
      ))}
      <Label className="mt-8 mb-4 text-lg font-semibold">
        Diploma in Early Childhood Education ({dece.length} students)
      </Label>
      {dece.map((student, index) => (
        <PStudentList key={student.matric_no} student={student} index={index} />
      ))} */}
    </div>
  );
}
