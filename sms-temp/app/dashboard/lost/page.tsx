import { Students } from "@/app/student/studentColumns";
import { DataTable } from "./data_table";
import { columns } from "./lost_columns";
import { createClient } from "@/lib/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("students")
    .select("*, lms_activity(*), engagements(*)")
    .neq("status", "Active");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function DemoPage() {
  const data = await getData();
  const data_lost = data.filter(
    (student) => student.status === "Withdraw" || student.status === "Deferred"
  );

  const data_atrisk = data.filter((student) => student.status === "At Risk");
  const fob_atrisk = data_atrisk.filter(
    (student) => student.faculty_code === "FOB"
  );
  const feh_atrisk = data_atrisk.filter(
    (student) => student.faculty_code === "FEH"
  );
  const sit_atrisk = data_atrisk.filter(
    (student) => student.faculty_code === "SIT"
  );

  const fob_data = data.filter(
    (student) => student.faculty_code === "FOB" && student.status !== "Active"
  );
  const feh_data = data.filter(
    (student) => student.faculty_code === "FEH" && student.status !== "Active"
  );
  const sit_data = data.filter(
    (student) => student.faculty_code === "SIT" && student.status !== "Active"
  );

  const uniqueprogramesfob = [
    ...new Set(fob_data.map((item) => item.programme_name))
  ];

  const uniqueprogramesfeh = [
    ...new Set(feh_data.map((item) => item.programme_name))
  ];

  const uniqueprogramessit = [
    ...new Set(sit_data.map((item) => item.programme_name))
  ];

  const admissionDates = [...new Set(data.map((item) => item.admission_date))];

  const formattedaddDates = (dateString: string) => {
    const day = dateString.split("/")[0];
    const month = dateString.split("/")[1];
    const year = dateString.split("/")[2];

    return `${year}-${month}-${day}`;
  };

  const realAdmissionsDates = admissionDates.map((date) =>
    formattedaddDates(date)
  );

  const orientationDay = new Date("2025-09-13");

  const daysBetween = (date1: Date, date2: Date) =>
    Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));

  const waitTimes = realAdmissionsDates.map((date) =>
    daysBetween(new Date(date), orientationDay)
  );

  const averageWaitTime =
    waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;

  const fob_lost = data_lost.filter(
    (student) => student.faculty_code === "FOB"
  );
  const feh_lost = data_lost.filter(
    (student) => student.faculty_code === "FEH"
  );
  const sit_lost = data_lost.filter(
    (student) => student.faculty_code === "SIT"
  );

  const db_students = 974;

  const attrition_rate = (
    ((data_atrisk.length + data_lost.length) / db_students) *
    100
  ).toFixed(2);
  const lost_rate = data_lost.length / db_students;
  const atrisk_rate = data_atrisk.length / db_students;

  return (
    <div className="container mx-auto py-10 space-y-4 max-w-md lg:max-w-5xl px-8">
      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-row flex-nowrap justify-between items-center ">
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold ">Total At Risk:</p>
            <p className="text-sm text-muted-foreground italic text-balance">
              FOB - {fob_atrisk.length} | FEH - {feh_atrisk.length} | SIT -{" "}
              {sit_atrisk.length}
            </p>
          </div>
          <p className="text-xl font-bold text-nowrap p-4 bg-red-50 text-amber-800 rounded-lg">
            {data_atrisk.length} students
          </p>
        </div>
        <div className="flex flex-row flex-nowrap justify-between items-center ">
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold ">Total Lost:</p>
            <p className="text-sm text-muted-foreground italic text-balance">
              FOB - {fob_lost.length} | FEH - {feh_lost.length} | SIT -{" "}
              {sit_lost.length}
            </p>
          </div>
          <p className="text-xl font-bold text-nowrap p-4 bg-red-200 text-red-800 rounded-lg">
            {data_lost.length} students
          </p>
        </div>
        <div className="flex flex-row flex-nowrap justify-between items-center ">
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold ">Average Wait Time:</p>
            <p className="text-sm text-muted-foreground italic text-balance">
              From Application to Orientation (13 Sept 2025)
            </p>
          </div>
          <p className="text-xl font-bold text-nowrap p-4 bg-stone-200 rounded-lg">
            {Math.round(averageWaitTime)} days
          </p>
        </div>
        <div className="flex flex-row flex-nowrap justify-between items-center ">
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold ">Actual Attrition Rate:</p>
            <p className="text-sm text-muted-foreground italic text-balance">
              Total Apps (974) | Lost Rate {Math.round(lost_rate * 100)}% | At
              Risk Rate {Math.round(atrisk_rate * 100)}%
            </p>
          </div>
          <p className="text-xl font-bold text-nowrap p-4 bg-stone-200 rounded-lg">
            {attrition_rate}%
          </p>
        </div>
      </div>

      <Separator />
      <div className="flex flex-col gap-2">
        <Badge variant={"default"} className="text-xl sticky top-10 z-50">
          FoB{" "}
          <span className="text-sm italic">({fob_data.length} students)</span>
        </Badge>
        <div className="lg:grid grid-cols-2 gap-x-10">
          {uniqueprogramesfob.map((programme, index) => (
            <div key={index} className="pb-4">
              <div className="flex flex-row justify-between pb-2">
                <p className="text-lg font-bold">{programme}</p>
                <p className="text-lg text-muted-foreground">
                  {
                    fob_data.filter(
                      (student) => student.programme_name === programme
                    ).length
                  }
                </p>
              </div>
              <DataTable
                columns={columns}
                data={fob_data.filter(
                  (student) => student.programme_name === programme
                )}
              />
              <Separator />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Badge variant={"default"} className="text-xl sticky top-10 z-50">
          FEH{" "}
          <span className="text-sm italic">({feh_data.length} students)</span>
        </Badge>

        <div className="lg:grid grid-cols-2 gap-x-10">
          {uniqueprogramesfeh.map((programme, index) => (
            <div key={index} className="pb-4">
              <div className="flex flex-row justify-between">
                <p className="text-lg font-bold">{programme}</p>
                <p className="text-lg text-muted-foreground">
                  {
                    feh_data.filter(
                      (student) => student.programme_name === programme
                    ).length
                  }
                </p>
              </div>
              <DataTable
                columns={columns}
                data={feh_data.filter(
                  (student) => student.programme_name === programme
                )}
              />
              <Separator />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Badge variant={"default"} className="text-xl sticky top-10 z-50">
          SIT{" "}
          <span className="text-sm italic">({sit_data.length} students)</span>
        </Badge>

        <div className="lg:grid grid-cols-2 gap-x-10">
          {uniqueprogramessit.map((programme, index) => (
            <div key={index} className="pb-4">
              <div className="flex flex-row justify-between">
                <p className="text-lg font-bold">{programme}</p>
                <p className="text-lg text-muted-foreground">
                  {
                    sit_data.filter(
                      (student) => student.programme_name === programme
                    ).length
                  }
                </p>
              </div>
              <DataTable
                columns={columns}
                data={sit_data.filter(
                  (student) => student.programme_name === programme
                )}
              />
              <Separator />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
