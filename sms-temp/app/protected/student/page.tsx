import { createClient } from "@/lib/supabase/client";
import { studentColumns, Students } from "./studentColumns";
import DataTable from "./studentTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRightCircle, Inbox, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase.from("students").select("*");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function DemoPage() {
  const data = await getData();
  const n_fob = data.filter((student) => student.faculty_code === "FOB").length;
  const n_feh = data.filter((student) => student.faculty_code === "FEH").length;
  const n_sit = data.filter((student) => student.faculty_code === "SIT").length;
  const dataMobile = data.slice(0, 20); // Limit to first 20 records for mobile view
  /* const statusFiltered = data.filter(
    (student) =>
      student.status === "Active" ||
      student.status === "Lost" ||
      student.status === "Withdrawn" ||
      student.status === "Deferred"
  ); */

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start">
      <div className="md:flex hidden flex-col gap-2 items-start">
        <h1 className="font-bold text-2xl mb-4">Student List</h1>
        <DataTable columns={studentColumns} data={data} />
      </div>
      <div className="md:hidden flex flex-col gap-2 p-10">
        <h1 className="font-bold text-2xl mb-4 flex justify-between items-center">
          Student Listing <Badge>Sept 2025</Badge>
        </h1>
        <p>There are currently {data.length} active online students. </p>
        <ul className="list-disc list-inside">
          <li>
            FoB has {n_fob} <span className="italic">active</span> students
          </li>
          <li>
            FEH has {n_feh} <span className="italic">active</span> students{" "}
          </li>
          <li>
            SIT has {n_sit} <span className="italic">active</span> students
          </li>
        </ul>
        <p>
          This search bar below will filter the list of students for you by
          name, faculty and programme.
        </p>
        {/* Mobile view */}
        <div className="grid grid-cols-1 gap-4 py-10">
          <Input
            placeholder="Search by name, faculty or programme"
            className="col-span-1"
          />
          {dataMobile.map((student, index) => (
            <Card
              key={student.matric_no}
              className="w-full hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row flex-nowrap gap-2">
                <div className="flex flex-col gap-1">
                  <p>#{index + 1}</p>
                  <CardTitle className="text-2xl font-bold">
                    {student.full_name}
                    <p className="text-sm font-normal">
                      [ {student.matric_no} ]
                    </p>
                  </CardTitle>
                </div>
                <CardDescription className="flex flex-row gap-2 justify-between">
                  <Badge
                    className={`text-md  ${
                      student.status === "Active"
                        ? "bg-green-100 text-green-700 border-green-700/30"
                        : "bg-red-200 text-red-700"
                    }`}
                    variant={
                      student.status === "Active" ? "outline" : "destructive"
                    }
                  >
                    {student.status === "Active" ? "A" : "I"}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2">
                    <Badge variant="default" className="text-md">
                      {student.programme_code}
                    </Badge>
                    <Badge variant="secondary" className="text-md">
                      {student.faculty_code}
                    </Badge>
                  </div>
                  {/*  <p className="text-sm">
                    <span className="font-semibold">Phone:</span>{" "}
                    {student.phone}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Email:</span>{" "}
                    {student.email}
                  </p> */}
                </div>
              </CardContent>
              <CardFooter className="w-full flex flex-row justify-between">
                <Link href={`tel:6${student.phone.replace(/[-]/g, "")}`}>
                  <Phone className="h-8 w-8 text-cyan-500" />
                </Link>
                <Link
                  href={`https://wa.me/6${student.phone.replace(/[-]/g, "")}`}
                >
                  <MessageCircle className="h-8 w-8 text-green-500" />
                </Link>
                <Link href={`mailto:${student.email}`}>
                  <Inbox className="h-8 w-8 text-slate-500" />
                </Link>
                <Link href={`/protected/student/${student.matric_no}`}>
                  <ArrowRightCircle className="w-8 h-8 text-purple-500" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  );
}
