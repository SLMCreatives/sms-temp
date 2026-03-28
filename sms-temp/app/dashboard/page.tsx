import { StudentAttritionDashboard } from "@/components/student-attrition-dashboard";
import { createClient } from "@/lib/supabase/client";
import { Student } from "@/lib/types/database";

const supabase = createClient();

async function getData(): Promise<Student[]> {
  const { data: students, error } = await supabase
    .from("a_students")
    .select("*, a_lms_activity(*), a_engagements(*), a_payments(*)")
    .neq("intake_code", "SEPT25");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Student[];
}

export default async function Page() {
  const data = await getData();

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-5xl items-start justify-start">
      <StudentAttritionDashboard data={data} />
    </div>
  );
}
