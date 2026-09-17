import { createClient } from "@/lib/supabase/client";
import { StudentDashboardRow } from "@/lib/types/database";

const supabase = createClient();

export async function getData(): Promise<StudentDashboardRow[]> {
  // Order explicitly. Without it Postgres returns heap order, and updating a
  // row rewrites its tuple at the end of the heap — so ticking a check made
  // that student jump to a different position on the next refresh.
  // matric_no is the primary key, so the order is fully deterministic.
  const { data: students, error } = await supabase
    .from("a_students")
    .select("*, a_payments(*), a_lms_activity(*), a_engagements(*)")
    .in("intake_code", ["Sep-26", "July26"])
    .order("matric_no", { ascending: true })
    // Embedded rows are unordered too, and the table reads the latest outcome
    // with .at(-1) — so a newly logged engagement could otherwise land anywhere.
    .order("created_at", {
      referencedTable: "a_engagements",
      ascending: true
    })
    .limit(5000);

  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }

  return students as StudentDashboardRow[];
}
