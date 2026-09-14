import { createClient } from "@/lib/supabase/server";
import { getSstById, SstMember } from "@/lib/sst-members";

const MANAGER_EMAIL = "sulaiman.munaff@unitar.my";

export type Viewer = {
  email: string | null;
  isManager: boolean;
  /** The signed-in user's own SST record, when they are on the roster. */
  sst: SstMember | null;
};

/**
 * Resolves who is looking at the student list, so the page can default to
 * showing that person's own students.
 */
export async function getViewer(): Promise<Viewer> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const email = user?.email ?? null;
  const isManager = email === MANAGER_EMAIL;

  if (!email) return { email, isManager, sst: null };

  const { data: sstRow } = await supabase
    .from("sst")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  const member = getSstById(sstRow?.id);

  return {
    email,
    isManager: isManager || sstRow?.role === "Manager" || !!member?.isManager,
    // The manager carries no caseload, so there is no "my students" for them.
    sst: member && !member.isManager ? member : null
  };
}
