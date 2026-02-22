"use client";

import { use, useEffect, useState } from "react";

// Updated to match the fields in your API screenshot
interface CNUser {
  id: string;
  cn_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  user_id: string; // The client system primary key
}

interface Courses {
  id: string;
  course_id: string;
  course_name: string;
  course_number: string;
  start_date: string;
  end_date: string;
}

export default function CNStudentPage({
  params
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = use(params);
  const [student, setStudent] = useState<CNUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Courses[]>([]);

  useEffect(() => {
    async function fetchStudent() {
      setLoading(true);
      // This MUST match the folder path under /app/
      const res = await fetch(`/cn/api/cn/enrollments?user_id=${user_id}`);
      const json = await res.json();

      console.log(json);

      if (json.data) {
        setStudent(json.data);
        const res2 = await fetch(
          `/cn/api/cn/courses?user_id=${json.data.user_id}`
        );
        const json2 = await res2.json();
        if (json2.data) {
          setCourses(json2.data);
          console.log(json2.data);
        }
      }
      setLoading(false);
    }
    fetchStudent();
  }, [user_id]);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        Loading student data...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        Student not found
      </div>
    );
  }

  if (!courses) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        Courses not found
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-md border p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">User Profile</h2>
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {student.first_name} {student.last_name}
          </p>
          <p>
            <strong>CN Number:</strong> {student.cn_number}
          </p>
          <p>
            <strong>Email:</strong> {student.email}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="capitalize">{student.status}</span>
          </p>
          <p className="text-sm text-gray-500">System ID: {student.user_id}</p>
        </div>

        <h2 className="text-xl font-bold mt-6 mb-4">Enrolled Courses</h2>
        <div className="space-y-2">
          {!courses && <p>No enrolled courses found.</p>}
          {courses?.map((course) => (
            <div key={course.course_id}>
              <p>
                <strong>Course Name:</strong> {course.course_id}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
