"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type StudentStatus = "Active" | "At Risk" | "Withdraw" | "Deferred";

interface ChangeStatusFormProps {
  matric_no: string;
  current_status: string;
}

const supabase = createClient();

export default function NewChangeStatusForm({
  matric_no,
  current_status
}: ChangeStatusFormProps) {
  const [status, setStatus] = useState<StudentStatus>(
    current_status as StudentStatus
  );

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleStatusChange(status);
    router.refresh();
  };

  const handleStatusChange = async (status: StudentStatus) => {
    try {
      const { error } = await supabase
        .from("a_students")
        .update({ status: status })
        .eq("matric_no", matric_no)
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
          variant="outline"
          className={`${status === "Withdraw" && "bg-red-200"} ${status === "Deferred" && "bg-orange-200"} ${status === "At Risk" && "bg-yellow-200"}
           px-3 py-1 cursor-pointer hover:opacity-80 transition text-xs`}
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
