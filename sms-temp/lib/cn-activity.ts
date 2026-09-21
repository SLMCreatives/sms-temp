/**
 * CN (LMS) engagement, read from a_lms_activity.
 *
 * The distinction that matters throughout is between "we looked and they have
 * done nothing" and "we have no CN data for this student". Collapsing the
 * second into the first with `?? 0` counts 750 students as having zero visits
 * instead of 160: 499 Conventional students are not tracked in CN at all, and
 * another 91 online students simply have no row yet. Every predicate below
 * therefore requires the row to exist before it reports anything.
 *
 * Shared by the stat tile, the toolbar filter and the table column so the
 * count the team clicks and the rows they land on can never disagree.
 */

/** The minimum a row needs — lets lighter queries reuse this. */
export type CnActivityInput = {
  study_mode?: string | null;
  status?: string | null;
  a_lms_activity?: {
    course_visits?: number | null;
    /** Course progress as a fraction of 1, not a percentage. */
    latest_cp?: number | null;
  } | null;
};

/**
 * Only Active students are worth chasing on CN engagement. A withdrawn or
 * deferred student with no visits is the expected outcome, not outstanding
 * work, and leaving them in inflates every tier with people nobody will call.
 */
export function isActiveStudent(student: CnActivityInput): boolean {
  return student.status === "Active";
}

/** True when CN has been read for this student and reports no visits at all. */
export function hasZeroVisits(student: CnActivityInput): boolean {
  const lms = student.a_lms_activity;
  if (!lms) return false;
  return (lms.course_visits ?? 0) === 0;
}

/**
 * True when CN has been read and the student sits below `fraction` of the
 * course. Pass 0.1 for 10%, not 10 — latest_cp is stored 0..1.
 */
export function belowProgress(
  student: CnActivityInput,
  fraction: number
): boolean {
  const lms = student.a_lms_activity;
  if (!lms) return false;
  return (lms.latest_cp ?? 0) < fraction;
}

/**
 * True when the student should have CN activity but we hold none. Conventional
 * students are excluded: CN is not tracked for them, so a missing row is
 * expected rather than a gap worth reporting.
 */
export function hasNoCnData(student: CnActivityInput): boolean {
  if (student.a_lms_activity) return false;
  return student.study_mode === "Online";
}

export type CnFilterKey = "zero" | "under10" | "under20";

/**
 * The CN engagement cuts offered in the toolbar, weakest engagement first.
 *
 * They are deliberately nested rather than exclusive categories — every
 * zero-visit student is also under 10%, and every under-10% student is also
 * under 20% — so they read as escalating tiers of "how far behind is this
 * student", and only one can be applied at a time.
 *
 * Every tier is Active-only. The status test lives here rather than inside
 * hasZeroVisits / belowProgress because those are also used to colour the
 * table, where a withdrawn student's zero still deserves its red cell.
 *
 * To add a milestone for a future check, add an entry here: the column filter,
 * the toolbar select and its counts all read from this list.
 */
export const CN_ACTIVITY_FILTERS: {
  value: CnFilterKey;
  /** Shown in the toolbar select. */
  label: string;
  /** Shown in the active-filter chip under the toolbar. */
  chip: string;
  matches: (student: CnActivityInput) => boolean;
}[] = [
  {
    value: "zero",
    label: "0 CN visits",
    chip: "Active · 0 CN visits",
    matches: (student) => isActiveStudent(student) && hasZeroVisits(student)
  },
  {
    value: "under10",
    label: "Under 10% progress",
    chip: "Active · CN progress under 10%",
    matches: (student) =>
      isActiveStudent(student) && belowProgress(student, 0.1)
  },
  {
    value: "under20",
    label: "Under 20% progress",
    chip: "Active · CN progress under 20%",
    matches: (student) =>
      isActiveStudent(student) && belowProgress(student, 0.2)
  }
];

export function getCnFilter(value: unknown) {
  return CN_ACTIVITY_FILTERS.find((option) => option.value === value) ?? null;
}
