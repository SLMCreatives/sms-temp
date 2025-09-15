"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState, use } from "react";

const supabase = createClient();

interface Student {
  id: number;
  matric_no: string;
  full_name: string;
  programme_code: string;
  faculty_code: string;
  status: string;
  email: string;
  phone: string;
  admission_date: string;
  // Add other student fields as needed
}

export default function StudentPage({
  params
}: {
  params: Promise<{ matric_no: string }>;
}) {
  const { matric_no } = use(params);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
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
    <main className="p-6">
      <Link href="/protected/student" className="text-blue-500 hover:underline">
        &larr; Back to Student List
      </Link>
      <h1 className="text-xl font-bold">Student Details</h1>
      <div className="mt-4">
        <p>Matric Number: {student.matric_no}</p>
        <p>Full Name: {student.full_name}</p>
        <p>Programme Code: {student.programme_code}</p>
        <p>Faculty Code: {student.faculty_code}</p>
        <p>Status: {student.status}</p>
        <p>Email: {student.email}</p>
        <p>Phone: {student.phone}</p>
        <p>Admission Date: {student.admission_date}</p>
        {/* Add more student details as needed */}
      </div>
    </main>
  );
}
