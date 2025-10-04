import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";

interface StudentStatusTableProps {
  faculty: string;
}

export function StudentStatusTable({ faculty }: StudentStatusTableProps) {
  // Mock data - would come from API in production
  const students = [
    {
      id: "S2024001",
      name: "Sarah Johnson",
      faculty: "FOB",
      lastLogin: "2 days ago",
      courseProgress: 0,
      status: "at-risk",
      engagement: "Poor"
    },
    {
      id: "S2024002",
      name: "Michael Chen",
      faculty: "SIT",
      lastLogin: "5 days ago",
      courseProgress: 15,
      status: "warning",
      engagement: "Fair"
    },
    {
      id: "S2024003",
      name: "Emily Rodriguez",
      faculty: "FEH",
      lastLogin: "1 day ago",
      courseProgress: 8,
      status: "warning",
      engagement: "Fair"
    },
    {
      id: "S2024004",
      name: "David Kim",
      faculty: "FOB",
      lastLogin: "7 days ago",
      courseProgress: 0,
      status: "at-risk",
      engagement: "Poor"
    },
    {
      id: "S2024005",
      name: "Jessica Taylor",
      faculty: "SIT",
      lastLogin: "3 days ago",
      courseProgress: 22,
      status: "warning",
      engagement: "Fair"
    },
    {
      id: "S2024006",
      name: "James Wilson",
      faculty: "FEH",
      lastLogin: "6 days ago",
      courseProgress: 5,
      status: "at-risk",
      engagement: "Poor"
    }
  ];

  const filteredStudents =
    faculty === "all"
      ? students
      : students.filter((s) => s.faculty === faculty);

  return (
    <Card className="bg-card border-border max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-foreground">At-Risk Students</CardTitle>
        <CardDescription className="text-muted-foreground">
          Students requiring immediate attention and intervention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Student ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Faculty
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Last Login
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Progress
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Engagement
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-mono text-foreground">
                    {student.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {student.name}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Badge
                      variant="outline"
                      className="bg-secondary text-secondary-foreground border-border"
                    >
                      {student.faculty}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {student.lastLogin}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            student.courseProgress === 0
                              ? "bg-destructive"
                              : student.courseProgress < 25
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${student.courseProgress}%` }}
                        />
                      </div>
                      <span className="text-foreground">
                        {student.courseProgress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {student.engagement}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {student.status === "at-risk" ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        At Risk
                      </Badge>
                    ) : (
                      <Badge className="gap-1 bg-warning text-warning-foreground">
                        <Clock className="w-3 h-3" />
                        Warning
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
