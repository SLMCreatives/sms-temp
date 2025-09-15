/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useState } from "react";
import { DataTablePagination } from "@/components/ui/paginationControls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function DataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<
    import("@tanstack/react-table").SortingState
  >([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  //const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  //const [selectedStudent, setSelectedStudent] = useState<TData | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      columnFilters,
      sorting
    }
  });

  const handleFacultyFilter = (value: string) => {
    if (value === "all") {
      table.getColumn("faculty_code")?.setFilterValue("");
    } else {
      table.getColumn("faculty_code")?.setFilterValue(value);
    }
  };

  const handleStatusFilter = (value: string) => {
    if (value === "all") {
      table.getColumn("status")?.setFilterValue("");
    } else {
      table.getColumn("status")?.setFilterValue(value);
    }
  };

  const clearFilters = () => {
    table.getColumn("matric_no")?.setFilterValue("");
    table.getColumn("faculty_code")?.setFilterValue("");
    table.getColumn("status")?.setFilterValue("");
  };

  const filteredRows = table.getFilteredRowModel().rows;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredData = filteredRows.map((row) => row.original as any);

  const totalStudents = data.length;
  const filteredFacultyStudents = filteredData.length;
  const activeStudents = filteredData.filter(
    (student) => student.status === "Active"
  ).length;
  const lostStudents = filteredData.filter(
    (student) => student.status === "Lost"
  ).length;
  const withdrawnStudents = filteredData.filter(
    (student) => student.status === "Withdrawn"
  ).length;
  const deferredStudents = filteredData.filter(
    (student) => student.status === "Deferred"
  ).length;

  return (
    <div className="overflow-auto rounded-md border w-[1000px] px-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-4 border-b">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {totalStudents}
          </div>
          <div className="text-sm text-muted-foreground">Total Students</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredFacultyStudents}
          </div>
          <div className="text-sm text-muted-foreground">Filtered Students</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {activeStudents}
          </div>
          <div className="text-sm text-muted-foreground">Active Students</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{lostStudents}</div>
          <div className="text-sm text-muted-foreground">Lost Students</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {withdrawnStudents}
          </div>
          <div className="text-sm text-muted-foreground">Withdrawn</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {deferredStudents}
          </div>
          <div className="text-sm text-muted-foreground">Deferred</div>
        </div>
      </div>
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Search matric number..."
          value={
            (table.getColumn("matric_no")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("matric_no")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <Select onValueChange={handleFacultyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Faculty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Faculties</SelectItem>
            <SelectItem value="FoB">FoB</SelectItem>
            <SelectItem value="FEH">FEH</SelectItem>
            <SelectItem value="SIT">SIT</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="Change-Program">Change Programme</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
            <SelectItem value="deferred">Deferred</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={clearFilters}
          className="ml-auto bg-transparent"
        >
          Clear Filters
        </Button>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className=" hover:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>

      {/* <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[380px] md:w-1/3">
          <SheetHeader>
            <SheetTitle>Student Details</SheetTitle>
            <SheetDescription>
              View detailed information about the selected student.
            </SheetDescription>
          </SheetHeader>
          {selectedStudent && (
            <div className="mt-6 flex flex-col gap-2 px-6 space-y-4 overflow-auto">
              <h2 className="text-lg font-semibold">Personal Information</h2>
              <Button asChild>
                <Link
                  href={`/protected/student/${
                    (selectedStudent as any).matric_no
                  }`}
                  className="w-full text-center"
                ></Link>
              </Button>
              {Object.entries(selectedStudent as Record<string, unknown>).map(
                ([key, value]) => (
                  <div key={key} className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </label>
                    <div className="text-sm font-mono bg-muted p-2 rounded">
                      {value?.toString() || "N/A"}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </SheetContent>
      </Sheet> */}
    </div>
  );
}
