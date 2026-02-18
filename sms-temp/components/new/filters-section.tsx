/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "../ui/input";

export default function FiltersSection({ searchQuery, setSearchQuery }: any) {
  return (
    <div className="w-full py-6 flex flex-col lg:flex-row items-center gap-4">
      <div className="flex flex-row gap-4 w-full items-center">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-left w-full"
          placeholder="Search student name, matric number or email..."
        />
      </div>

      {/* <div className="flex flex-row gap-2 w-full mx-auto">
        <Select
          value={filters.payment_mode}
          onValueChange={(value) =>
            setFilters({ ...filters, payment_mode: value })
          }
        >
          <SelectTrigger className="lg:w-[180px] w-full">
            <SelectValue placeholder="Payment Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Payment Mode</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PTPTN">PTPTN</SelectItem>
              <SelectItem value="SELF">Self Paying</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={filters.sst_id}
          onValueChange={(value) => setFilters({ ...filters, sst_id: value })}
        >
          <SelectTrigger className="lg:w-[180px] w-full">
            <SelectValue placeholder="Assigned SST" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Assigned SST</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1">Amirul</SelectItem>
              <SelectItem value="2">Farzana</SelectItem>
              <SelectItem value="3">Najwa</SelectItem>
              <SelectItem value="4">Ayu</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div> */}
    </div>
  );
}
