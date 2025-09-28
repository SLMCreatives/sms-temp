"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EngagementSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function EngagementSearch({
  searchTerm,
  onSearchChange
}: EngagementSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Search engagements..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
