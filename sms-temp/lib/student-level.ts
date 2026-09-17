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

/** Broad academic bands used by the mobile filters. */
export type LevelGroup = "undergraduate" | "postgraduate";

/**
 * Derived from the first word of the programme name. Verified against the live
 * data, which uses exactly seven: Foundation, Certificate, Diploma, Bachelor
 * (undergraduate) and Master, Post-Graduate, Doctor (postgraduate).
 * "Post-Graduate" is the postgraduate diploma and is hyphenated in the data.
 */
const POSTGRADUATE_LEVELS = new Set([
  "master",
  "masters",
  "post-graduate",
  "postgraduate",
  "doctor",
  "doctorate",
  "phd"
]);

const UNDERGRADUATE_LEVELS = new Set([
  "foundation",
  "certificate",
  "diploma",
  "bachelor",
  "bachelors"
]);

export function levelGroupOf(
  programmeName: string | null | undefined
): LevelGroup | null {
  const level = getStudentLevel(programmeName)?.toLowerCase();
  if (!level) return null;
  if (POSTGRADUATE_LEVELS.has(level)) return "postgraduate";
  if (UNDERGRADUATE_LEVELS.has(level)) return "undergraduate";
  return null;
}

/** Prefix marking a filter value as a band rather than a single level. */
export const LEVEL_GROUP_PREFIX = "group:";

export function levelGroupFilterValue(group: LevelGroup) {
  return `${LEVEL_GROUP_PREFIX}${group}`;
}

/** Returns the band when the value is a group token, else null. */
export function parseLevelGroupFilter(value: string): LevelGroup | null {
  if (!value.startsWith(LEVEL_GROUP_PREFIX)) return null;
  const group = value.slice(LEVEL_GROUP_PREFIX.length);
  return group === "undergraduate" || group === "postgraduate" ? group : null;
}

export const LEVEL_GROUPS: { value: LevelGroup; label: string; short: string }[] =
  [
    { value: "undergraduate", label: "Undergraduate", short: "UG" },
    { value: "postgraduate", label: "Postgraduate", short: "PG" }
  ];
