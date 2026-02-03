import { StudentAttritionDashboard } from "@/components/student-attrition-dashboard_c325";
import { createClient } from "@/lib/supabase/client";
import { Students } from "../../student/studentColumns";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("sept25_students")
    .select(
      "*, lms_activity_w1(*), lms_activity_w2(*), lms_activity_w3(*), lms_activity_w4(*)"
    );
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
