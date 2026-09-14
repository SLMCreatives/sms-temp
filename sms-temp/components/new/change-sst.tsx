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
import { SST_MEMBERS, getSstById } from "@/lib/sst-members";

type SSTID = string;

interface ChangePaymentFormProps {
  matric_no: string;
  sst_id: string;
}

const supabase = createClient();

export default function NewChangeSSTForm({
  matric_no,
  sst_id
}: ChangePaymentFormProps) {
  const [sstID, setsstID] = useState<SSTID>(sst_id as SSTID);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(sstID);
    await handleSSTchange(sstID);
    router.refresh();
  };

  const handleSSTchange = async (sstID: SSTID) => {
    console.log(sstID, matric_no);
    try {
      const { error } = await supabase
        .from("a_students")
        .update({ sst_id: sstID })
        .eq("matric_no", matric_no)
        .select()
        .single();
      if (error) {
        toast.error("Error updating status: " + error);
      } else {
        toast.success("Student assigned SST updated to " + sstID);
        setsstID(sstID); // Update local state to reflect the change
      }
    } catch (error) {
      toast.error("An unexpected error occurred." + error);
    }
  };

  const [open, setClose] = useState(false);
  // Resolves retired members too, so existing assignments still show a name.
  const assigned = getSstById(Number(sst_id));

  return (
    <Dialog open={open} onOpenChange={setClose}>
      <DialogTrigger asChild>
        <Badge
          variant="outline"
          className={`cursor-pointer hover:opacity-80 transition text-xs ${
            assigned?.badgeClass ?? "border-0 bg-muted text-muted-foreground"
          }`}
        >
          {assigned?.name ?? "-"}
        </Badge>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Change Assigned SST</DialogTitle>
          <DialogDescription className="hidden">
            Change happens in database
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(value) => handleSubmit(value)}
          className="grid gap-4 py-4"
        >
          <Select
            onValueChange={(value) => setsstID(value as SSTID)}
            value={sstID}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Assign SST" />
            </SelectTrigger>
            <SelectContent>
              {SST_MEMBERS.map((member) => (
                <SelectItem key={member.id} value={String(member.id)}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogClose asChild>
            <Button type="submit" className="w-full">
              Update SST
            </Button>
          </DialogClose>
        </form>
      </DialogContent>
    </Dialog>
  );
}
