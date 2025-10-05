"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Students } from "@/app/student/studentColumns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { createClient } from "@/lib/supabase/client";

type StudentStatus = "Active" | "At-Risk" | "Withdrawn" | "Deferred";

interface ChangeStatusFormProps {
  student: Students;
}

const supabase = createClient();

export default function ChangeStatusForm({ student }: ChangeStatusFormProps) {
  const [status, setStatus] = useState<StudentStatus>(
    student.status as StudentStatus
  );

  const handleStatusChange = async (newStatus: StudentStatus) => {
    try {
      const { data, error } = await supabase
        .from("students")
        .update({ status: newStatus })
        .eq("matric_no", student.matric_no)
        .select()
        .single();

      if (error) {
        console.error("Error updating status:", error.message);
      } else {
        console.log("Status updated successfully:", data);
        setStatus(newStatus); // Update local state to reflect the change
        setClose(true);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const [open, setClose] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size={"sm"} className="px-0">
          <Badge variant="default" className={`px-3 py-1`}>
            {status}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Change Student Status</DialogTitle>
          <DialogDescription className="hidden">
            Change happens in database
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Select
            onValueChange={(status) => setStatus(status as StudentStatus)}
            defaultValue={status}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Withdraw">Withdraw</SelectItem>
              <SelectItem value="Deferred">Deferred</SelectItem>
              <SelectItem value="At Risk">At Risk</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleStatusChange(status)} className="w-full">
            Update Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
