"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";

interface ActivityRecord {
  id: number;
  matric_no: string;
  student_name: string;
  activity_type: string;
  activity_title: string;
  description: string;
  completion_date: string;
  score: number;
  status: string;
  created_at: string;
}

export function ActivityList() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<
    ActivityRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("lms_activity")
        .select("*")
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
          activity.student_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          activity.activity_title
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.status === statusFilter
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.activity_type === typeFilter
      );
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
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
  };

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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        </Select>

        <Button onClick={fetchActivities} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredActivities.length} of {activities.length} activities
      </div>

      {/* Activities list */}
      {filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {activities.length === 0
                ? "No activity records found. Upload some activities to get started."
                : "No activities match your current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {activity.activity_title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.student_name} • {activity.matric_no}
                        </p>
                      </div>
                    </div>

                    {activity.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {activity.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Type: {activity.activity_type}</span>
                      {activity.completion_date && (
                        <span>
                          • Due:{" "}
                          {new Date(
                            activity.completion_date
                          ).toLocaleDateString()}
                        </span>
                      )}
                      {activity.score !== null && (
                        <span>• Score: {activity.score}</span>
                      )}
                      <span>
                        • Created:{" "}
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status.replace("_", " ")}
                    </Badge>
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
