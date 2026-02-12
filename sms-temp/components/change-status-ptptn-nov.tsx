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

type PTPTNStatus = "TRUE" | "FALSE";

interface ChangeStatusFormProps {
  student: Students;
}

const supabase = createClient();

export default function ChangeStatusPTPTNFormNov({
  student
}: ChangeStatusFormProps) {
  const [status, setStatus] = useState<PTPTNStatus>(
    student.nov25_payment?.proof as PTPTNStatus
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleStatusChange(status);
  };

  const handleStatusChange = async (status: PTPTNStatus) => {
    try {
      const { error } = await supabase
        .from("nov25_payment")
        .update({ proof: status })
        .eq("matric_no", student.matric_no)
        .select()
        .single();

      if (error) {
        toast.error("Error updating status: " + error);
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
            status !== "TRUE" && "bg-red-600"
          } px-3 py-1 cursor-pointer hover:opacity-80 transition`}
        >
          {status}
        </Badge>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Change PTPTN Status</DialogTitle>
          <DialogDescription className="hidden">
            Change happens in database
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <Select
            onValueChange={(status) => setStatus(status as PTPTNStatus)}
            defaultValue={status}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRUE">True</SelectItem>
              <SelectItem value="FALSE">False</SelectItem>
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
