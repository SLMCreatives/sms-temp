"use client";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "./ui/card";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const supabase = createClient();

export function Hero() {
  const [studentCounts, setStudentCounts] = useState({
    fob: 0,
    feh: 0,
    sit: 0
  });

  useEffect(() => {
    async function fetchStudents() {
      const { data: students, error } = await supabase
        .from("students")
        .select("*");

      if (error) {
        console.log("Error fetching data:", error.message);
        return;
      }

      const fob_length = students.filter(
        (student) =>
          student.faculty_code === "FOB" && student.status === "Active"
      ).length;
      const feh_length = students.filter(
        (student) =>
          student.faculty_code === "FEH" && student.status === "Active"
      ).length;
      const sit_length = students.filter(
        (student) =>
          student.faculty_code === "SIT" && student.status === "Active"
      ).length;

      setStudentCounts({
        fob: fob_length,
        feh: feh_length,
        sit: sit_length
      });
    }

    fetchStudents();
  }, []);
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex flex-col gap-4 justify-center items-center text-center text-balance">
        <p className="text-3xl font-bold">Are We Ready For C3?</p>
        <p>
          We have enrolled a total of{" "}
          <span className="font-bold text-lg">
            {studentCounts.fob + studentCounts.feh + studentCounts.sit}{" "}
          </span>
          online students.
        </p>
        <div className="flex flex-row gap-4 items-center">
          <Card>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-xl font-normal">FOB</p>
                <p className="text-4xl font-bold">{studentCounts.fob}</p>
                <p>online students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-xl font-normal">FEH</p>
                <p className="text-4xl font-bold">{studentCounts.feh}</p>
                <p>online students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-xl font-normal">SIT</p>
                <p className="text-4xl font-bold">{studentCounts.sit}</p>
                <p>online students</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Button variant={"default"} className="text-md mt-4" asChild>
          <Link href="/student">Student List</Link>
        </Button>
        <Button
          variant={"link"}
          className="text-sm font-thin -mt-4 italic"
          asChild
        >
          <Link href="/auth/sign-up">Let&apos;s Get Started</Link>
        </Button>
      </div>

      {/* Appreciation */}
      <section className=" rounded-2xl border bg-gray-50 p-6">
        <h2 className="text-xl font-semibold">A Note of Thanks</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Thank you for your dedication and hard work in guiding our students.
          Your outreach — whether through calls, WhatsApp messages, or check-ins
          — plays a vital role in keeping students engaged and motivated. This
          dashboard is built to make your efforts easier and more impactful.
        </p>
      </section>

      {/* Confidentiality */}
      <section className=" rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="text-xl font-semibold text-amber-800">
          Confidentiality Reminder
        </h2>
        <p className="mt-3 text-amber-900 leading-relaxed">
          This dashboard contains{" "}
          <strong>private and sensitive student information</strong>. Please do
          not share login access, screenshots, or data with anyone outside the
          faculty.
        </p>
        <q className="mt-4 text-amber-900 leading-relaxed">
          Protecting our students&apos; privacy is a shared responsibility —
          thank you for safeguarding their information.
        </q>
      </section>

      {/* Quick guidance */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Getting Started</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
          <li>Browse the student list to see LMS engagement details.</li>
          <li>Use the call or WhatsApp buttons to reach out directly.</li>
          <li>Log your outreach so we can track progress together.</li>
          <li>
            Aim for <strong>3 touches in 3 weeks</strong> for each student.
          </li>
        </ul>
      </section>
    </div>
  );
}
