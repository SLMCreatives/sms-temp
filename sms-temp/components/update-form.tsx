"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";

interface UpdateFormProps {
  onSuccess: () => void;
}

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

export function UpdateForm({ onSuccess }: UpdateFormProps) {
  const [searchMatricNo, setSearchMatricNo] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityRecord | null>(null);
  const [formData, setFormData] = useState({
    student_name: "",
    activity_type: "",
    activity_title: "",
    description: "",
    completion_date: "",
    score: "",
    status: ""
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const searchActivities = async () => {
    if (!searchMatricNo.trim()) {
      toast("Please enter a matric number to search for activities.");
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("lms_activity")
        .select("*")
        .eq("matric_no", searchMatricNo.trim())
        .order("created_at", { ascending: false });

      if (error) throw error;

      setActivities(data || []);

      if (!data || data.length === 0) {
        toast(`No activity records found for matric number: ${searchMatricNo}`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast("Failed to search for activities. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectActivity = (activity: ActivityRecord) => {
    setSelectedActivity(activity);
    setFormData({
      student_name: activity.student_name || "",
      activity_type: activity.activity_type || "",
      activity_title: activity.activity_title || "",
      description: activity.description || "",
      completion_date: activity.completion_date
        ? activity.completion_date.split("T")[0]
        : "",
      score: activity.score ? activity.score.toString() : "",
      status: activity.status || ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("lms_activity")
        .update({
          student_name: formData.student_name,
          activity_type: formData.activity_type,
          activity_title: formData.activity_title,
          description: formData.description,
          completion_date: formData.completion_date || null,
          score: formData.score ? Number.parseFloat(formData.score) : null,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedActivity.id);

      if (error) throw error;

      toast("Activity record updated successfully!");

      // Refresh the search results
      await searchActivities();
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      toast("Failed to update activity record. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search by Matric Number</CardTitle>
          <CardDescription>
            Enter the student matric number to find their activity records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={searchMatricNo}
              onChange={(e) => setSearchMatricNo(e.target.value)}
              placeholder="Enter matric number (e.g., 2021001234)"
              onKeyPress={(e) => e.key === "Enter" && searchActivities()}
            />
            <Button onClick={searchActivities} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Records Found</CardTitle>
            <CardDescription>
              Select an activity record to update
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedActivity?.id === activity.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => selectActivity(activity)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{activity.activity_title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.activity_type} • Status: {activity.status}
                      </p>
                      {activity.score && (
                        <p className="text-sm text-muted-foreground">
                          Score: {activity.score}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Form */}
      {selectedActivity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Activity Record</CardTitle>
            <CardDescription>
              Modify the selected activity record for{" "}
              {selectedActivity.student_name} ({selectedActivity.matric_no})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="update_student_name">Student Name</Label>
                  <Input
                    id="update_student_name"
                    value={formData.student_name}
                    onChange={(e) =>
                      handleInputChange("student_name", e.target.value)
                    }
                    placeholder="Enter student name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update_activity_type">Activity Type</Label>
                  <Select
                    value={formData.activity_type}
                    onValueChange={(value) =>
                      handleInputChange("activity_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="lab">Lab Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update_activity_title">Activity Title</Label>
                <Input
                  id="update_activity_title"
                  value={formData.activity_title}
                  onChange={(e) =>
                    handleInputChange("activity_title", e.target.value)
                  }
                  placeholder="Enter activity title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="update_description">Description</Label>
                <Textarea
                  id="update_description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter activity description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="update_completion_date">
                    Completion Date
                  </Label>
                  <Input
                    id="update_completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) =>
                      handleInputChange("completion_date", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update_score">Score</Label>
                  <Input
                    id="update_score"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.score}
                    onChange={(e) => handleInputChange("score", e.target.value)}
                    placeholder="Enter score (0-100)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update_status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? "Updating..." : "Update Activity"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
