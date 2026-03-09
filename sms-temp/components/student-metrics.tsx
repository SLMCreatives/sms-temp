import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/lib/types/database";
import {
  Users,
  Phone,
  LogOut,
  LucideGhost,
  ThumbsUp,
  ThumbsDown,
  ClockAlert,
  Loader
} from "lucide-react";

interface StudentMetricsProps {
  data: Student[];
}

export function StudentMetrics({ data }: StudentMetricsProps) {
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
    (student) => student.a_engagements?.at(-1)?.sentiment === "Positive"
  );

  const negative = db_students.filter(
    (student) => student.a_engagements?.at(-1)?.sentiment === "Negative"
  );

  const lost_students = db_students.filter(
    (student) => student.status === "Withdraw"
  );

  const deferred = db_students.filter(
    (student) => student.status === "Deferred"
  );

  const not_logged_in = active_students.filter(
    (student) =>
      student.a_lms_activity && student.a_lms_activity.last_login_at === null
  );

  const low_progress = db_students.filter(
    (student) =>
      student.a_lms_activity &&
      student.a_lms_activity.cp_w3 <= 0.2 &&
      !not_logged_in.includes(student)
  );

  const stats = [
    {
      title: "Active",
      value: active_students.length,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "SST Engaged",
      value: engaged_students.length,
      icon: Phone,
      color: "text-primary"
    },
    {
      title: "Not Logged In",
      value: not_logged_in.length,
      icon: LogOut,
      color: "text-destructive"
    },
    {
      title: "Low CP",
      value: low_progress.length,
      icon: Loader,
      color: "text-destructive"
    },
    {
      title: "Deferred",
      value: deferred.length,
      icon: ClockAlert,
      color: "text-amber-600"
    },
    {
      title: "Withdrawn",
      value: lost_students.length,
      icon: LucideGhost,
      color: "text-destructive"
    },
    {
      title: "Positive",
      value: positive.length,
      icon: ThumbsUp,
      color: "text-green-500"
    },
    {
      title: "Negative",
      value: negative.length,
      icon: ThumbsDown,
      color: "text-destructive"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.title}>
          <Card className="bg-card border-border flex flex-col items-start justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2 w-full">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-md font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </div>
              <stat.icon className={`w-4 h-4 ${stat.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent className="flex flex-row items-end justify-between w-full">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs italic text-muted-foreground">
                {((stat.value / active_students.length) * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>
      ))}
      {/* <Card className="bg-card border-border flex flex-col items-start justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Total Active Students
            </CardTitle>
            <CardDescription className="text-xs italic ">
              Enrolled on CN
            </CardDescription>
          </div>
          <Users className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent className="flex flex-row lg:flex-col-reverse justify-between">
          <div className="flex flex-row justify-between items-end gap-2">
            <p className="text-3xl font-bold text-foreground">
              {active_students.length}{" "}
            </p>
            <span className="font-normal italic text-xl text-muted-foreground">
              {Math.round((active_students.length / db_students.length) * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border flex flex-col items-start justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Not Logged In
            </CardTitle>
            <CardDescription className="text-xs italic ">
              As of 3rd Feb 2026
            </CardDescription>
          </div>
          <UserX className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent className="flex flex-row lg:flex-col-reverse justify-between">
          <div className="text-3xl font-bold text-foreground justify-between">
            {not_logged_in.length}
            <span className="italic font-normal">
              {"  "}
              {Math.round(
                (not_logged_in.length / active_students.length) * 100
              )}
              %
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border flex flex-col items-start justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Zero Course Progress
            </CardTitle>
            <CardDescription className="text-xs italic ">
              Excluding Not Logged In
            </CardDescription>
          </div>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent className="flex flex-row lg:flex-col-reverse justify-between">
          <div className="text-3xl font-bold text-foreground">
            {zero_progress.length.toLocaleString()}
            <span className="italic font-normal">
              {"  "}
              {Math.round(
                (zero_progress.length / active_students.length) * 100
              )}
              %
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border flex flex-col items-start justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Less than 20% Course Progress
            </CardTitle>
            <CardDescription className="text-xs italic ">
              Excluding Zero Progress
            </CardDescription>
          </div>

          <AlertCircle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent className="flex flex-row lg:flex-col-reverse  justify-between">
          <div className="text-3xl font-bold text-foreground">
            {low_progress.length.toLocaleString()}
            <span className="italic font-normal">
              {"  "}
              {Math.round((low_progress.length / active_students.length) * 100)}
              %
            </span>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
