/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function SSTMemberDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Replace with actual Auth session ID
  const [currentSstId] = useState<number>(2);

  useEffect(() => {
    fetchTasks();
  }, [currentSstId]);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jan26_sst_tasks")
      .select(
        `
        id, week_number, task_type, is_complete,
        jan26_students (matric_no, full_name, phone, email, programme_name)
      `
      )
      .eq("sst_id", currentSstId)
      .eq("is_complete", false);

    if (!error) setTasks(data || []);
    setLoading(false);
  };

  // NEW: Fetch full profile including LMS activity
  const openProfile = async (matricNo: string) => {
    setIsModalOpen(true);
    const { data, error } = await supabase
      .from("jan26_students")
      .select(
        `
        *,
        jan26_lms_activity (*)
      `
      )
      .eq("matric_no", matricNo)
      .single();

    if (!error) setSelectedStudent(data);
  };

  const markComplete = async (taskId: string) => {
    const { error } = await supabase
      .from("jan26_sst_tasks")
      .update({ is_complete: true })
      .eq("id", taskId);

    if (!error) {
      // Refresh tasks after marking complete
      fetchTasks();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SST Member Dashboard</h1>
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No pending tasks.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border p-4 rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Week {task.week_number}:</strong> {task.task_type}
                </p>
                <p>
                  Student: {task.jan26_students.full_name} (
                  {task.jan26_students.matric_no})
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => openProfile(task.jan26_students.matric_no)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  View Profile
                </button>
                <button
                  onClick={() => markComplete(task.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Mark Complete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Student Profile Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-3/4 max-h-full overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedStudent.full_name} ({selectedStudent.matric_no})
            </h2>
            <p>
              <strong>Email:</strong> {selectedStudent.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedStudent.phone}
            </p>
            <p>
              <strong>Programme:</strong> {selectedStudent.programme_name}
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">LMS Activity</h3>
            {selectedStudent.jan26_lms_activity.length === 0 ? (
              <p>No LMS activity data available.</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-2 py-1">Course</th>
                    <th className="border border-gray-300 px-2 py-1">Logins</th>
                    <th className="border border-gray-300 px-2 py-1">
                      Assignments Submitted
                    </th>
                    <th className="border border-gray-300 px-2 py-1">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.jan26_lms_activity.map((activity: any) => (
                    <tr key={activity.id}>
                      <td className="border border-gray-300 px-2 py-1">
                        {activity.course_name}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {activity.logins}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {activity.assignments_submitted}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {activity.last_active_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedStudent(null);
              }}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
