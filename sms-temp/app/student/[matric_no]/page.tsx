"use client";

import StudentDetailsPage from "@/components/student-details";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Students } from "../studentColumns";

const supabase = createClient();

export default function StudentPage({
  params
}: {
  params: Promise<{ matric_no: string }>;
}) {
  const { matric_no } = use(params);
  const [student, setStudent] = useState<Students | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*, engagements(*)")
          .eq("matric_no", matric_no)
          .single();

        if (error) throw error;
        setStudent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, [matric_no]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!student) return <div>No student found</div>;

  return (
    <main className="py-6 px-2 container mx-auto">
      <Link
        href={`/student/${student.faculty_code.toLowerCase()}`}
        className="text-blue-500 hover:underline pl-4"
      >
        &larr; Back
      </Link>
      <StudentDetailsPage studentData={student} />
    </main>
  );
}
