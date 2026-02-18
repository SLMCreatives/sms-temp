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

type SSTID = "1" | "2" | "3" | "4";

interface ChangePaymentFormProps {
  matric_no: string;
  sst_id: string;
}

const supabase = createClient();

export default function NewChangeSSTForm({
  matric_no,
  sst_id
}: ChangePaymentFormProps) {
  const [status, setStatus] = useState<SSTID>(sst_id as SSTID);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handlePaymentChange(status);
    router.refresh();
  };

  const handlePaymentChange = async (status: SSTID) => {
    try {
      const { error } = await supabase
        .from("a_students")
        .update({ sst_id: status })
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
          className={`
           px-3 py-1 cursor-pointer hover:opacity-80 transition text-xs border-0`}
        >
          {status === "1"
            ? "Amirul"
            : status === "2"
              ? "Farzana"
              : status === "3"
                ? "Najwa"
                : status === "4"
                  ? "Ayu"
                  : "-"}
        </Badge>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Change Assigned SST</DialogTitle>
          <DialogDescription className="hidden">
            Change happens in database
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <Select
            onValueChange={(status) => setStatus(status as SSTID)}
            defaultValue={status}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Assign SST" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Amirul</SelectItem>
              <SelectItem value="4">Ayu</SelectItem>
              <SelectItem value="2">Farzana</SelectItem>
              <SelectItem value="3">Najwa</SelectItem>
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
