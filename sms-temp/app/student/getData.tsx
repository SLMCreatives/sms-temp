import { createClient } from "@/lib/supabase/client";
import { StudentDashboardRow } from "@/lib/types/database";

const supabase = createClient();

/** Intakes the students workspace covers. */
export const DASHBOARD_INTAKES = ["Sep-26", "July26"];

/**
 * The one read behind the students workspace. The server page calls it through
 * getData(); the browser calls it again whenever realtime says a row changed,
 * so both sides must produce exactly the same shape and order.
 *
 * Throws on error — getData() swallows it for the server render, the realtime
 * hook needs to know so it can keep the rows it already has.
 */
export async function fetchStudents(): Promise<StudentDashboardRow[]> {
  // Order explicitly. Without it Postgres returns heap order, and updating a
  // row rewrites its tuple at the end of the heap — so ticking a check made
  // that student jump to a different position on the next refresh.
  // matric_no is the primary key, so the order is fully deterministic.
  const { data: students, error } = await supabase
    .from("a_students")
    .select("*, a_payments(*), a_lms_activity(*), a_engagements(*)")
    .in("intake_code", DASHBOARD_INTAKES)
    .order("matric_no", { ascending: true })
    // Embedded rows are unordered too, and the table reads the latest outcome
    // with .at(-1) — so a newly logged engagement could otherwise land anywhere.
    .order("created_at", {
      referencedTable: "a_engagements",
      ascending: true
    })
    .limit(5000);

  if (error) throw new Error(error.message);

  return students as StudentDashboardRow[];
}

export async function getData(): Promise<StudentDashboardRow[]> {
  try {
    return await fetchStudents();
  } catch (error) {
    console.log(
      "Error fetching data:",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}
