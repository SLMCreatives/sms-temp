import { StudentList } from "@/components/student-list";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { Students } from "../studentColumns";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StudentListLegend from "@/components/legend";

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

  const atRisk = fob_active.filter(
    (student) => student.lms_activity?.course_progress < 0.2
  );

  const atRiskpercentage =
    Math.round((atRisk.length / fob_active.length) * 100) + "%";

  const noResponse = fob_active.filter(
    (student) =>
      student.engagements[student.engagements.length - 1]?.outcome ===
      "no_response"
  );

  const engaged = fob_active.filter(
    (student) =>
      student.engagements.length >= 0 &&
      student.engagements[student.engagements.length - 1]?.created_at >=
        "2025-09-28"
  );

  const woneengaged = fob_active.filter(
    (student) =>
      student.engagements.length >= 0 &&
      student.engagements[student.engagements.length - 1]?.created_at <
        "2025-09-29"
  );

  const wonepercentage =
    Math.round((woneengaged.length / fob_active.length) * 100) + "%";

  const notEngaged = fob_active.length - engaged.length;

  const wonenotEngaged = fob_active.length - woneengaged.length;

  const notEngagedpercentage =
    Math.round((notEngaged / fob_active.length) * 100) + "%";

  const engagedPercentage =
    Math.round((engaged.length / fob_active.length) * 100) + "%";

  const noResponsePercentage =
    Math.round((noResponse.length / fob_active.length) * 100) + "%";

  const notLoggedIn = fob_active.filter(
    (student) => student.lms_activity?.last_login_at === null
  );

  const notLoggedInpercentage =
    Math.round((notLoggedIn.length / fob_active.length) * 100) + "%";

  const zeroprogress = fob_active.filter(
    (student) => student.lms_activity?.course_progress === 0
  );

  const zeroprogresspercentage =
    Math.round((zeroprogress.length / fob_active.length) * 100) + "%";

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start gap-4 px-8 py-6">
      <p className="text-2xl italic font-bold">Faculty of Business</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 justify-between w-full text-md">
        <Badge
          variant={"default"}
          className="w-full text-center py-2 justify-between lg:justify-center flex flex-row lg:flex-col col-span-2 lg:row-span-4 lg:text-2xl"
        >
          <span className="">Active Students</span> {fob_active.length}
        </Badge>
        <Badge
          variant={"destructive"}
          className="w-full text-center py-2 justify-between flex flex-row"
        >
          <span className="font-bold">Not Logged In</span> {notLoggedIn.length}{" "}
          ({notLoggedInpercentage})
        </Badge>
        <Badge
          variant={"destructive"}
          className="w-full text-center py-2 justify-between flex flex-row"
        >
          <span className="font-bold">0% Course Progress</span>{" "}
          {zeroprogress.length} ({zeroprogresspercentage})
        </Badge>

        <Badge
          variant={"destructive"}
          className="w-full text-center py-2 justify-between flex flex-row bg-yellow-600"
        >
          <span className="font-bold">Less than 20% CP</span> {atRisk.length} (
          {atRiskpercentage})
        </Badge>
        <Badge
          variant={"destructive"}
          className="w-full text-center py-2 justify-between flex flex-row"
        >
          <span className="font-bold">No Response</span> {noResponse.length} (
          {noResponsePercentage})
        </Badge>
        <Badge
          variant={"default"}
          className="w-full text-center py-2 justify-between flex flex-row bg-green-600 "
        >
          <span className="font-bold">W1 Engaged</span> {woneengaged.length} (
          {wonepercentage})
        </Badge>
        <Badge
          variant={"destructive"}
          className="w-full text-center py-2 justify-between flex flex-row"
        >
          <span className="font-bold">W1 Not Engaged</span> {wonenotEngaged} (
          {Math.round((wonenotEngaged / fob_active.length) * 100) + "%"})
        </Badge>
        <Badge
          variant={"default"}
          className="w-full text-center py-2 justify-between flex flex-row bg-green-600"
        >
          <span className="font-bold">W2 Engaged</span> {engaged.length} (
          {engagedPercentage})
        </Badge>
        <Badge
          variant={"destructive"}
          className="w-full text-center py-2 justify-between flex flex-row"
        >
          <span className="font-bold">W2 Not Engaged</span> {notEngaged} (
          {notEngagedpercentage})
        </Badge>
      </div>
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
