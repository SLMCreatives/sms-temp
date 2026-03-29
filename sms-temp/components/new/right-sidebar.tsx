import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Student } from "@/lib/types/database";
import { Users, Phone, LogOut, LucideGhost, ThumbsUp } from "lucide-react";
import { Progress } from "../ui/progress";

interface StudentMetricsProps {
  data: Student[];
}

export function StudentVerticalStats({ data }: StudentMetricsProps) {
  const db_students = data as Student[];
  const active_students = db_students.filter(
    (student) => student.status === "Active" || student.status === "At-Risk"
  );

  const engaged_students = db_students.filter((student) =>
    student.a_engagements?.some(
      (engagement) => engagement && engagement.outcome !== "no_response"
    )
  );

  const positive = db_students.filter(
    (student) =>
      engaged_students.includes(student) &&
      student.a_engagements?.at(-1)?.sentiment === "Positive"
  );

  /* const negative = db_students.filter(
    (student) => student.a_engagements?.at(-1)?.sentiment === "Negative"
  ); */

  const lost_students = db_students.filter(
    (student) => student.status === "Withdraw"
  );

  /*  const deferred = db_students.filter(
    (student) => student.status === "Deferred"
  ); */

  const not_logged_in = active_students.filter(
    (student) =>
      student.a_lms_activity && student.a_lms_activity.last_login_at === null
  );

  /*  const low_progress = db_students.filter(
    (student) =>
      student.a_lms_activity &&
      student.a_lms_activity.cp_w3 <= 0.2 &&
      !not_logged_in.includes(student)
  );
 */
  /* const self_payment = db_students.filter(
    (student) => student.a_payments?.payment_mode === "SELF"
  );

  const payment_others = db_students.filter(
    (student) =>
      student.a_payments?.payment_mode !== "SELF" &&
      student.a_payments?.payment_mode !== "PTPTN"
  );

  const ptptn = db_students.filter(
    (student) => student.a_payments?.payment_mode === "PTPTN"
  );

  const ptptn_submittedproof = db_students.filter(
    (student) =>
      student.a_payments?.payment_mode === "PTPTN" &&
      student.a_payments?.ptptn_proof_status === true
  ); */

  const stats = [
    {
      title: "Active",
      value: active_students.length,
      icon: Users,
      color: "text-green-500"
    },
    {
      title: "Engaged",
      value: engaged_students.length,
      icon: Phone,
      color: "text-primary"
    },
    {
      title: "Positive",
      value: positive.length,
      icon: ThumbsUp,
      color: "text-green-500"
    },
    {
      title: "0 Login",
      value: not_logged_in.length,
      icon: LogOut,
      color: "text-red-500"
    },
    {
      title: "Withdrawn",
      value: lost_students.length,
      icon: LucideGhost,
      color: "text-red-500"
    }
    /* {
      title: "Self Payment",
      value: self_payment.length,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Payment Others",
      value: payment_others.length,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "PTPTN",
      value: ptptn.length,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Submitted Proof",
      value: ptptn_submittedproof.length,
      icon: Users,
      color: "text-primary"
    } */
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-1">
      {stats.map((stat) => (
        <div key={stat.title}>
          <Card className="bg-card border-stone-400/50 border flex flex-col items-start justify-between">
            <CardHeader className="flex flex-row items-center justify-between lg:pb-2 w-full">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xs font-bold text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent className="flex flex-row items-end justify-between w-full">
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs italic text-muted-foreground">
                {stat.title === "Positive" || stat.title === "Negative"
                  ? ((stat.value / engaged_students.length) * 100).toFixed(1)
                  : ((stat.value / db_students.length) * 100).toFixed(1)}
                %
              </p>
            </CardContent>
            <CardFooter className="flex flex-row items-center justify-between w-full">
              <Progress value={(stat.value / db_students.length) * 100} />
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
}
