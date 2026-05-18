"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { EngagementTracker } from "./engagement-tracker";

interface UserProfileClientProps {
  avatarUrl?: string;
  initials: string;
  fullName?: string;
}

export function UserProfileClient({
  avatarUrl,
  initials,
  fullName
}: UserProfileClientProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center space-x-4 cursor-pointer">
          <Avatar className="h-10 w-10 rounded-full">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt={fullName ?? initials} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="end"
        side="left"
        alignOffset={-4}
        sideOffset={8}
      >
        <EngagementTracker />
      </PopoverContent>
    </Popover>
  );
}
