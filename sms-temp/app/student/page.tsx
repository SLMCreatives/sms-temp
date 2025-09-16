import { createClient } from "@/lib/supabase/client";
import { Students } from "./studentColumns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase.from("students").select("*");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function DemoPage() {
  const data = await getData();
  const n_fob = data.filter((student) => student.faculty_code === "FOB").length;
  const n_feh = data.filter((student) => student.faculty_code === "FEH").length;
  const n_sit = data.filter((student) => student.faculty_code === "SIT").length;
  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start">
      {/* <div className="md:flex hidden flex-col gap-2 items-start">
        <h1 className="font-bold text-2xl mb-4">New Student List</h1>
        <DataTable columns={studentColumns} data={data} />
      </div> */}
      <div className="flex flex-col gap-2 p-10">
        <h1 className="font-bold text-2xl mb-4 flex justify-between items-center">
          New Student List <Badge>Sept 2025</Badge>
        </h1>
        <p>
          UNITAR has {data.length} <span className="italic">active</span> new
          online students
        </p>
        <ul className="list-disc list-inside">
          <li>
            FoB has {n_fob} <span className="italic">active</span> students
          </li>
          <li>
            FEH has {n_feh} <span className="italic">active</span> students{" "}
          </li>
          <li>
            SIT has {n_sit} <span className="italic">active</span> students
          </li>
        </ul>
        <div className="flex flex-col py-10 gap-2 justify-between">
          <Button variant="default" asChild>
            <Link href="/student/fob">FoB</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/student/feh">FEH</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/student/sit">SIT</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
