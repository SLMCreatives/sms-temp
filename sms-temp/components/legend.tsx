import {
  AlertCircle,
  BadgeX,
  MessageCircleOff,
  PhoneMissed
} from "lucide-react";

export default function StudentListLegend() {
  return (
    <div className="grid grid-cols-2 gap-4 items-center">
      <div className="flex flex-row gap-2">
        <PhoneMissed className="min-w-6 min-h-6 text-red-500" /> No Reponse
      </div>
      <div className="flex flex-row gap-2">
        <MessageCircleOff className="min-w-6 min-h-6 text-red-500" /> Not
        Engaged
      </div>
      <div className="flex flex-row gap-2">
        <AlertCircle className="min-w-6 min-h-6 text-yellow-500" /> Low
        Engagement
      </div>
      <div className="flex flex-row gap-2">
        <BadgeX className="min-w-6 min-h-6 text-red-500" /> Withdrawn / Deferred
      </div>
    </div>
  );
}
