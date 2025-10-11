"use client";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  course_id: string;
  course_name: string;
  course_number: string;
  start_date: string;
  end_date?: string | null;
};
type ApiResp = { data?: Course[]; errs?: unknown };

export default function CoursesPage() {
  const [items, setItems] = useState<Course[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(
      `/student/cn/api/cn/courses2?limit=10&offset=${offset}`
    );
    const json: ApiResp = await res.json();
    setLoading(false);
    if (json.data) setItems(json.data);
    else {
      console.log(json.errs);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">CN Courses</h1>
      <div className="rounded-xl border p-4">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="py-2">Course Name</th>
              <th className="py-2">Course #</th>
              <th className="py-2">Start</th>
              <th className="py-2">End</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-2">{c.course_name}</td>
                <td className="py-2">{c.course_number}</td>
                <td className="py-2">
                  {new Date(c.start_date).toLocaleString()}
                </td>
                <td className="py-2">
                  {c.end_date ? new Date(c.end_date).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex gap-2 mt-4">
          <button
            className="px-3 py-2 rounded-lg border"
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - 10))}
          >
            Prev
          </button>
          <button
            className="px-3 py-2 rounded-lg border"
            disabled={loading || items.length < 10}
            onClick={() => setOffset(offset + 10)}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
