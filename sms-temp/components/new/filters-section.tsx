import { Search, X } from "lucide-react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "../ui/select";

export const ALL = "all";

export type StudentFilters = {
  study_level: string;
  campus_code: string;
  payment_mode: string;
};

export const emptyFilters: StudentFilters = {
  study_level: ALL,
  campus_code: ALL,
  payment_mode: ALL
};

export default function FiltersSection({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  levelOptions,
  campusOptions
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filters: StudentFilters;
  setFilters: (filters: StudentFilters) => void;
  levelOptions: string[];
  campusOptions: string[];
}) {
  const hasFilters =
    searchQuery.length > 0 ||
    Object.values(filters).some((value) => value !== ALL);

  return (
    <div className="w-full py-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-lg border px-3 bg-muted/30">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-left w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          placeholder="Search name, matric number or email..."
        />
      </div>

      <div className="flex flex-row flex-wrap gap-2 w-full">
        <Select
          value={filters.study_level}
          onValueChange={(value) =>
            setFilters({ ...filters, study_level: value })
          }
        >
          <SelectTrigger className="flex-1 min-w-[110px] h-9">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Level</SelectLabel>
              <SelectItem value={ALL}>All levels</SelectItem>
              {levelOptions.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={filters.campus_code}
          onValueChange={(value) =>
            setFilters({ ...filters, campus_code: value })
          }
        >
          <SelectTrigger className="flex-1 min-w-[110px] h-9">
            <SelectValue placeholder="Campus" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Campus</SelectLabel>
              <SelectItem value={ALL}>All campuses</SelectItem>
              {campusOptions.map((campus) => (
                <SelectItem key={campus} value={campus}>
                  {campus}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={filters.payment_mode}
          onValueChange={(value) =>
            setFilters({ ...filters, payment_mode: value })
          }
        >
          <SelectTrigger className="flex-1 min-w-[130px] h-9">
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Payment method</SelectLabel>
              <SelectItem value={ALL}>All methods</SelectItem>
              <SelectItem value="PTPTN">PTPTN</SelectItem>
              <SelectItem value="SELF">Self paying</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => {
              setSearchQuery("");
              setFilters(emptyFilters);
            }}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
