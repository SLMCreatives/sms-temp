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

type PaymentMode = "PTPTN" | "SELF" | "Others";

interface ChangePaymentFormProps {
  matric_no: string;
  payment_mode: string;
}

const supabase = createClient();

export default function NewChangePaymentForm({
  matric_no,
  payment_mode
}: ChangePaymentFormProps) {
  const [status, setStatus] = useState<PaymentMode>(
    payment_mode as PaymentMode
  );

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handlePaymentChange(status);
  };

  const handlePaymentChange = async (status: PaymentMode) => {
    try {
      const { error } = await supabase
        .from("a_payments")
        .update({ payment_mode: status })
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
        <Badge
          variant="outline"
          className={`
           px-3 py-1 cursor-pointer hover:opacity-80 transition text-xs`}
        >
          {status}
        </Badge>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Change Payment Mode</DialogTitle>
          <DialogDescription className="hidden">
            Change happens in database
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <Select
            onValueChange={(status) => setStatus(status as PaymentMode)}
            defaultValue={status}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PTPTN">PTPTN</SelectItem>
              <SelectItem value="SELF">Self Payment</SelectItem>
              <SelectItem value="Other">Others</SelectItem>
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
