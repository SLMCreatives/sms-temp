"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import type { CNEnrollment } from "@/lib/cn-api-client";

export function EnrollmentsList() {
  const [enrollments, setEnrollments] = useState<CNEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");

  const fetchEnrollments = async () => {
    if (!userId) {
      alert("User ID is required");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (courseId) params.append("course_id", courseId);

      const response = await fetch(`/api/cn/enrollments?${params.toString()}`);
      const data = await response.json();

      if (data.data) {
        setEnrollments(data.data);
      } else if (data.errs) {
        alert(`Error: ${JSON.stringify(data.errs)}`);
      }
    } catch (error) {
      console.error("[v0] Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Enrollments</CardTitle>
        <CardDescription>
          View user course enrollments from CN API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="user_id">User ID *</Label>
            <Input
              id="user_id"
              placeholder="Enter user ID..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course_id">Course ID (Optional)</Label>
            <Input
              id="course_id"
              placeholder="Filter by course ID..."
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            />
          </div>
          <Button
            onClick={fetchEnrollments}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Enrollments
              </>
            )}
          </Button>
        </div>

        {enrollments.length > 0 && (
          <div className="space-y-3">
            {enrollments.map((enrollment, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold">User ID:</span>{" "}
                      {enrollment.user_id}
                    </p>
                    <p>
                      <span className="font-semibold">Course ID:</span>{" "}
                      {enrollment.course_id}
                    </p>
                    <p>
                      <span className="font-semibold">Role:</span>{" "}
                      {enrollment.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {enrollments.length === 0 && !loading && userId && (
          <p className="text-center text-muted-foreground py-8">
            No enrollments found for this user.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
