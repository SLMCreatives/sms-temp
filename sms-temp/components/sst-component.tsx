"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const supabase = createClient();

interface StudentWithEngagement {
  matric_no: string;
  full_name: string;
  sst_id: number | null;
  sst_name?: string;
  latest_outcome: string | null;
  latest_engagement_date: string | null;
}

interface KanbanColumn {
  outcome: string;
  students: StudentWithEngagement[];
  count: number;
}

interface SSTTeamMember {
  id: number;
  name: string;
}

// Outcome color mapping
const outcomeColors: Record<string, { bg: string; text: string; badge: string }> = {
  "No Response": {
    bg: "bg-slate-50",
    text: "text-slate-700",
    badge: "bg-slate-200 text-slate-800"
  },
  "No Issues": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    badge: "bg-emerald-200 text-emerald-800"
  },
  "Follow-up (RO)": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-200 text-blue-800"
  },
  "Follow-up (Sales)": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    badge: "bg-purple-200 text-purple-800"
  },
  Withdrawn: {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-200 text-red-800"
  },
  Deferred: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-200 text-amber-800"
  }
};

const outcomeOrder = [
  "No Response",
  "No Issues",
  "Follow-up (RO)",
  "Follow-up (Sales)",
  "Withdrawn",
  "Deferred"
];

export function SSTDashboard() {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sst_members, setSSTMembers] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch SST team members first
        const { data: sstData, error: sstError } = await supabase
          .from("jan26_sst_team")
          .select("id, name");

        if (sstError) throw sstError;

        const sstMap = new Map<number, string>();
        sstData?.forEach((member: SSTTeamMember) => {
          sstMap.set(member.id, member.name);
        });
        setSSTMembers(sstMap);

        // Fetch students with SST assignment
        const { data: studentsData, error: studentsError } = await supabase
          .from("jan26_students")
          .select("matric_no, full_name, sst_id")
          .not("sst_id", "is", null);

        if (studentsError) throw studentsError;

        // Fetch all engagements
        const { data: engagementsData, error: engagementsError } = await supabase
          .from("jan26_engagements")
          .select("matric_no, outcome, created_at")
          .order("created_at", { ascending: false });

        if (engagementsError) throw engagementsError;

        // Create a map of latest engagement per student
        const latestEngagementMap = new Map<
          string,
          { outcome: string; date: string }
        >();
        engagementsData?.forEach(
          (engagement: { matric_no: string; outcome: string; created_at: string }) => {
            if (!latestEngagementMap.has(engagement.matric_no)) {
              latestEngagementMap.set(engagement.matric_no, {
                outcome: engagement.outcome,
                date: engagement.created_at
              });
            }
          }
        );

        // Combine student and engagement data
        const studentsWithEngagement: StudentWithEngagement[] = studentsData?.map(
          (student: { matric_no: string; full_name: string; sst_id: number | null }) => {
            const engagement = latestEngagementMap.get(student.matric_no);
            return {
              ...student,
              sst_name: student.sst_id ? sstMap.get(student.sst_id) || "Unknown" : "Unassigned",
              latest_outcome: engagement?.outcome || "No Response",
              latest_engagement_date: engagement?.date || null
            };
          }
        ) || [];

        // Group by outcome
        const groupedByOutcome = new Map<string, StudentWithEngagement[]>();
        outcomeOrder.forEach((outcome) => {
          groupedByOutcome.set(outcome, []);
        });

        studentsWithEngagement.forEach((student) => {
          const outcome = student.latest_outcome || "No Response";
          if (groupedByOutcome.has(outcome)) {
            groupedByOutcome.get(outcome)?.push(student);
          } else {
            // If outcome not in predefined list, add it to "No Response"
            groupedByOutcome.get("No Response")?.push(student);
          }
        });

        // Create columns
        const kanbanColumns: KanbanColumn[] = outcomeOrder.map((outcome) => ({
          outcome,
          students: groupedByOutcome.get(outcome) || [],
          count: groupedByOutcome.get(outcome)?.length || 0
        }));

        setColumns(kanbanColumns);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error fetching SST dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  const totalStudents = columns.reduce((sum, col) => sum + col.count, 0);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">SST Dashboard</h1>
          <p className="text-slate-600 mb-4">
            Student engagement tracking by {sst_members.size} SST team members
          </p>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm text-slate-600">Total Students</p>
              <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm text-slate-600">SST Members</p>
              <p className="text-2xl font-bold text-slate-900">{sst_members.size}</p>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <div key={column.outcome} className="flex-shrink-0 w-96">
              {/* Column Header */}
              <div
                className={`p-4 rounded-t-lg border-t-4 ${
                  outcomeColors[column.outcome]?.bg
                } border-slate-300 bg-white`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-slate-900">{column.outcome}</h2>
                  <Badge className={outcomeColors[column.outcome]?.badge}>
                    {column.count}
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <div
                className={`rounded-b-lg p-4 min-h-96 max-h-96 overflow-y-auto border border-t-0 border-slate-200 ${
                  outcomeColors[column.outcome]?.bg
                }`}
              >
                {column.students.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm">
                    No students in this stage
                  </p>
                ) : (
                  <div className="space-y-3">
                    {column.students.map((student) => (
                      <StudentCard key={student.matric_no} student={student} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentCard({ student }: { student: StudentWithEngagement }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200">
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Student Name */}
          <p className="font-semibold text-slate-900 text-sm truncate">
            {student.full_name}
          </p>

          {/* Matric Number */}
          <p className="text-xs text-slate-500 font-mono">
            {student.matric_no}
          </p>

          {/* SST Member */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              <span className="font-medium">Assigned to:</span> {student.sst_name}
            </p>
          </div>

          {/* Status Badge */}
          <div className="pt-2">
            <Badge
              variant="secondary"
              className={`text-xs ${outcomeColors[student.latest_outcome || "No Response"]?.badge}`}
            >
              {student.latest_outcome || "No Response"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
