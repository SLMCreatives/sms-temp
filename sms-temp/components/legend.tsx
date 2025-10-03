import { AlertCircle, CircleCheckBig, MessageCircleOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Button } from "./ui/button";

export default function StudentListLegend() {
  return (
    <div className="flex flex-col gap-2 fixed bottom-10 right-10">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"default"} size="icon" className="rounded-full ">
            ?
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[300px]">
          <DialogHeader>
            <DialogTitle>Icon Legend</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 items-start w-full ">
            <div className="flex flex-row gap-2 justify-start items-center text-sm font-bold">
              <CircleCheckBig className="w-6 h-6 text-green-500" /> Engaged This
              Week
            </div>
            <div className="flex flex-row gap-2 justify-start items-center text-sm font-bold">
              <MessageCircleOff className="w-6 h-6 text-red-500" /> Not Engaged
              This Week
            </div>
            <div className="flex flex-row gap-2 justify-start items-center text-sm font-bold">
              <AlertCircle className="w-6 h-6 text-yellow-500" /> At Risk (as of
              29 Sept)
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
