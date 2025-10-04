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
    (student) => student.status === "Active"
  );

  const not_logged_in = active_students.filter(
    (student) =>
      student.lms_activity && student.lms_activity.last_login_at === null
  );

  const zero_progress = db_students.filter(
    (student) =>
      student.lms_activity &&
      student.lms_activity.course_progress === 0 &&
      !not_logged_in.includes(student)
  );

  const low_progress = db_students.filter(
    (student) =>
      student.lms_activity &&
      student.lms_activity.course_progress <= 0.2 &&
      !zero_progress.includes(student) &&
      !not_logged_in.includes(student)
  );

  const engaged = db_students.filter((student) =>
    student.engagements.some(
      (engagement) => engagement && engagement.created_at > "2025-09-22"
    )
  );

  const not_loggedin_engaged = not_logged_in.filter((student) =>
    student.engagements.some(
      (engagement) => engagement && engagement.created_at > "2025-09-22"
    )
  );

  const zero_engaged = zero_progress.filter((student) =>
    student.engagements.some(
      (engagement) => engagement && engagement.created_at > "2025-09-22"
    )
  );

  const low_engaged = low_progress.filter((student) =>
    student.engagements.some(
      (engagement) => engagement && engagement.created_at > "2025-09-22"
    )
  );

  const no_response = db_students.filter((student) =>
    student.engagements.some(
      (engagement) =>
        engagement &&
        engagement.created_at > "2025-09-22" &&
        engagement.outcome === "no_response"
    )
  );

  const not_noresponse = not_logged_in.filter((student) =>
    student.engagements.some(
      (engagement) =>
        engagement &&
        engagement.created_at > "2025-09-22" &&
        engagement.outcome === "no_response"
    )
  );

  const zero_noresponse = zero_progress.filter((student) =>
    student.engagements.some(
      (engagement) =>
        engagement &&
        engagement.created_at > "2025-09-22" &&
        engagement.outcome === "no_response"
    )
  );

  const low_noresponse = low_progress.filter((student) =>
    student.engagements.some(
      (engagement) =>
        engagement &&
        engagement.created_at > "2025-09-22" &&
        engagement.outcome === "no_response"
    )
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium text-muted-foreground">
            Total Students
          </CardTitle>
          <Users className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent className="flex flex-row justify-between">
          <div className="text-3xl font-bold text-foreground">
            {active_students.length.toLocaleString()}
          </div>
          <div className="flex flex-col gap-0 items-end text-sm">
            <div className="flex items-end italic">
              {Math.round((engaged.length / db_students.length) * 100) + "%"}{" "}
              Engaged ({engaged.length})
            </div>
            <div className="flex items-end italic text-red-500">
              {Math.round((no_response.length / db_students.length) * 100) +
                "%"}{" "}
              No Response ({no_response.length})
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium text-muted-foreground">
            Not Logged In
          </CardTitle>
          <UserX className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent className="flex flex-row justify-between">
          <div className="text-3xl font-bold text-foreground">
            {not_logged_in.length}
            <span className="italic font-normal">
              {"  "}
              {Math.round(
                (not_logged_in.length / active_students.length) * 100
              )}
              %
            </span>
          </div>
          <div className="flex flex-col gap-0 items-end text-sm">
            <div className="flex items-end italic">
              {Math.round(
                (not_loggedin_engaged.length / not_logged_in.length) * 100
              ) + "%"}
              Engaged ({not_loggedin_engaged.length})
            </div>
            <div className="flex items-end italic text-red-500">
              {Math.round(
                (not_noresponse.length / not_logged_in.length) * 100
              ) + "%"}{" "}
              No Response ({not_noresponse.length})
            </div>
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
        <CardContent className="flex flex-row justify-between">
          <div className="text-3xl font-bold text-foreground">
            {zero_progress.length.toLocaleString()}
            <span className="italic font-normal">
              {"  "}
              {Math.round(
                (zero_progress.length / active_students.length) * 100
              )}{" "}
              %
            </span>
          </div>
          <div className="flex flex-col gap-0 items-end text-sm">
            <div className="flex items-end italic">
              {Math.round((zero_engaged.length / zero_progress.length) * 100) +
                "%"}{" "}
              Engaged ({zero_engaged.length})
            </div>
            <div className="flex items-end italic text-red-500">
              {Math.round(
                (zero_noresponse.length / zero_progress.length) * 100
              ) + "%"}{" "}
              No Response ({zero_noresponse.length})
            </div>
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
        <CardContent className="flex flex-row justify-between">
          <div className="text-3xl font-bold text-foreground">
            {low_progress.length.toLocaleString()}
            <span className="italic font-normal">
              {"  "}
              {Math.round((low_progress.length / active_students.length) * 100)}
              %
            </span>
          </div>
          <div className="flex flex-col gap-0 items-end text-sm">
            <div className="flex items-end italic">
              {Math.round((low_engaged.length / low_progress.length) * 100) +
                "%"}{" "}
              Engaged ({low_engaged.length})
            </div>
            <div className="flex items-end italic text-red-500">
              {Math.round((low_noresponse.length / low_progress.length) * 100) +
                "%"}{" "}
              No Response ({low_noresponse.length})
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
