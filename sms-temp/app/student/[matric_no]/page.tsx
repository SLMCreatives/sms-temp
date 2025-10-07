"use client";

import StudentDetailsPage from "@/components/student-details";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, use } from "react";
import { Comments, Students } from "../studentColumns";

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
          .select("*, engagements(*), lms_activity(*)")
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

  const [comments, setComments] = useState<Comments[] | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("engagement_id", student?.engagements[0]?.id);
        if (error) throw error;
        setComments(data);
      } catch (error) {
        console.log("Error fetching comments:", error);
      }
    }

    fetchComments();
  }, [student]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!student) return <div>No student found</div>;

  return (
    <main className="container mx-auto relative">
      <StudentDetailsPage studentData={student} comments={comments || []} />
    </main>
  );
}
