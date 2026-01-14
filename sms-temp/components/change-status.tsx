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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type StudentStatus = "Active" | "At-Risk" | "Withdrawn" | "Deferred";

interface ChangeStatusFormProps {
  student: Students;
}

const supabase = createClient();

export default function ChangeStatusForm({ student }: ChangeStatusFormProps) {
  const [status, setStatus] = useState<StudentStatus>(
    student.status as StudentStatus
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleStatusChange(status);
  };

  const handleStatusChange = async (status: StudentStatus) => {
    try {
      const { error } = await supabase
        .from("jan26_students")
        .update({ status: status })
        .eq("matric_no", student.matric_no)
        .select()
        .single();

      if (error) {
        toast.error("Error updating status: " + error.message);
      } else {
        toast.success("Student status updated to " + status);
        setStatus(status); // Update local state to reflect the change
      }
    } catch (error) {
      toast.error("An unexpected error occurred." + error);
    }
  };

  const [open, setClose] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setClose}>
      <DialogTrigger asChild>
        <Badge
          variant="default"
          className={`${
            status !== "Active" && "bg-red-600"
          } px-3 py-1 cursor-pointer hover:opacity-80 transition`}
        >
          {status}
        </Badge>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Change Student Status</DialogTitle>
          <DialogDescription className="hidden">
            Change happens in database
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
          <DialogClose asChild>
            <Button type="submit" className="w-full">
              Update Status
            </Button>
          </DialogClose>
        </form>
      </DialogContent>
    </Dialog>
  );
}
