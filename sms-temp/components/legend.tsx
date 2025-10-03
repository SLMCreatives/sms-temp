import {
  AlertCircle,
  CircleCheckBig,
  MessageCircleOff,
  PhoneMissed
} from "lucide-react";

export default function StudentListLegend() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-center p-4 w-full bg-stone-100 rounded-xl">
      <div className="flex flex-row gap-2 justify-start items-center">
        <MessageCircleOff className="w-4 h-4 text-red-500" /> Not Engaged
      </div>
      <div className="flex flex-row gap-2 justify-start items-center">
        <PhoneMissed className="w-4 h-4 text-red-500" /> No Reponse
      </div>
      <div className="flex flex-row gap-2 justify-start items-center">
        <AlertCircle className="w-4 h-4 text-yellow-500" /> Low Engagement
      </div>
      <div className="flex flex-row gap-2 justify-start items-center">
        <CircleCheckBig className="w-4 h-4 text-green-500" /> Engaged
      </div>
    </div>
  );
}
