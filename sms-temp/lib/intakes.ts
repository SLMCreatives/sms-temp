export type Intake = { label: string; value: string };

/** Intakes the student workspace covers, newest first. */
export const INTAKES: Intake[] = [
  { label: "Sept-26", value: "Sep-26" },
  { label: "July-26", value: "July26" }
];

export const DEFAULT_INTAKE = INTAKES[0].value;

export function intakeLabel(value: string) {
  return INTAKES.find((i) => i.value === value)?.label ?? value;
}
