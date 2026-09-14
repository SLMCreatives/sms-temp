/**
 * Study level is not stored on its own column — it is the first word of the
 * programme name ("Diploma in Business Administration" -> "Diploma"). This
 * matches how the faculty tracker already derives level.
 */
export function getStudentLevel(
  programmeName: string | null | undefined
): string | null {
  const first = programmeName?.trim().split(/\s+/)[0];
  return first ? first : null;
}

/** Academic order, so the filter reads Foundation -> Doctor, not alphabetically. */
export const LEVEL_ORDER = [
  "Foundation",
  "Certificate",
  "Diploma",
  "Bachelor",
  "Master",
  "Doctor",
  "Doctorate"
];

/** Sorts known levels by academic order and leaves anything unexpected at the end. */
export function sortLevels(levels: string[]): string[] {
  return [...levels].sort((a, b) => {
    const ai = LEVEL_ORDER.indexOf(a);
    const bi = LEVEL_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

/** Distinct levels present in a set of students, in academic order. */
export function levelOptionsFrom(
  students: { programme_name?: string | null }[]
): string[] {
  const levels = new Set<string>();
  for (const student of students) {
    const level = getStudentLevel(student.programme_name);
    if (level) levels.add(level);
  }
  return sortLevels(Array.from(levels));
}
