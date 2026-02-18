"use client";

import { useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { CheckCircle, CircleX } from "lucide-react";
import { useRouter } from "next/navigation";

type ptptnStatus = boolean;

interface ChangePTPTNStatusProps {
  matric_no: string;
  ptptn_proof_status: boolean;
}

const supabase = createClient();

export default function NewChangePTPTNStatusForm({
  matric_no,
  ptptn_proof_status
}: ChangePTPTNStatusProps) {
  const [status, setStatus] = useState<ptptnStatus>(
    ptptn_proof_status as ptptnStatus
  );

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handlePTPTNstatusChange(status);
  };

  const handlePTPTNstatusChange = async (status: ptptnStatus) => {
    try {
      const { error } = await supabase
        .from("a_payments")
        .update({ ptptn_proof_status: status })
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
    router.refresh();
  };

  const [open, setClose] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setClose}>
      <DialogTrigger asChild>
        {status === true ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <CircleX className="h-6 w-6 text-red-500" />
        )}
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Change Payment Mode</DialogTitle>
          <DialogDescription className="hidden">
            Change happens in database
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center gap-4 py-4"
        >
          <Switch
            checked={status}
            onCheckedChange={setStatus}
            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
          />
          <Label>{status === true ? "Approved" : "No Proof"}</Label>
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
