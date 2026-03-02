"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const supabase = createClient();

export default function SSTManagement() {
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleInitialAssignment = async () => {
    if (
      !confirm(
        "This will distribute all the unassigned students to active SST members. Proceed?"
      )
    )
      return;

    setLoading(true);
    const { error } = await supabase.rpc("a_students_auto_assign_sst");

    if (error) {
      setMessage({ text: `Error: ${error.message}`, type: "error" });
    } else {
      setMessage({
        text: "Successfully assigned students to SST members.",
        type: "success"
      });
    }
    setLoading(false);
  };
  /*  const handleInitialAssignmentNov25 = async () => {
    if (
      !confirm(
        "This will distribute all the unassigned students to active SST members. Proceed?"
      )
    )
      return;

    setLoading(true);
    const { error } = await supabase.rpc("nov25_auto_assign_sst");

    if (error) {
      setMessage({ text: `Error: ${error.message}`, type: "error" });
    } else {
      setMessage({
        text: "Successfully assigned students to SST members.",
        type: "success"
      });
    }
    setLoading(false);
  };

  const handleInitialAssignmentC = async () => {
    if (
      !confirm(
        "This will distribute all the unassigned students to active SST members. Proceed?"
      )
    )
      return;

    setLoading(true);
    const { error } = await supabase.rpc("jan26_c_auto_assign_sst");

    if (error) {
      setMessage({ text: `Error: ${error.message}`, type: "error" });
    } else {
      setMessage({
        text: "Successfully assigned students to SST members.",
        type: "success"
      });
    }
    setLoading(false);
  }; */

  const handleGenerateTasks = async () => {
    setLoading(true);
    const { error } = await supabase.rpc("jan26_generate_weekly_tasks", {
      target_week: week
    });

    if (error) {
      setMessage({ text: `Error: ${error.message}`, type: "error" });
    } else {
      setMessage({
        text: `Successfully generated tasks for week ${week}.`,
        type: "success"
      });
    }
    setLoading(false);
  };
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">SST Management</h1>
      <p className="mb-4">Manage SST assignments and generate weekly tasks.</p>
      {message.text && (
        <div
          className={`mb-4 p-4 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Initial Assignment Section */}
        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Initial SST Assignment</h2>
          <p className="mb-4">
            Distribute unassigned students to active SST members.
          </p>
          <div className="flex flex-row flex-wrap gap-4">
            <Button
              onClick={handleInitialAssignment}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Assign All Students"}
            </Button>
            {/* <Button
              onClick={handleInitialAssignmentC}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Assign Conventional Students"}
            </Button>
            <Button
              onClick={handleInitialAssignmentNov25}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Assign Nov 25 Students"}
            </Button> */}
          </div>
        </div>

        {/* Weekly Task Generation Section */}
        <div className="border p-6 rounded-lg shadow-sm gap-2">
          <h2 className="text-xl font-semibold mb-4">Generate Weekly Tasks</h2>
          <Label htmlFor="week" className="block mb-2">
            Select Week:
          </Label>
          <Select onValueChange={(value) => setWeek(parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a week" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[1, 2, 3, 4].map((w) => (
                  <SelectItem key={w} value={w.toString()}>
                    Week {w}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerateTasks}
            disabled={loading}
            className="bg-green-600 text-white mt-2 px-4 py-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Generate Tasks"}
          </Button>
        </div>
      </div>
    </div>
  );
}
