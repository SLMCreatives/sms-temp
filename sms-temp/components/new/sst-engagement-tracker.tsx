/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Student } from "@/lib/types/database";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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

const sstMembers = [
  { value: 1, label: "Amirul", image: "/sst/amirul.png" },
  { value: 2, label: "Farzana", image: "/sst/farzana.png" },
  { value: 3, label: "Najwa", image: "/sst/najwa.png" },
  { value: 4, label: "Ayu", image: "/sst/ayu.jpeg" },
  { value: 5, label: "Miruthala" }
];

export function SSTEngagementTracker({ data }: StudentMetricsProps) {
  const [filteredIntake, setFilteredIntake] = useState("all");
  const db_students = data as Student[];

  const sstEngagementData = sstMembers.map((member) => {
    const memberData = db_students.filter(
      (student) => student.sst_id === member.value
    );

    const totalStudents = memberData.length;
    const activeStudents = memberData.filter(
      (student) => student.status === "Active" || student.status === "At-Risk"
    ).length;

    const engagedStudents = memberData.filter(
      (student) =>
        student.a_engagements &&
        student.a_engagements.length > 0 &&
        student.a_engagements.at(-1)?.outcome !== "no_response"
    ).length;

    const no_responseStudents = memberData.filter(
      (student) =>
        (student.a_engagements &&
          student.a_engagements.some(
            (engagement) => engagement.outcome === "no_response"
          ) &&
          student.a_engagements.at(-1)?.outcome !== "no_response") ||
        (student.a_engagements &&
          student.a_engagements.at(-1)?.outcome === "no_response")
    ).length;

    const no_responseRate =
      totalStudents > 0 ? (no_responseStudents / totalStudents) * 100 : 0;

    const engagementRate =
      totalStudents > 0 ? (engagedStudents / totalStudents) * 100 : 0;

    const withdrawnStudents = memberData.filter(
      (student) => student.status === "Withdraw"
    ).length;

    const withdrawRate =
      totalStudents > 0 ? (withdrawnStudents / totalStudents) * 100 : 0;

    return {
      name: member.label,
      total: totalStudents,
      active: activeStudents,
      engaged: engagedStudents,
      engagementRate: engagementRate,
      no_response: no_responseStudents,
      no_responseRate: no_responseRate,
      withdrawn: withdrawnStudents,
      withdrawRate: withdrawRate
    };
  });

  const intakes = [
    { value: "all", label: "All (Mar-26, Jan-26)" },
    { value: "MAR26", label: "March 2026" },
    { value: "JAN26", label: "January 2026" }
    /*     { value: "NOV25", label: "November 2025" }
     */
  ];

  const handleIntakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilteredIntake(e.target.value);
    if (e.target.value === "all") {
      setFilteredData(sstEngagementData);
    } else {
      const filtered = sstEngagementData.map((member) => {
        const memberData = db_students.filter(
          (student) =>
            student.sst_id ===
              sstMembers.find((m) => m.label === member.name)?.value &&
            student.intake_code === e.target.value
        );

        const totalStudents = memberData.length;
        const activeStudents = memberData.filter(
          (student) =>
            student.status === "Active" || student.status === "At-Risk"
        ).length;

        const engagedStudents = memberData.filter(
          (student) =>
            student.a_engagements &&
            student.a_engagements.length > 0 &&
            student.a_engagements.at(-1)?.outcome !== "no_response"
        ).length;

        const no_responseStudents = memberData.filter(
          (student) =>
            student.a_engagements &&
            student.a_engagements.at(-1)?.outcome === "no_response"
        ).length;

        const no_responseRate =
          totalStudents > 0 ? (no_responseStudents / totalStudents) * 100 : 0;

        const engagementRate =
          totalStudents > 0 ? (engagedStudents / totalStudents) * 100 : 0;

        const withdrawnStudents = memberData.filter(
          (student) => student.status === "Withdraw"
        ).length;

        const withdrawRate =
          totalStudents > 0 ? (withdrawnStudents / totalStudents) * 100 : 0;

        return {
          name: member.name,
          total: totalStudents,
          active: activeStudents,
          engaged: engagedStudents,
          engagementRate: engagementRate,
          no_response: no_responseStudents,
          no_responseRate: no_responseRate,
          withdrawn: withdrawnStudents,
          withdrawRate: withdrawRate
        };
      });

      setFilteredData(filtered);
    }
  };

  const [filteredData, setFilteredData] = useState<any[]>(sstEngagementData);

  return (
    <div className="w-full rounded-lg border border-stone-400/50">
      <div className="flex items-center justify-between flex-row px-4 pt-6 pb-4 border-b border-stone-400/50">
        <h2 className="text-lg font-semibold">SST Engagement Tracker</h2>
        <div className="flex flex-row gap-4 border-l border-stone-400/50 pl-4">
          <Label htmlFor="intake" className="text-sm font-medium">
            Intake:
          </Label>
          <Select
            onValueChange={(value) => {
              handleIntakeChange({
                target: { value }
              } as React.ChangeEvent<HTMLSelectElement>);
            }}
            value={filteredIntake}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Intake" />
            </SelectTrigger>
            <SelectContent>
              {intakes.map((intake) => (
                <SelectItem key={intake.value} value={intake.value}>
                  {intake.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4">
        <table className="w-full text-sm ">
          <thead>
            <tr>
              <th className="text-left w-[fit] py-2">SST Advisor</th>
              <th className="text-center w-[100px]">Assigned</th>
              <th className="text-center w-[100px]">Engaged</th>
              <th className="text-center w-[40px]">%</th>
              <th className="text-center w-[100px]">No Resp</th>
              <th className="text-center w-[40px]">%</th>
              <th className="text-center w-[100px]">Withdraw</th>
              <th className="text-center w-[40px]">%</th>
            </tr>
          </thead>
          <tbody className="">
            {(filteredData || sstEngagementData).map((member) => (
              <tr key={member.name} className="">
                <td className="text-left py-2 flex items-center justify-start">
                  <Avatar>
                    <AvatarImage
                      src={
                        sstMembers.find((m) => m.label === member.name)?.image
                      }
                      width={200}
                      height={200}
                      className="h-8 w-8 rounded-full"
                    />
                    <AvatarFallback> {member.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2">{member.name}</span>
                </td>
                <td className="text-center">{member.total}</td>
                <td className="text-center">{member.engaged}</td>
                <td
                  className={`text-center ${member.engagementRate >= 80 ? "" : "text-red-600"}`}
                >
                  {member.engagementRate.toFixed(0)}%
                </td>
                <td className="text-center">{member.no_response}</td>
                <td
                  className={`text-center ${member.no_responseRate >= 20 ? "text-red-600" : ""}`}
                >
                  {member.no_responseRate.toFixed(0)}%
                </td>
                <td className="text-center">{member.withdrawn}</td>
                <td
                  className={`text-center ${member.withdrawRate >= 10 ? "text-red-600" : ""}`}
                >
                  {member.withdrawRate.toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-stone-100 dark:bg-stone-700 rounded-lg border-y border-stone-400 my-4">
              <th className="text-left py-2 pl-4">Total</th>
              <th className="text-center">
                {filteredData.reduce((acc, member) => acc + member.total, 0) ||
                  sstEngagementData.reduce(
                    (acc, member) => acc + member.total,
                    0
                  )}
              </th>
              <th className="text-center">
                {filteredData.reduce(
                  (acc, member) => acc + member.engaged,
                  0
                ) ||
                  sstEngagementData.reduce(
                    (acc, member) => acc + member.engaged,
                    0
                  )}
              </th>
              <th className="text-center">
                {filteredData.reduce(
                  (acc, member) =>
                    acc + parseFloat(member.engagementRate.toFixed(0) || "0"),
                  0
                ) / (filteredData.length || 1) ||
                  sstEngagementData.reduce(
                    (acc, member) =>
                      acc + parseFloat(member.engagementRate.toFixed(0) || "0"),
                    0
                  ) / sstEngagementData.length ||
                  0}
                %
              </th>
              <th className="text-center">
                {filteredData.reduce(
                  (acc, member) => acc + member.no_response,
                  0
                ) ||
                  sstEngagementData.reduce(
                    (acc, member) => acc + member.no_response,
                    0
                  )}
              </th>
              <th className="text-center">
                {filteredData.reduce(
                  (acc, member) =>
                    acc + parseFloat(member.no_responseRate.toFixed(0) || "0"),
                  0
                ) / (filteredData.length || 1) ||
                  sstEngagementData.reduce(
                    (acc, member) =>
                      acc +
                      parseFloat(member.no_responseRate.toFixed(0) || "0"),
                    0
                  ) / sstEngagementData.length ||
                  0}
                %
              </th>
              <th className="text-center">
                {filteredData.reduce(
                  (acc, member) => acc + member.withdrawn,
                  0
                ) ||
                  sstEngagementData.reduce(
                    (acc, member) => acc + member.withdrawn,
                    0
                  )}
              </th>

              <th className="text-center">
                {filteredData.reduce(
                  (acc, member) =>
                    acc + parseFloat(member.withdrawRate.toFixed(0) || "0"),
                  0
                ) / (filteredData.length || 1) ||
                  sstEngagementData.reduce(
                    (acc, member) =>
                      acc + parseFloat(member.withdrawRate.toFixed(0) || "0"),
                    0
                  ) / sstEngagementData.length ||
                  0}
                %
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
