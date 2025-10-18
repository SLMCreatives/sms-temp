"use client";
import { useEffect, useState } from "react";
import { DataTable } from "./datatable";
import { columns } from "./cncolumns";
import { Button } from "@/components/ui/button";

interface CNUser {
  id: string;
  cn_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  labels: string[];
  user_id: string;
  login_id?: string;
}

type dataType = {
  data: CNUser[];
};

type ApiResp = { data?: dataType; errs?: unknown };

export default function CoursesPage() {
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [userLists, setUserLists] = useState<dataType>({ data: [] });

  const REVALIDATION_INTERVAL = 10 * 60 * 1000;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(
          `/cn/api/cn/courses2?limit=12&offset=${offset}`
        );
        const json: ApiResp = await res.json();
        if (json.data) {
          setUserLists(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }

    // Initial load
    load();

    // Set up interval for revalidation
    const intervalId = setInterval(load, REVALIDATION_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [REVALIDATION_INTERVAL, offset]);

  return (
    <main className="p-6 max-w-full lg:px-32 mx-auto">
      <p className="text-2xl font-semibold mb-4">CN Users</p>
      <div className="rounded-xl border p-4">
        <div className="flex items-center lg:w-full mb-4 overflow-scroll">
          <DataTable columns={columns} data={userLists.data} />
        </div>

        <div className="flex gap-2 justify-between mt-4">
          <Button
            className="px-3 py-2 rounded-lg border"
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - 12))}
          >
            Prev
          </Button>
          <p>{userLists.data.length}</p>
          <Button
            className="px-3 py-2 rounded-lg border"
            disabled={loading || userLists.data.length < 12}
            onClick={() => setOffset(offset + 12)}
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}
