"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type CNUsers = {
  id: string;
  cn_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  labels: string[];
  user_id: string;
  login_id?: string;
};

export const columns: ColumnDef<CNUsers>[] = [
  {
    accessorKey: "cn_number",
    header: "CN Number"
  },
  {
    accessorKey: "first_name",
    header: "First Name"
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    accessorKey: "status",
    header: "Status"
  }
];
