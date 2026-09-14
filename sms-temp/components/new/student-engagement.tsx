"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Trash } from "lucide-react";
import { Button } from "../ui/button";
import { StudentDashboardRow } from "@/lib/types/database";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSstById } from "@/lib/sst-members";

export default function StudentEngagement({
  student
}: {
  student: StudentDashboardRow;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this engagement? This cannot be undone.")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("a_engagements").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast.error("Failed to delete engagement.");
    } else {
      toast.success("Engagement deleted.");
      router.refresh();
    }
  };

  const formattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit"
    });
  };

  const engagements =
    student.a_engagements
      ?.map((engagement) => engagement)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];

  return (
    <div className="flex flex-col gap-3 relative">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Engagement history
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {engagements.length}
        </span>
      </div>
      {engagements.length === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          No engagements recorded yet. Ticking a check on the Checks tab adds an
          entry here.
        </p>
      )}
      {engagements && (
        <div className="space-y-2">
          {engagements.map((engagement, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 items-start border-b pb-2 pr-6"
            >
              {/* <MessageSquarePlus className="w-4 h-4 text-muted-foreground flex-shrink-0" /> */}

              <div className="flex flex-row gap-4 items-start justify-start py-1">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={
                      getSstById(engagement.sst_id)?.image ?? ""
                    }
                  />
                  <AvatarFallback>{engagement.sst_id}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  {/* <p className="text-md text-muted-foreground font-bold">
                    {engagement.topic}
                  </p> */}
                  <p className="font-medium text-xs pb-1">
                    {" "}
                    <span className="font-bold">{engagement.topic}</span>:{" "}
                    {engagement.outcome.replace(/[._-]/g, " ").toUpperCase()} -{" "}
                    {engagement.remarks}
                  </p>
                  <p className="text-xs text-muted-foreground/80 italic">
                    {formattedDate(engagement.created_at)}
                  </p>
                  <div className="flex flex-row gap-2 items-center w-full">
                    <Button
                      variant={"outline"}
                      size={"lg"}
                      className="w-fit ml-auto"
                      disabled={deletingId === engagement.id}
                      onClick={() => handleDelete(engagement.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
