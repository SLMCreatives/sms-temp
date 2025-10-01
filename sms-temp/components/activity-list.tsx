"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
/* import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"; */
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Engagements } from "@/app/student/studentColumns";

/* interface ActivityRecord {
  matric_no: string;
  last_login_at: string;
  course_progress: number;
  submitted_assignments: number;
  srb_progress: number;
  course_visits: number;
  created_at: string;
  updated_at: string;
  students: Students[];
}
 */
export function ActivityList() {
  const [activities, setActivities] = useState<Engagements[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Engagements[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  /*  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); */

  const supabase = createClient();

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("engagements")
        .select("*, students(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setActivities(data || []);
      setFilteredActivities(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast("Failed to fetch activity records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    let filtered = activities;

    // Filter by search term (matric_no, student_name, or activity_title)
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.matric_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.outcome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.handled_by
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          activity.sentiment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    /*  // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.course_progress === statusFilter
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.activity_type === typeFilter
      );
    } */

    setFilteredActivities(filtered);
  }, [activities, searchTerm]);

  /*   const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  }; */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by matric number, name, or activity title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />

        {/*  <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
            <SelectItem value="quiz">Quiz</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="discussion">Discussion</SelectItem>
            <SelectItem value="lab">Lab Work</SelectItem>
          </SelectContent>
        </Select> */}

        <Button onClick={fetchActivities} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredActivities.length} of {activities.length} activities
      </div>

      {/* Activities list */}
      {filteredActivities.length >= 0 && (
        <div className="space-y-3">
          {filteredActivities.map((activity, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div>
                        <h3 className="font-medium text-foreground">
                          CN Course Progress
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.matric_no}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Engagement Details</span>
                      {activity.subject && <span>{activity.body}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/*  <Badge className={getStatusColor(activity.status)}>
                      {activity.status.replace("_", " ")}
                    </Badge> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
