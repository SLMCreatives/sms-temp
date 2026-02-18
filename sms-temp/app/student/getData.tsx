import { createClient } from "@/lib/supabase/client";
import { StudentDashboardRow } from "@/lib/types/database";

const supabase = createClient();

export async function getData(): Promise<StudentDashboardRow[]> {
  const { data: students, error } = await supabase
    .from("a_students")
    .select("*, a_payments(*), a_lms_activity(*), a_engagements(*)")
    .neq("intake_code", "SEPT25");

  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }

  return students as StudentDashboardRow[];
}
