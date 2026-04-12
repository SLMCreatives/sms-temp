/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
  BookOpen,
  CreditCard,
  Calendar,
  ExternalLink,
  HeartPulse,
  MessageSquare,
  User,
  TrendingUp
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  RadialBar,
  RadialBarChart,
  CartesianGrid,
  ReferenceLine
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent
} from "@/components/ui/chart";

// --- Mock Data ---
const performanceData = [
  { semester: "Sem 1", gpa: 3 },
  { semester: "Sem 2", gpa: 3.5 },
  { semester: "Sem 3", gpa: 3.85 },
  { semester: "Sem 4", gpa: 0 },
  { semester: "Sem 5", gpa: 0 },
  { semester: "Sem 6", gpa: 0 },
  { semester: "Sem 7", gpa: 0 },
  { semester: "Sem 8", gpa: 0 }
];

const student = [
  {
    matric_no: "A1234567X",
    full_name: "SITI AMALINA BINTI MOHD ALWEE",
    programme: "Bachelor of Information Technology (Honours) - Online",
    admission_date: "2025-01-19",
    intake_code: "JAN2025",
    current_semester: 4
  }
];

//const healthScoreData = [{ score: 92, fill: "hsl(var(--chart-2))" }];

const courses = [
  {
    id: "BIT302",
    name: "Advanced Web Frameworks",
    lecturer: "Dr. Aris Munandar",
    monitor: "Sarah Lee",
    time: "Tue 8:00 PM"
  },
  {
    id: "MAT105",
    name: "Discrete Mathematics",
    lecturer: "Prof. Siti Aminah",
    monitor: "Ahmad Razak",
    time: "Thu 8:30 PM"
  },
  {
    id: "SYS401",
    name: "Cloud Infrastructure",
    lecturer: "Mr. Kevin Low",
    monitor: "Julian Yeoh",
    time: "Sat 10:00 AM"
  }
];

const chartConfig = {
  gpa: { label: "GPA", color: "hsl(var(--chart-1))" },
  score: { label: "Health Score", color: "hsl(var(--chart-2))" }
} satisfies ChartConfig;

export default function StudentDashboard() {
  const admission_date = student[0]?.admission_date;

  const currentWeek = Math.ceil(
    (new Date().getTime() - new Date(admission_date).getTime()) /
      (1000 * 60 * 60 * 24 * 7)
  );

  const currentSemester = Math.ceil(currentWeek / 14);

  const IntakeNamer = (intakeCode: string) => {
    // Input string
    const inputDate = intakeCode; // Example: "JAN2026"

    // 1. Parse "JAN2026" (month name + year) to a Date object
    // We add "1" to make it a valid date "1 JAN 2026"
    const date = new Date(inputDate.replace(/([A-Za-z]+)(\d+)/, "$1 1 $2"));

    // 2. Subtract one year
    date.setFullYear(date.getFullYear());

    // 3. Format back to "Jan 2025"
    const result = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
    return result;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 -mt-24 md:mt-0">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sr-only">
            Student Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 italic">Welcome back!</p>
          <p className="text-muted-foreground mt-1 text-5xl font-bold tracking-wide font-serif">
            {student[0]?.full_name}
          </p>
        </div>
        <div className="flex flex-row items-center justify-start gap-x-2">
          <Badge
            variant="outline"
            className="w-fit px-4 py-1  text-sm shadow-sm"
          >
            {student[0]?.intake_code
              ? IntakeNamer(student[0].intake_code)
              : "Intake Code Unavailable"}
          </Badge>
          <Badge
            variant="outline"
            className="w-fit px-4 py-1 text-sm shadow-sm "
          >
            Week 12 / 14
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- SECTION 1: ADMISSION & HEALTH --- */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Admission Details
            </CardTitle>
            <User className="h-5 w-5 " />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm ">Status</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-sm font-bold flex items-center gap-1 px-2">
                Active Enrolled
              </Badge>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm">Payment</span>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Paid in Full</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs uppercase font-bold mb-1">Programme</p>
              <p className="text-sm font-medium">{student[0]?.programme}</p>
            </div>
          </CardContent>
          {/*  <CardFooter className="bg-slate-50/80 dark:bg-slate-800 mt-2 flex flex-col items-center py-4 rounded-lg">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  data={healthScoreData}
                >
                  <RadialBar dataKey="score" cornerRadius={10} fill="#4F46E5" />
                  <text
                    x="50%"
                    y="80%"
                    textAnchor="middle"
                    className="fill-slate-900 dark:fill-slate-50 font-bold text-xl"
                  >
                    92%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-[-20px] flex items-center gap-1">
              <HeartPulse className="h-3 w-3 text-rose-500" /> Student Health
              Score
            </p>
          </CardFooter> */}
        </Card>

        {/* --- SECTION 2: ACADEMIC PROGRESS --- */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" /> Academic
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-[200px] w-full -ml-5"
            >
              <BarChart data={performanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e0e0e0"
                />
                <XAxis
                  dataKey="semester"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 4]}
                />
                <ReferenceLine
                  x={"Sem" + " " + (currentSemester - 1)}
                  stroke="#888888"
                  strokeWidth={4}
                  height={2}
                  label={{
                    value: "Current Semester",
                    position: "insideTopLeft",
                    fill: "#888888",
                    fontSize: 10,
                    fontStyle: "italic"
                  }}
                  strokeDasharray="3 3"
                  className="pointer-events-none"
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="gpa"
                  fill="var(--color-gpa)"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current CGPA
              </p>
              <p className="text-xl font-bold">3.85</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Credits Earned
              </p>
              <p className="text-xl font-bold">8 / 40</p>
            </div>
            <Button variant="ghost" size="sm" className="text-indigo-600">
              View Study Plan
            </Button>
          </CardFooter>
        </Card>

        {/* --- SECTION 3: COURSE DETAILS (MOBILE FIRST TABLE) --- */}
        <Card className="md:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Active Semester Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Lecturer
                  </TableHead>
                  <TableHead>Next Class</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-bold text-indigo-600">
                      {course.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{course.name}</div>
                      <div className="text-xs text-slate-400 md:hidden">
                        {course.lecturer}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">
                      {course.lecturer}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-normal flex items-center w-fit gap-1"
                      >
                        <Calendar className="h-3 w-3" /> {course.time}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        LMS
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* --- SECTION 4 & 5: LINKS & SUPPORT --- */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="justify-start gap-2 h-11">
                <BookOpen className="h-4 w-4" /> Go to LMS
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-11">
                <MessageSquare className="h-4 w-4" /> Support Tickets
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-11">
                <ExternalLink className="h-4 w-4" /> Admissions Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Student Support System</CardTitle>
              <CardDescription>
                We are here to help you succeed.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center hover:bg-slate-50 cursor-pointer transition-colors">
                <HeartPulse className="h-6 w-6 mx-auto mb-2 text-rose-500" />
                <span className="text-sm font-medium">Mental Health</span>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-slate-50 cursor-pointer transition-colors">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <span className="text-sm font-medium">Career Advice</span>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-slate-50 cursor-pointer transition-colors col-span-2 md:col-span-1">
                <User className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                <span className="text-sm font-medium">Peer Mentorship</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
