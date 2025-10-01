import {
  AlertCircle,
  CircleCheckBig,
  MessageCircleOff,
  PhoneMissed
} from "lucide-react";

export default function StudentListLegend() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-center p-4 w-full bg-stone-100 rounded-xl">
      <div className="flex flex-row gap-2">
        <MessageCircleOff className="w-5 h-5 text-red-500" /> Not Engaged
      </div>
      <div className="flex flex-row gap-2">
        <PhoneMissed className="w-5 h-5 text-red-500" /> No Reponse
      </div>
      <div className="flex flex-row gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-500" /> Low Engagement
      </div>
      <div className="flex flex-row gap-2">
        <CircleCheckBig className="w-5 h-5 text-green-500" /> Engaged
      </div>
    </div>
  );
}
