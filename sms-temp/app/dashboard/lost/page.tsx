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
    .select("*")
    .neq("status", "Active");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function DemoPage() {
  const data = await getData();

  const fob_data = data.filter((student) => student.faculty_code === "FOB");
  const feh_data = data.filter((student) => student.faculty_code === "FEH");
  const sit_data = data.filter((student) => student.faculty_code === "SIT");

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

  return (
    <div className="container mx-auto py-10 space-y-4 max-w-lg lg:max-w-5xl px-8">
      <div className="flex flex-row flex-nowrap justify-between items-center ">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold ">Total Lost:</p>
          <p className="text-sm text-muted-foreground italic text-balance">
            FOB - {fob_data.length} | FEH - {feh_data.length} | SIT -{" "}
            {sit_data.length}
          </p>
        </div>
        <p className="text-2xl font-bold text-nowrap p-4 bg-stone-200 rounded-lg">
          {data.length}
        </p>
      </div>
      <div className="flex flex-row flex-nowrap justify-between items-center ">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold ">Average Wait Time:</p>
          <p className="text-sm text-muted-foreground italic text-balance">
            From Application to Orientation (13 Sept 2025)
          </p>
        </div>
        <p className="text-2xl font-bold text-nowrap p-4 bg-stone-200 rounded-lg">
          {Math.round(averageWaitTime)} days
        </p>
      </div>

      <Separator />
      <div className="flex flex-col gap-2">
        <Badge variant={"default"} className="text-xl sticky top-10">
          FoB
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
        <Badge variant={"default"} className="text-xl sticky top-10">
          FEH
        </Badge>

        <div className="">
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
        <Badge variant={"default"} className="text-xl sticky top-10">
          SIT
        </Badge>

        <div className="">
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
