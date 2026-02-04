/* eslint-disable @typescript-eslint/no-unused-vars */
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
  const [currentSstId] = useState<number>(1);

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

    if (!error) setTasks(tasks.filter((t) => t.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Tasks</h1>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between border border-gray-200"
            >
              <div>
                <button
                  onClick={() => openProfile(task.jan26_students.matric_no)}
                  className="text-lg font-semibold text-blue-600 hover:underline text-left"
                >
                  {task.jan26_students.full_name}
                </button>
                <p className="text-sm text-gray-500">
                  Week {task.week_number}: {task.task_type.replace("_", " ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => markComplete(task.id)}
                  className="text-sm bg-gray-100 px-3 py-1 rounded"
                >
                  Done
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- STUDENT PROFILE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedStudent(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            {!selectedStudent ? (
              <p className="text-center py-10">Loading profile...</p>
            ) : (
              <div>
                <h2 className="text-2xl font-bold border-b pb-2">
                  {selectedStudent.full_name}
                </h2>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                  <div>
                    <p className="text-gray-500">Matric No</p>
                    <p className="font-medium">{selectedStudent.matric_no}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Programme</p>
                    <p className="font-medium">
                      {selectedStudent.programme_name}
                    </p>
                  </div>
                </div>

                {/* LMS ACTIVITY CARD */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-6">
                  <h3 className="text-blue-800 font-bold text-sm uppercase mb-3">
                    LMS Activity Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-xs text-blue-600">Last Login</p>
                      <p className="font-semibold">
                        {selectedStudent.jan26_lms_activity?.last_login_at
                          ? new Date(
                              selectedStudent.jan26_lms_activity.last_login_at
                            ).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Course Progress</p>
                      <p className="font-semibold text-lg">
                        {selectedStudent.jan26_lms_activity?.course_progress *
                          100 || 0}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Assignments</p>
                      <p className="font-semibold">
                        {selectedStudent.jan26_lms_activity
                          ?.submitted_assignments || 0}{" "}
                        Submitted
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Total Visits</p>
                      <p className="font-semibold">
                        {selectedStudent.jan26_lms_activity?.course_visits || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href={`https://wa.me/6${selectedStudent.phone.replace(/[-]/g, "")}`}
                    target="_blank"
                    className="w-full bg-green-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-green-600 transition"
                  >
                    Start WhatsApp Chat
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
