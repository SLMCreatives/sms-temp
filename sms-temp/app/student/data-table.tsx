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
import { StudentDashboardRow } from "@/lib/types/database";
import {
  CheckCheck,
  CheckCircle,
  Laptop,
  RefreshCcw,
  School,
  Search,
  UserCircle,
  XCircle
} from "lucide-react";
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
import { DataTableViewOptions } from "./view-options";
import "@/app/globals.css";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter } from "next/navigation";

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
    left: ["select", "Matric No", "name"],
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

  const router = useRouter();
  const filteredCount = table.getFilteredRowModel().rows.length;

  const handleReset = () => {
    table.resetColumnFilters();
    table.resetSorting();
    router.refresh();
  };

  return (
    <div className="grid grid-cols-3 gap-8 gap-y-4 py-2">
      <div className="col-span-2 max-h-fit row-span-3 rounded-2xl container p-4 drop-shadow-xl relative border-0 ">
        <div className="flex items-center pb-4 w-full gap-2 border-b">
          <div className="flex flex-row gap-2 w-full items-center">
            <Search className="w-4 h-4 text-primary" />
            <Input
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="text-left w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search name, matric number, status or outcome"
            />
          </div>
          {/* <div>
            <Selectß
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
          </div> */}

          <div>
            <Select
              value={
                (table.getColumn("Status")?.getFilterValue() as string) ?? ""
              }
              onValueChange={(value) =>
                table
                  .getColumn("Status")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
              defaultValue="Active"
            >
              <SelectTrigger className="lg:w-fit w-full border-0">
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
              onValueChange={(value) => {
                const column = table.getColumn("sos");
                if (!column) return;

                if (value === "all") {
                  column.setFilterValue(undefined); // Clear filter
                } else if (value === "submitted") {
                  column.setFilterValue(true); // Signal to filter for length > 0
                } else if (value === "not-submitted") {
                  column.setFilterValue(false); // Signal to filter for length === 0
                }
              }}
            >
              <SelectTrigger className="lg:w-fit w-full border-0">
                <SelectValue placeholder="SOS" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>SOS</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="submitted">
                    <CheckCheck className=" text-green-500 mr-2" />
                  </SelectItem>
                  <SelectItem value="not-submitted">
                    <XCircle className="mr-2 text-red-500" />
                  </SelectItem>
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
              <SelectTrigger className="lg:w-fit w-full border-0">
                <SelectValue placeholder="Payment Mode" />
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

          <ToggleGroup
            type="single"
            variant={"default"}
            spacing={2}
            onValueChange={(value) => {
              table
                .getColumn("ptptn_proof_status")
                ?.setFilterValue(value ? true : false);
            }}
            className="space-x-4"
          >
            <ToggleGroupItem
              value="true"
              aria-label="Toggle true"
              className="data-[state=on]:bg-green-200 dark:data-[state=on]:bg-green-700 dark:data-[state=on]:text-white data-[state=on]:text-black data-[state=off]:bg-red-200 dark:data-[state=off]:bg-red-700 dark:data-[state=off]:text-white data-[state=off]:text-black"
            >
              <CheckCircle className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            type="single"
            variant={"default"}
            defaultValue="Online"
            spacing={2}
            onValueChange={(value) => {
              table.getColumn("study_mode")?.setFilterValue(value);
            }}
            className="space-x-2"
          >
            <ToggleGroupItem
              value="Online"
              aria-label="Toggle Online"
              className="data-[state=on]:bg-purple-200 dark:data-[state=on]:bg-purple-700 dark:data-[state=on]:text-white data-[state=on]:text-black"
            >
              <Laptop className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Conventional"
              aria-label="Toggle Conventional"
              className="data-[state=on]:bg-amber-200 dark:data-[state=on]:bg-amber-700 dark:data-[state=on]:text-white data-[state=on]:text-black"
            >
              <School className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          {/*  <Switch
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
          /> */}
          <div className="absolute -top-12 right-2 flex flex-row gap-4 items-center justify-end">
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
            <DataTableViewOptions table={table} />

            <p className="text-xs italic text-muted-foreground">
              {filteredCount}/{data.length}
            </p>
          </div>
          <div>
            <Button variant="ghost" onClick={() => handleReset()}>
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
                      className={`${header.column.id === "name" ? "sticky left-0 z-20" : ""}`}
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
                  key={row.index}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => row.toggleSelected()}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${cell.column.id === "name" ? "sticky left-0 z-20 py-4 " : ""} ${row.getIsSelected() ? "font-bold " : "text-stone-500"} bg-white  dark:bg-black text-black dark:text-white`}
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
                  student={row.original as StudentDashboardRow}
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
