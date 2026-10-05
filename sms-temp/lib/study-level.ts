/**
 * Study level, derived from programme_name.
 *
 * a_students has no study_level column — the Student interface in
 * lib/types/database.ts declares one, but the table does not have it, so
 * selecting it errors. The level is instead carried in the programme name
 * ("Bachelor of Education (Hons) - Online"), which every row in the current
 * intakes fills in, so deriving it classifies 100% of students with nothing
 * left over.
 */

export const STUDY_LEVELS = [
  "Foundation",
  "Certificate",
  "Diploma",
  "Bachelor",
  "Postgrad Diploma",
  "Master",
  "Doctorate"
] as const;

export type StudyLevel = (typeof STUDY_LEVELS)[number] | "Other";

/**
 * Order matters. "Post-Graduate Diploma in Education" contains both
 * "diploma" and a postgraduate marker, so the postgraduate tests run first —
 * otherwise 81 postgraduate students would be filed under Diploma.
 */
export function studyLevelOf(programmeName: string | null): StudyLevel {
  const name = (programmeName ?? "").toLowerCase();
  if (!name) return "Other";
  if (name.includes("doctor") || name.includes("phd")) return "Doctorate";
  if (name.includes("master")) return "Master";
  if (name.includes("post-graduate diploma") || name.includes("postgraduate diploma"))
    return "Postgrad Diploma";
  if (name.includes("bachelor")) return "Bachelor";
  if (name.includes("diploma")) return "Diploma";
  if (name.includes("foundation")) return "Foundation";
  if (name.includes("certificate")) return "Certificate";
  return "Other";
}
