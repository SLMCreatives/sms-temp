"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getPaginationRowModel,
  ColumnPinningState,
  ColumnFiltersState,
  getFilteredRowModel
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import * as React from "react";
import { DataTablePagination } from "@/components/ui/paginationControls";
import { NewStudentCard } from "@/components/new/student-card";
import { Student } from "@/lib/types/database";
import { RefreshCcw, Search, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ["select", "matric_no", "full_name"],
    right: []
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnPinning,
      rowSelection,
      columnFilters
    },
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection: false,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="grid grid-cols-3 gap-8 gap-y-4">
      <div className="col-span-2 max-h-fit row-span-3 rounded-2xl border bg-background p-4 drop-shadow-xl relative">
        <div className="flex items-center pb-4 w-full gap-2 border-b">
          <div className="flex flex-row gap-2 w-full items-center">
            <Search className="w-4 h-4 text-primary" />
            <Input
              value={
                (table.getColumn("full_name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("full_name")?.setFilterValue(event.target.value)
              }
              className="text-left w-full"
              placeholder="Search student name..."
            />
          </div>
          <div>
            <Select
              value={
                (table.getColumn("sst_id")?.getFilterValue() as string) ?? ""
              }
              onValueChange={(value) =>
                table
                  .getColumn("sst_id")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="lg:w-fit w-full">
                <SelectValue placeholder="SST" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>SST Members</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">Amirul</SelectItem>
                  <SelectItem value="2">Farzana</SelectItem>
                  <SelectItem value="3">Najwa</SelectItem>
                  <SelectItem value="4">Ayu</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={
                (table.getColumn("status")?.getFilterValue() as string) ?? ""
              }
              onValueChange={(value) =>
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
              defaultValue="Active"
            >
              <SelectTrigger className="lg:w-fit w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
                  <SelectItem value="Withdraw">Withdraw</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={
                (table.getColumn("payment_mode")?.getFilterValue() as string) ??
                ""
              }
              onValueChange={(value) =>
                table
                  .getColumn("payment_mode")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="lg:w-fit w-full">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Payment Mode</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="PTPTN">PTPTN</SelectItem>
                  <SelectItem value="SELF">SELF</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Label htmlFor="ptptn_proof_status" className="text-muted-foreground">
            Proof
          </Label>
          <Switch
            id="ptptn_proof_status"
            checked={
              table.getColumn("ptptn_proof_status")?.getFilterValue() === true
            }
            onCheckedChange={(value) => {
              table.getColumn("ptptn_proof_status")?.setFilterValue(value);
            }}
            defaultChecked={true}
          />
          <Label htmlFor="study_mode" className="text-muted-foreground">
            Mode
          </Label>
          <Switch
            id="study_mode"
            checked={
              table.getColumn("study_mode")?.getFilterValue() === "Online"
            }
            onCheckedChange={(value) => {
              table
                .getColumn("study_mode")
                ?.setFilterValue(value ? "Online" : "Conventional");
            }}
            defaultChecked={true}
          />
          <div className="absolute -top-8 right-2">
            <p className="text-xs italic text-muted-foreground">
              {filteredCount}/{data.length}
            </p>
          </div>
          <div>
            <Button variant="ghost" onClick={() => table.resetColumnFilters()}>
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`${header.column.id === "full_name" || header.column.id === "select" ? "sticky left-0 bg-background" : ""}`}
                    >
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
                  onClick={() => row.toggleSelected()}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${cell.column.id === "full_name" || cell.column.id === "select" ? "sticky left-0 bg-background" : ""}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
      <div className="flex flex-col gap-8 sticky top-6 ">
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          table
            .getFilteredSelectedRowModel()
            .rows.toReversed()
            .map((row, index) => (
              <div
                className="rounded-2xl border bg-background p-4 drop-shadow-xl"
                key={row.id}
              >
                <NewStudentCard
                  student={row.original as Student}
                  index={index + 1}
                />
              </div>
            ))
        ) : (
          <div className="flex w-full h-[250px] rounded-2xl border bg-background p-4 drop-shadow-xl items-center justify-center flex-col gap-2 text-muted-foreground">
            <UserCircle width={50} height={50} className="w-10 h-10" />
            <p>Select A Student To View Details</p>
          </div>
        )}
        {/*  <div className="flex flex-col w-full rounded-2xl bg-background p-4 drop-shadow-xl items-center justify-center">
          <Calendar className="w-full h-full" />
        </div> */}
      </div>
    </div>
  );
}
