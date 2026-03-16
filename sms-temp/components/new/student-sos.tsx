import {
  CalendarCheck,
  ChartSpline,
  HeartPlus,
  LaptopMinimalCheck,
  MessageSquareQuote,
  MonitorPlay,
  Swords,
  UserCheck
} from "lucide-react";
import { StudentDashboardRow } from "@/lib/types/database";

const SOSTabs = [
  {
    label: "Date Submitted",
    value: "student.a_sos[0]?.date_submitted || 'No record'",
    icon: CalendarCheck
  },
  {
    label: "Q1: Platform Confidence",
    value: "student.a_sos[0]?.q1 || 'No record'",
    icon: LaptopMinimalCheck
  },
  {
    label: "Q2: Lecturer Guidance",
    value: "student.a_sos[0]?.q2 || 'No record'",
    icon: UserCheck
  },
  {
    label: "Q3: Feel Supported",
    value: "student.a_sos[0]?.q3 || 'No record'",
    icon: HeartPlus
  },
  {
    label: "Q4: Class Recordings",
    value: "student.a_sos[0]?.q4 || 'No record'",
    icon: MonitorPlay
  },
  {
    label: "Q5: Feedback",
    value: "student.a_sos[0]?.q5 || 'No record'",
    icon: Swords
  },
  {
    label: "NPS",
    value: "student.a_sos[0]?.nps || 'No record'",
    icon: ChartSpline
  },
  {
    label: "Feedback",
    value: "student.a_sos[0]?.feedback || 'No record'",
    icon: MessageSquareQuote
  }
];

export default function StudentSOS({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  student
}: {
  student: StudentDashboardRow;
}) {
  return (
    <div className="space-y-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2 item-start">
        <p className="font-semibold">SOS Feedback</p>
        {!student.a_sos && (
          <p className="text-sm text-muted-foreground">No SOS found</p>
        )}

        {student.a_sos ? (
          SOSTabs.map((tab) => (
            <div
              key={tab.value}
              className="flex flex-col items-start justify-start gap-1"
            >
              <div className="flex flex-row items-start justify-center gap-2">
                <tab.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{tab.label}</p>
              </div>
              <p className="text-xs text-left pb-2 tracking-wide text-balance">
                {eval(tab.value)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No SOS found</p>
        )}
      </div>
    </div>
  );
}
