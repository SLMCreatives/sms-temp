"use client";

import { Button } from "@/components/ui/button";
import { use, useEffect, useState } from "react";

interface CNEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress: number;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

type ApiResp<T> = { data?: T; errs?: unknown };

export default function CNStudentPage({
  params
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = use(params);

  const [student, setStudent] = useState<CNEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const REVALIDATION_INTERVAL = 10 * 60 * 1000;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/cn/api/cn/users?user_id=${user_id}`);
        const json: ApiResp<CNEnrollment> = await res.json();
        if (json.data) {
          setStudent(json.data);
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
  }, [REVALIDATION_INTERVAL, user_id]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <p>CN Number: {user_id}</p>
        <p>Name: {student?.user_id}</p>
        <Button variant="outline" disabled={loading}>
          View
        </Button>
      </div>
    </div>
  );
}
