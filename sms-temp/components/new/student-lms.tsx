import { BookOpen, ChartSpline } from "lucide-react";
import { StudentDashboardRow } from "@/lib/types/database";

const lmsactivityTabs = [
  { label: "P", value: "student.programme_name", icon: BookOpen },
  {
    label: "W1",
    value:
      "student.a_lms_activity ? (student.a_lms_activity.cp_w1 * 100).toFixed(0) + '%' : 'No record'",
    icon: ChartSpline
  },
  {
    label: "W2",
    value:
      "student.a_lms_activity ? (student.a_lms_activity.cp_w2 * 100).toFixed(0) + '%' : 'No record'",
    icon: ChartSpline
  },
  {
    label: "W3",
    value:
      "student.a_lms_activity ? (student.a_lms_activity.cp_w3 * 100).toFixed(0) + '%' : 'No record'",
    icon: ChartSpline
  }
];

export default function StudentLMSActivity({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  student
}: {
  student: StudentDashboardRow;
}) {
  return (
    <div className="space-y-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2 item-start">
        <p className="font-semibold">CN Activity</p>

        {lmsactivityTabs.map((tab) => (
          <div
            key={tab.value}
            className="flex flex-row items-start justify-start gap-3"
          >
            <tab.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{tab.label}</p>
            <p className="font-medium text-xs break-all text-left line-clamp-1">
              {eval(tab.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
