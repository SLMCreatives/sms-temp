import { Students } from "@/app/student/studentColumns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Users, UserX, AlertCircle } from "lucide-react";

interface StudentMetricsProps {
  data: Students[];
}

export function StudentMetrics({ data }: StudentMetricsProps) {
  const db_students = data as Students[];
  const active_students = db_students.filter(
    (student) => student.status === "Active" || student.status === "At Risk"
  );

  const w1_active_students = db_students.filter(
    (student) => student.status === "Active" && student.lms_activity_w1
  );

  const w2_active_students = db_students.filter(
    (student) => student.status === "Active" && student.lms_activity_w2
  );

  const w3_active_students = db_students.filter(
    (student) => student.status === "Active" && student.lms_activity_w3
  );

  const not_logged_in = active_students.filter(
    (student) =>
      student.lms_activity && student.lms_activity.last_login_at === null
  );

  const w1_notlogged_in = active_students.filter(
    (student) =>
      student.lms_activity_w1 && student.lms_activity_w1.last_login_at === null
  );

  const w2_notlogged_in = active_students.filter(
    (student) =>
      student.lms_activity_w2 && student.lms_activity_w2.last_login_at === null
  );

  const w3_notlogged_in = db_students.filter(
    (student) =>
      student.lms_activity_w3 && student.lms_activity_w3.last_login_at === null
  );
  const zero_progress = active_students.filter(
    (student) =>
      student.lms_activity &&
      student.lms_activity.course_progress === 0 &&
      !not_logged_in.includes(student)
  );

  const w1_zero_progress = active_students.filter(
    (student) =>
      student.lms_activity_w1 &&
      student.lms_activity_w1.course_progress === 0 &&
      !w1_notlogged_in.includes(student)
  );

  const w2_zero_progress = active_students.filter(
    (student) =>
      student.lms_activity_w2 &&
      student.lms_activity_w2.course_progress === 0 &&
      !w2_notlogged_in.includes(student)
  );

  const w3_zero_progress = active_students.filter(
    (student) =>
      student.lms_activity_w3 &&
      student.lms_activity_w3.course_progress === 0 &&
      !w3_notlogged_in.includes(student)
  );

  const low_progress = active_students.filter(
    (student) =>
      student.lms_activity &&
      student.lms_activity.course_progress <= 0.2 &&
      !zero_progress.includes(student) &&
      !not_logged_in.includes(student)
  );

  const w1_low_progress = active_students.filter(
    (student) =>
      student.lms_activity_w1 &&
      student.lms_activity_w1.course_progress <= 0.2 &&
      !w1_zero_progress.includes(student) &&
      !w1_notlogged_in.includes(student)
  );

  const w2_low_progress = active_students.filter(
    (student) =>
      student.lms_activity_w2 &&
      student.lms_activity_w2.course_progress <= 0.2 &&
      !w2_zero_progress.includes(student) &&
      !w2_notlogged_in.includes(student)
  );

  const w3_low_progress = active_students.filter(
    (student) =>
      student.lms_activity_w3 &&
      student.lms_activity_w3.course_progress <= 0.2 &&
      !w3_zero_progress.includes(student) &&
      !w3_notlogged_in.includes(student)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card className="bg-card border-border">
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
              {active_students.length.toLocaleString()}{" "}
            </p>
            <span className="font-normal italic text-xl text-muted-foreground">
              {Math.round((active_students.length / db_students.length) * 100)}%
            </span>
          </div>
          <div className="flex flex-col gap-0 items-end lg:items-start text-sm">
            <p className="text-xs italic text-muted-foreground">
              W1 - {w1_active_students.length} (
              {Math.round(
                (w1_active_students.length / db_students.length) * 100
              )}
              % )
            </p>
            <p className="text-xs italic text-muted-foreground">
              W2 - {w2_active_students.length} (
              {Math.round(
                (w2_active_students.length / db_students.length) * 100
              )}
              % )
            </p>
            <p className="text-xs italic text-muted-foreground">
              W3 - {w3_active_students.length} (
              {Math.round(
                (w3_active_students.length / db_students.length) * 100
              )}
              % )
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Not Logged In
            </CardTitle>
            <CardDescription className="text-xs italic ">
              As of 6th Oct 2025
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
          <div className="flex flex-col gap-0 items-end lg:items-start text-sm">
            <p className="text-xs italic text-muted-foreground">
              W1 - {w1_notlogged_in.length} (
              {Math.round(
                (w1_notlogged_in.length / w1_active_students.length) * 100
              )}
              %)
            </p>
            <p className="text-xs italic text-muted-foreground">
              W2 - {w2_notlogged_in.length} (
              {Math.round(
                (w2_notlogged_in.length / w2_active_students.length) * 100
              )}
              %)
            </p>
            <p className="text-xs italic text-muted-foreground">
              W3 - {w3_notlogged_in.length} (
              {Math.round(
                (w3_notlogged_in.length / w3_active_students.length) * 100
              )}
              %)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
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
          <div className="flex flex-col gap-0 items-end lg:items-start text-sm">
            <p className="text-xs italic text-muted-foreground">
              W1 - {w1_zero_progress.length} (
              {Math.round(
                (w1_zero_progress.length / w1_active_students.length) * 100
              )}
              %)
            </p>
            <p className="text-xs italic text-muted-foreground">
              W2 - {w2_zero_progress.length} (
              {Math.round(
                (w2_zero_progress.length / w2_active_students.length) * 100
              )}
              %)
            </p>
            <p className="text-xs italic text-muted-foreground">
              W3 - {w3_zero_progress.length} (
              {Math.round(
                (w3_zero_progress.length / w3_active_students.length) * 100
              )}
              %)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
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
          <div className="flex flex-col gap-0 items-end lg:items-start text-sm">
            <p className="text-xs italic text-muted-foreground">
              W1 - {w1_low_progress.length} (
              {Math.round(
                (w1_low_progress.length / w1_active_students.length) * 100
              )}
              %)
            </p>
            <p className="text-xs italic text-muted-foreground">
              W2 - {w2_low_progress.length} (
              {Math.round(
                (w2_low_progress.length / w2_active_students.length) * 100
              )}
              %)
            </p>
            <p className="text-xs italic text-muted-foreground">
              W3 - {w3_low_progress.length} (
              {Math.round(
                (w3_low_progress.length / w3_active_students.length) * 100
              )}
              %)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
