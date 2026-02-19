/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageSquarePlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet";
import { Button } from "../ui/button";
import { StudentDashboardRow } from "@/lib/types/database";
import { NewEngagementForm } from "./engagement-form";

const sstMembers = [
  {
    id: 1,
    name: "Amirul",
    image: "sst/amirul.png"
  },
  {
    id: 2,
    name: "Farzana",
    image: "sst/farzana.png"
  },
  {
    id: 4,
    name: "Ayu",
    image: "sst/ayu.jpeg"
  },
  {
    id: 3,
    name: "Najwa",
    image: "sst/najwa.png"
  }
];

const engagementTabs = [
  {
    label: "Engagements",
    value: "student.a_engagements ? student.a_engagements.length : 0",
    icon: MessageSquarePlus
  }
];

export default function StudentEngagement({
  student
}: {
  student: StudentDashboardRow;
}) {
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
    <div className="flex flex-col gap-2 ml-2 relative">
      <div className="absolute top-0 right-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"outline"} size={"sm"} className="w-fit ">
              +
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full h-full overflow-y-scroll lg:w-1/2"
          >
            <SheetHeader>
              <SheetTitle>Add Engagement</SheetTitle>
            </SheetHeader>
            <NewEngagementForm matric_no={student.matric_no} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex flex-col gap-2 items-start">
        {engagementTabs.map((tab) => (
          <div
            key={tab.value}
            className="grid grid-cols-[auto,auto,1fr] items-center gap-3"
          >
            <tab.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{tab.label}</p>
            <p className="font-medium text-xs break-all text-right line-clamp-1">
              {eval(tab.value)}
            </p>
          </div>
        ))}
      </div>
      {engagements && (
        <div className="space-y-2">
          {engagements.map((engagement, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 items-start border-b pb-2 pr-6"
            >
              {/* <MessageSquarePlus className="w-4 h-4 text-muted-foreground flex-shrink-0" /> */}
              <p className="text-xs text-muted-foreground">
                {engagement.topic}- {formattedDate(engagement.created_at)}
              </p>
              <p className="font-medium text-xs">{engagement.remarks}</p>
              <p className="font-medium text-xs text-muted-foreground italic">
                {engagement.sst_id
                  ? sstMembers.find((sst) => sst.id === engagement.sst_id)?.name
                  : "-"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
