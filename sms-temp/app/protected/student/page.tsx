import { createClient } from "@/lib/supabase/client";
import { studentColumns, Students } from "./studentColumns";
import DataTable from "./studentTable";

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
  return (
    <div className="flex flex-col container mx-auto">
      <h1 className="font-bold text-2xl mb-4">Student List</h1>
      <DataTable columns={studentColumns} data={data} />
    </div>
  );
}
