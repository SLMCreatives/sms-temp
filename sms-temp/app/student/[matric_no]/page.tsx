"use client";

import StudentDetailsPage from "@/components/student-details";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, use } from "react";
import { Students } from "../studentColumns";
import StudentDetailsPageC from "@/components/student-details-c";
import StudentDetailsPageNov from "@/components/student-details-nov";

const supabase = createClient();

type TableSearch = {
  table: string;
  select: string;
};

const tables: TableSearch[] = [
  {
    table: "jan26_students",
    select: "*, jan26_engagements(*), jan26_lms_activity(*), jan26_payment(*)"
  },
  {
    table: "jan26_c_students",
    select: "*, jan26_c_payment(*), jan26_c_engagements(*)"
  },
  {
    table: "nov25_students",
    select: "*, nov25_engagements(*), nov25_lms_activity(*), nov25_payment(*)"
  }
];

export default function StudentPage({
  params
}: {
  params: Promise<{ matric_no: string }>;
}) {
  const { matric_no } = use(params);
  const [student, setStudent] = useState<Students | null>(null);
  //const [studentData, setStudentData ] = useState<Students | null>(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* 
  useEffect(() => {
    async function fetchStudent() {
      try {
        const { data, error } = await supabase
          .from("jan26_students")
          .select(
            "*, jan26_engagements(*), jan26_lms_activity(*), jan26_payment(*)"
          )
          .eq("matric_no", matric_no)
          .single();
        if (error) {
          // Try fetching from jan26_c_students if not found in jan26_students
          const { data, error } = await supabase
            .from("jan26_c_students")
            .select("*, jan26_c_payment(*), jan26_c_engagements(*)")
            .eq("matric_no", matric_no)
            .single();
          if (error) return;
          setStudent(data);
          return;
        } 
        if (error) throw error;
        setStudent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    } 
    async function fetchStudent(matric_no: string) {
      try {
        for (const table of tables) {
          const { data, error } = await supabase
          .from(table.table)
          .select(table.select)
          .eq("matric_no", matric_no)
          .maybeSingle();
          if (error) continue;
          setStudentData(data);
          return;

        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudent(matric_no);
  }, [matric_no]);
  */

  useEffect(() => {
    async function fetchStudent() {
      setLoading(true);
      try {
        let foundData: Students | null = null;

        for (const table of tables) {
          const { data, error } = await supabase
            .from(table.table)
            .select(table.select)
            .eq("matric_no", matric_no)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            foundData = data as unknown as Students;
            break; // Stop searching once we find the student
          }
        }
        if (foundData) {
          setStudent(foundData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, [matric_no]);

  //etStudent([].find((s: Students) => s.matric_no === matric_no) ?? null);

  //const [comments, setComments] = useState<Comments[] | null>(null);

  /*   useEffect(() => {
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
  }, [student]); */

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!student) return <div>No student found</div>;

  return (
    <main className="container mx-auto relative">
      {student?.jan26_payment && <StudentDetailsPage studentData={student} />}
      {student?.jan26_c_payment && (
        <StudentDetailsPageC studentData={student} />
      )}
      {student?.nov25_payment && (
        <StudentDetailsPageNov studentData={student} />
      )}
    </main>
  );
}
