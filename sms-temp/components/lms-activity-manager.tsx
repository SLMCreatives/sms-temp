"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { UploadForm } from "./upload-form";
import { UpdateForm } from "./update-form";
import { ActivityList } from "@/components/activity-list";

export function LMSActivityManager() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="update">Update Activity</TabsTrigger>
          <TabsTrigger value="view">View Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Upload a CSV file to automatically insert new records or update
                existing ones based on matric number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadForm onSuccess={handleDataChange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="update" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Existing Activity</CardTitle>
              <CardDescription>
                Search and update student activity records by matric number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateForm onSuccess={handleDataChange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Records</CardTitle>
              <CardDescription>
                View all student activity records in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityList key={refreshKey} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
