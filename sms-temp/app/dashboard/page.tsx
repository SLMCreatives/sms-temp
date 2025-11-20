import { StudentAttritionDashboard } from "@/components/student-attrition-dashboard";
import { createClient } from "@/lib/supabase/client";
import { Students } from "../student/studentColumns";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("nov25_students")
    .select("*, nov25_lms_activity(*), nov25_engagements(*)");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function Page() {
  const data = await getData();
  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-5xl items-start justify-start">
      <StudentAttritionDashboard data={data} />
    </div>
  );
}
