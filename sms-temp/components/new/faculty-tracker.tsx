"use client";

import { Student } from "@/lib/types/database";
import { useMemo, useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";

interface StudentMetricsProps {
  data: Student[];
}

interface GroupedStudent {
  programme: string;
  faculty: string;
  count: number;
  withdraw: number;
  withdrawalRate: number;
  level: string;
}

const FACULTY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "FOB", label: "FOB" },
  { value: "FEH", label: "FEH" },
  { value: "FAiFT", label: "FAiFT" }
];

const INTAKE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "MAR26", label: "MAR26" },
  { value: "JAN26", label: "JAN26" }
  /*   { value: "NOV25", label: "NOV25" }
   */
];

const LEVEL_OPTIONS = [
  { value: "all", label: "All" },
  { value: "Foundation", label: "Foundation" },
  { value: "Diploma", label: "Diploma" },
  { value: "Bachelor", label: "Bachelor" },
  { value: "Master", label: "Master" },
  { value: "Doctor", label: "Doctor" }
];

export function FacultyTracker({ data }: StudentMetricsProps) {
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedIntake, setSelectedIntake] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Filter and group data with useMemo
  const tableData = useMemo(() => {
    let filtered = data;

    // Filter by faculty
    if (selectedFaculty !== "all") {
      filtered = filtered.filter(
        (item) => item.faculty_code === selectedFaculty
      );
    }

    // Filter by intake
    if (selectedIntake !== "all") {
      filtered = filtered.filter((item) => item.intake_code === selectedIntake);
    }

    // Filter by level    if (selectedLevel !== "all") {
    if (selectedLevel !== "all") {
      filtered = filtered.filter(
        (item) => item.programme_name?.split(" ")[0] === selectedLevel
      );
    }

    // Group by programme and faculty
    const groupedData = filtered.reduce<Record<string, GroupedStudent>>(
      (acc, item) => {
        const key = `${item.programme_name}-${item.faculty_code}`;

        if (!acc[key]) {
          acc[key] = {
            programme: item.programme_name || "Unknown",
            faculty: item.faculty_code || "Unknown",
            level: item.programme_name?.split(" ")[0] || "Unknown",
            count: 0,
            withdraw: 0,
            withdrawalRate: 0
          };
        }

        acc[key].count += 1;
        if (item.status === "Withdraw") {
          acc[key].withdraw += 1;
        }

        return acc;
      },
      {}
    );

    return Object.values(groupedData)
      .map((item) => ({
        ...item,
        withdrawalRate: item.count > 0 ? (item.withdraw / item.count) * 100 : 0
      }))
      .sort((a, b) => b.withdrawalRate - a.withdrawalRate);
  }, [data, selectedFaculty, selectedIntake, selectedLevel]);

  return (
    <div className="w-full rounded-lg border border-stone-400/50">
      <div className="flex items-center justify-between flex-row px-4 pt-6 pb-4 border-b border-stone-400/50">
        <h2 className="text-lg font-semibold">
          Engagement Tracker (by faculty)
        </h2>
        <div className="flex flex-row gap-4 border-l border-stone-400/50 pl-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="intake" className="text-sm font-medium">
              Intake:
            </Label>
            <Select value={selectedIntake} onValueChange={setSelectedIntake}>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Intake" />
              </SelectTrigger>
              <SelectContent>
                {INTAKE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="faculty" className="text-sm font-medium">
              Faculty:
            </Label>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent>
                {FACULTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="level" className="text-sm font-medium">
              Level:
            </Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-4 text-sm">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pb-2">Faculty</th>
              <th className="pb-2">Programme</th>
              <th className="pb-2 px-2 text-center">NE</th>
              <th className="pb-2 px-2 text-center">Withdrawn</th>
              <th className="pb-2 px-2 text-center">%</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t bg-stone-100 dark:bg-stone-700 rounded-lg border-y border-stone-400 my-4">
              <td className="py-2 font-semibold">
                {selectedFaculty === "all" ? "ALL" : selectedFaculty}
              </td>
              <td className="py-2 font-semibold">Total New Students</td>
              <td className="py-2 text-center font-semibold">
                {tableData.reduce((sum, item) => sum + item.count, 0)}
              </td>
              <td className="py-2 text-center font-semibold">
                {tableData.reduce((sum, item) => sum + item.withdraw, 0)}
              </td>
              <td className="py-2 text-center font-semibold">
                {tableData.length > 0
                  ? (
                      (tableData.reduce((sum, item) => sum + item.withdraw, 0) /
                        tableData.reduce((sum, item) => sum + item.count, 0)) *
                      100
                    ).toFixed(1) + "%"
                  : "0%"}
              </td>
            </tr>
            {tableData.map((item) => (
              <tr
                key={`${item.programme}-${item.faculty}`}
                className="border-t border-stone-400/50"
              >
                <td className="py-2">{item.faculty}</td>
                <td className="py-2">{item.programme}</td>
                <td className="py-2 text-center">{item.count}</td>
                <td className="py-2 text-center">{item.withdraw}</td>
                <td className="py-2 text-center">
                  {item.withdrawalRate.toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
