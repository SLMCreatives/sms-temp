import { createClient } from "@/lib/supabase/client";
import { Students } from "../student/studentColumns";
import { PStudentList } from "@/components/p-student-list";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("dec25_p_students")
    .select("*");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function ProgressionPage() {
  const studentList = await getData();

  const studentList2 = studentList.filter(
    (student) => student.status !== "Registered for 2026"
  );

  /*  const foundation = studentList.filter(
    (student) => student.study_level === "FOUNDATION"
  );
  const diploma = studentList.filter(
    (student) => student.study_level === "DIPLOMA"
  ); */

  const fia = studentList2.filter(
    (student) => student.programme_name === "FOUNDATION IN ARTS"
  );
  const fim = studentList2.filter(
    (student) => student.programme_name === "FOUNDATION IN MANAGEMENT"
  );
  const diba = studentList2.filter(
    (student) => student.programme_name === "DIPLOMA IN BUSINESS ADMINISTRATION"
  );
  const dece = studentList2.filter(
    (student) =>
      student.programme_name === "DIPLOMA IN EARLY CHILDHOOD EDUCATION"
  );
  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-5xl items-start justify-start px-4">
      <h1 className="font-bold text-2xl mb-4">January 2026 Progression List</h1>
      <Tabs>
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="fia">FIA</TabsTrigger>
          <TabsTrigger value="fim">FIM</TabsTrigger>
          <TabsTrigger value="diba">DIBA</TabsTrigger>
          <TabsTrigger value="dece">DECE</TabsTrigger>
        </TabsList>
        <TabsContent value="fia">
          <Label className="mt-8 mb-4 text-lg font-semibold">
            Foundation in Arts ({fia.length} students)
          </Label>
          {fia.map((student, index) => (
            <PStudentList
              key={student.matric_no}
              student={student}
              index={index}
            />
          ))}
        </TabsContent>
        <TabsContent value="fim">
          <Label className="mt-8 mb-4 text-lg font-semibold">
            Foundation in Management ({fim.length} students)
          </Label>
          {fim.map((student, index) => (
            <PStudentList
              key={student.matric_no}
              student={student}
              index={index}
            />
          ))}
        </TabsContent>
        <TabsContent value="diba">
          <Label className="mt-8 mb-4 text-lg font-semibold">
            Diploma in Business Administration ({diba.length} students)
          </Label>
          {diba.map((student, index) => (
            <PStudentList
              key={student.matric_no}
              student={student}
              index={index}
            />
          ))}
        </TabsContent>
        <TabsContent value="dece">
          <Label className="mt-8 mb-4 text-lg font-semibold">
            Diploma in Early Childhood Education ({dece.length} students)
          </Label>
          {dece.map((student, index) => (
            <PStudentList
              key={student.matric_no}
              student={student}
              index={index}
            />
          ))}
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
