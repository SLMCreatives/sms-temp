/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Mail,
  Phone,
  Globe,
  BookOpen,
  BanknoteArrowUp,
  IdCard,
  Brackets
} from "lucide-react";
import { Students } from "@/app/student/studentColumns";
import ChangeStatusForm from "../change-status";
import { StudentDashboardRow } from "@/lib/types/database";

const informationTabs = [
  { label: "Status", value: "student.status", icon: Brackets },
  { label: "Matric No", value: "student.matric_no", icon: IdCard },
  { label: "Email", value: "student.email.toLowerCase()", icon: Mail },
  { label: "Phone", value: "student.phone", icon: Phone }
];

export default function StudentInfo({
  student
}: {
  student: StudentDashboardRow;
}) {
  return (
    <div className="space-y-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2 items-start">
        <p className="font-semibold">Student Information</p>
        {informationTabs.map((tab) => (
          <div
            key={tab.value}
            className="grid grid-cols-[1fr,auto] items-center gap-3"
          >
            {/* <p className="text-sm text-muted-foreground">{tab.label}</p> */}
            <tab.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="font-medium text-xs break-all text-right line-clamp-1">
              {eval(tab.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
