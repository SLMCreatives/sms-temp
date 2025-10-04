import { Students } from "@/app/student/studentColumns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Users, UserX, AlertCircle } from "lucide-react";

interface StudentMetricsProps {
  faculty: string;
  timeRange: string;
}

const supabase = createClient();

export async function StudentMetrics({ faculty }: StudentMetricsProps) {
  const { data, error } = await supabase
    .from("students")
    .select("*, lms_activity(*), engagements(*)")
    .eq("faculty_code", "*");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  const db_students = data as Students[];

  const filtered_faculty = faculty;

  console.log(filtered_faculty);

  const active_students = db_students.filter(
    (student) => student.status === "Active"
  );

  const not_logged_in = db_students.filter(
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Students
          </CardTitle>
          <Users className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {active_students.length.toLocaleString()}
          </div>
          {/* <div className="flex items-center text-xs mt-2">
            {data.activeTrend > 0 ? (
              <TrendingUp className="h-3 w-3 text-success mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive mr-1" />
            )}
            <span
              className={
                data.activeTrend > 0 ? "text-success" : "text-destructive"
              }
            >
              {Math.abs(data.activeTrend)}%
            </span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div> */}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Not Logged In
          </CardTitle>
          <UserX className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {not_logged_in.length.toLocaleString()}
          </div>
          <div className="flex items-center text-xs mt-2">
            {/* {data.notLoggedInTrend < 0 ? (
              <TrendingDown className="h-3 w-3 text-success mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 text-destructive mr-1" />
            )} */}
            <span>
              {Math.round(
                (not_logged_in.length / active_students.length) * 100
              )}
              %
            </span>
            <span className="text-muted-foreground ml-1">
              of active students
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Zero Course Progress
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {zero_progress.length.toLocaleString()}
          </div>
          <div className="flex items-center text-xs mt-2">
            {/* {data.notLoggedInTrend < 0 ? (
              <TrendingDown className="h-3 w-3 text-success mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 text-destructive mr-1" />
            )} */}
            <span>
              {Math.round(
                (zero_progress.length / active_students.length) * 100
              )}
              %
            </span>
            <span className="text-muted-foreground ml-1">
              of active students - not logged in
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Low Course Progress
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {low_progress.length.toLocaleString()}
          </div>
          <div className="flex items-center text-xs mt-2">
            {/* {data.notLoggedInTrend < 0 ? (
              <TrendingDown className="h-3 w-3 text-success mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 text-destructive mr-1" />
            )} */}
            <span>
              {Math.round((low_progress.length / active_students.length) * 100)}
              %
            </span>
            <span className="text-muted-foreground ml-1">
              of active students - not logged in - zero progress
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
