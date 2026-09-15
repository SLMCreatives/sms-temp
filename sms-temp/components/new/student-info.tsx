import {
  BookOpen,
  Building2,
  Globe,
  GraduationCap,
  IdCard,
  Mail,
  Phone
} from "lucide-react";

import { StudentDashboardRow } from "@/lib/types/database";
import { getStudentLevel } from "@/lib/student-level";

export default function StudentInfo({
  student
}: {
  student: StudentDashboardRow;
}) {
  const rows: {
    label: string;
    value: string | null | undefined;
    icon: React.ElementType;
    wrap?: boolean;
  }[] = [
    {
      label: "Programme",
      value: student.programme_name,
      icon: BookOpen,
      wrap: true
    },
    { label: "Faculty", value: student.faculty_code, icon: Building2 },
    {
      label: "Level",
      value: getStudentLevel(student.programme_name),
      icon: GraduationCap
    },
    { label: "Matric No", value: student.matric_no, icon: IdCard },
    { label: "Campus", value: student.campus_code, icon: Globe },
    { label: "Email", value: student.email?.toLowerCase(), icon: Mail },
    { label: "Phone", value: student.phone, icon: Phone }
  ];

  return (
    <dl className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[16px_72px_minmax(0,1fr)] items-start gap-2"
        >
          <row.icon className="mt-[1px] h-4 w-4 shrink-0 text-muted-foreground" />
          <dt className="text-[11px] leading-snug text-muted-foreground">
            {row.label}
          </dt>
          <dd
            className={`text-[11px] font-medium leading-snug ${
              row.wrap ? "break-words" : "truncate"
            }`}
          >
            {row.value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
