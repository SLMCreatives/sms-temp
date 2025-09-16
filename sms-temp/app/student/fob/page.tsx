import { StudentList } from "@/components/student-list";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { Students } from "../studentColumns";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .eq("faculty_code", "FOB");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function FoBPage() {
  const fob_data = await getData();

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start gap-4 px-8 py-6">
      <p className="text-2xl italic font-bold">Faculty of Business</p>
      <div className="flex flex-row gap-2 justify-between divide-x-2">
        <p className="text-sm -mt-2">Active: {fob_data.length}</p>
        <p className="text-sm -mt-2 pl-2">At Risk: 0 </p>
        <p className="text-sm -mt-2 pl-2">Lost: 0 </p>
      </div>
      <Tabs className="lg:min-w-[760px] w-full" defaultValue="foundation">
        <TabsList className="w-full">
          <TabsTrigger value="foundation">FDT</TabsTrigger>
          <TabsTrigger value="diploma">DIP</TabsTrigger>
          <TabsTrigger value="bachelor">BAC</TabsTrigger>
          <TabsTrigger value="master">MAS</TabsTrigger>
          <TabsTrigger value="doctorate">DOC</TabsTrigger>
        </TabsList>
        <TabsContent
          value="foundation"
          className="flex flex-col lg:grid grid-cols-2 gap-4"
        >
          <p className="text-sm italic font-bold lg:col-span-2">
            Foundation Students
          </p>
          {fob_data
            .filter((student) => student.study_level === "Foundation")
            .map((student, index) => (
              <StudentList
                key={student.matric_no}
                student={student}
                index={index}
              />
            ))}
        </TabsContent>
        <TabsContent
          value="diploma"
          className="flex flex-col lg:grid grid-cols-2 gap-4 "
        >
          <p className="text-sm italic font-bold lg:col-span-2">
            Diploma Students
          </p>
          {fob_data
            .filter((student) => student.study_level === "Diploma")
            .map((student, index) => (
              <StudentList
                key={student.matric_no}
                student={student}
                index={index}
              />
            ))}
        </TabsContent>
        <TabsContent
          value="bachelor"
          className="flex flex-col lg:grid grid-cols-2 gap-4"
        >
          <p className="text-sm italic font-bold lg:col-span-2">
            Bachelor Students
          </p>
          {fob_data
            .filter((student) => student.study_level === "Bachelor")
            .map((student, index) => (
              <StudentList
                key={student.matric_no}
                student={student}
                index={index}
              />
            ))}
        </TabsContent>
        <TabsContent
          value="master"
          className="flex flex-col lg:grid grid-cols-2 gap-4"
        >
          <p className="text-sm italic font-bold lg:col-span-2">
            Master Students
          </p>
          {fob_data
            .filter((student) => student.study_level === "Master")
            .map((student, index) => (
              <StudentList
                key={student.matric_no}
                student={student}
                index={index}
              />
            ))}
        </TabsContent>
        <TabsContent
          value="doctorate"
          className="flex flex-col lg:grid grid-cols-2 gap-4"
        >
          <p className="text-sm italic font-bold lg:col-span-2">
            Doctorate Students
          </p>
          {fob_data
            .filter((student) => student.study_level === "Doctorate")
            .map((student, index) => (
              <StudentList
                key={student.matric_no}
                student={student}
                index={index}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
