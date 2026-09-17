import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSstById } from "@/lib/sst-members";
import {
  buildVCardFile,
  ContactStudent,
  vcardFilename
} from "@/lib/vcard";

export const dynamic = "force-dynamic";

/**
 * Serves student contacts as a .vcf so the team can save them straight to a
 * phone. Generated server-side rather than as a client-side Blob because a
 * real response with a text/vcard content type is what makes iOS and Android
 * hand the file to Contacts.
 *
 * Query params:
 *   matric  one student (used by the record panel's "Save" button)
 *   intake  restrict to an intake code
 *   sst     restrict to one SST member's caseload
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const matric = params.get("matric");
  const intake = params.get("intake");
  const sstParam = params.get("sst");
  const sstId = sstParam ? Number(sstParam) : null;

  if (sstParam && Number.isNaN(sstId)) {
    return new Response("Invalid sst parameter", { status: 400 });
  }

  let query = supabase
    .from("a_students")
    .select(
      "matric_no, full_name, phone, email, programme_name, campus_code, intake_code, study_mode, sst_id"
    )
    .order("full_name", { ascending: true })
    .limit(5000);

  if (matric) {
    query = query.eq("matric_no", matric);
  } else {
    if (intake) query = query.eq("intake_code", intake);
    if (sstId !== null) query = query.eq("sst_id", sstId);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(`Could not load contacts: ${error.message}`, {
      status: 500
    });
  }

  const students: ContactStudent[] = (data ?? []).map((s) => ({
    ...s,
    ownerName: getSstById(s.sst_id)?.name ?? null
  }));

  const { body, included, skipped } = buildVCardFile(students);

  if (!included) {
    return new Response(
      "No contacts to save — none of these students have a phone number or email.",
      { status: 404 }
    );
  }

  const owner = sstId !== null ? getSstById(sstId)?.slug : null;
  const filename = matric
    ? vcardFilename([students[0]?.full_name ?? matric])
    : vcardFilename(["sst-contacts", owner, intake]);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Tells the caller how many were usable without parsing the body.
      "X-Contacts-Included": String(included),
      "X-Contacts-Skipped": String(skipped),
      "Cache-Control": "no-store"
    }
  });
}
