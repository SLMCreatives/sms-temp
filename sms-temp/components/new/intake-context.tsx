"use client";

import * as React from "react";

import { DEFAULT_INTAKE } from "@/lib/intakes";

type IntakeContextValue = {
  intake: string;
  setIntake: (value: string) => void;
};

const IntakeContext = React.createContext<IntakeContextValue | null>(null);

/**
 * Shares the selected intake between the page and the app header, which are
 * siblings rather than parent and child.
 */
export function IntakeProvider({
  children,
  defaultIntake = DEFAULT_INTAKE
}: {
  children: React.ReactNode;
  defaultIntake?: string;
}) {
  const [intake, setIntake] = React.useState(defaultIntake);
  const value = React.useMemo(() => ({ intake, setIntake }), [intake]);
  return (
    <IntakeContext.Provider value={value}>{children}</IntakeContext.Provider>
  );
}

/**
 * Falls back to the default intake when there is no provider, so components
 * shared with other sections (the header lives in several layouts) still work.
 */
export function useIntake(): IntakeContextValue {
  const ctx = React.useContext(IntakeContext);
  const [fallback, setFallback] = React.useState(DEFAULT_INTAKE);
  return ctx ?? { intake: fallback, setIntake: setFallback };
}
