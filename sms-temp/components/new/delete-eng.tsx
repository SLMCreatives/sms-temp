/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

async function deleteEngagement(engagementId: any) {
  // Optional: confirm
  const ok = window.confirm("Delete this engagement? This cannot be undone.");
  if (!ok) return;

  try {
    const { error } = await supabase
      .from("a_engagements")
      .delete()
      .eq("id", engagementId); // <-- change "id" to your primary key column name

    if (error) throw error;

    alert("Engagement deleted successfully.");
    // refresh UI / refetch list here
  } catch (err) {
    console.error(err);
  }
}

// Example button usage:
// <button onClick={() => deleteEngagement(row.id)}>Delete</button>
export default deleteEngagement;
