"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataExport from "@/components/new/data-export";
import AddStudents from "@/components/new/add-students";
import AssignSST from "@/components/new/assign-sst";

const supabase = createClient();

const WEEKS = [1, 2, 3, 4];

const TABS = [
  {
    value: "export",
    label: "Data Export",
    blurb: "Pull student and engagement data out as a spreadsheet."
  },
  {
    value: "add",
    label: "Add Students",
    blurb: "Add one student, or import a cohort from a spreadsheet."
  },
  {
    value: "sst",
    label: "SST Management",
    blurb: "Distribute caseloads across the team and generate weekly tasks."
  }
];

export default function AdminPage() {
  const [tab, setTab] = useState("export");
  const [week, setWeek] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const handleGenerateTasks = async () => {
    if (!week) return;

    setGenerating(true);
    const { error } = await supabase.rpc("jan26_generate_weekly_tasks", {
      target_week: Number(week)
    });
    setGenerating(false);

    if (error) toast.error(`Could not generate tasks: ${error.message}`);
    else toast.success(`Generated tasks for week ${week}.`);
  };

  const active = TABS.find((t) => t.value === tab);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-0">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {active?.blurb}
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-5 max-w-full self-start">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="px-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="sst" className="flex flex-col gap-5">
          <AssignSST />

          <Card className="md:max-w-md">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Generate weekly tasks</CardTitle>
              <CardDescription>
                Creates the follow-up task list for every SST member for the
                chosen week.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="week" className="text-xs">
                  Week
                </Label>
                <Select value={week} onValueChange={setWeek}>
                  <SelectTrigger id="week" className="h-9 w-40 text-sm">
                    <SelectValue placeholder="Select a week" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} align="start">
                    {WEEKS.map((w) => (
                      <SelectItem key={w} value={String(w)}>
                        Week {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateTasks} disabled={!week || generating}>
                {generating ? "Generating…" : "Generate tasks"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <DataExport />
        </TabsContent>

        <TabsContent value="add">
          <AddStudents />
        </TabsContent>
      </Tabs>
    </div>
  );
}
