import { createClient } from "@/lib/supabase/client";
import { studentColumns, Students } from "./studentColumns";
import DataTable from "./studentTable";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRightCircle, Inbox, MessageCircle, Phone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";

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
  const fob_data = data.filter((student) => student.faculty_code === "FOB");
  const feh_data = data.filter((student) => student.faculty_code === "FEH");
  const sit_data = data.filter((student) => student.faculty_code === "SIT");
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
        <h1 className="font-bold text-2xl mb-4">New Student List</h1>
        <DataTable columns={studentColumns} data={data} />
      </div>
      <div className="md:hidden flex flex-col gap-2 p-10">
        <h1 className="font-bold text-2xl mb-4 flex justify-between items-center">
          New Student List <Badge>Sept 2025</Badge>
        </h1>
        <p>
          UNITAR has {data.length} <span className="italic">active</span> new
          online students
        </p>
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
        {/* <p>
          This search bar below will filter the list of students for you by
          name, faculty and programme.
        </p> */}
        {/* Mobile view */}
        <div className="grid grid-cols-1 gap-4 py-10">
          {/*  <Input
            placeholder="Search by name, faculty or programme"
            className="col-span-1"
          /> */}
          <Tabs defaultValue="all" orientation="horizontal">
            <TabsList className="w-full">
              <TabsTrigger value="all"> ALL</TabsTrigger>
              <TabsTrigger value="fob"> FOB</TabsTrigger>
              <TabsTrigger value="feh"> FEH</TabsTrigger>
              <TabsTrigger value="sit"> SIT</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="flex flex-col gap-4">
              {dataMobile.map((student, index) => (
                <Card
                  key={student.matric_no}
                  className="w-full hover:shadow-lg transition-shadow grid grid-cols-[1fr_auto] gap-4"
                >
                  {/*  <CardHeader className="flex flex-col flex-nowrap gap-2">
                <CardTitle className="text-2xl font-bold">
                  {student.full_name}
                  <p className="text-sm font-normal">[ {student.matric_no} ]</p>
                </CardTitle>
              </CardHeader> */}
                  <CardContent>
                    <div className="flex flex-col gap-2 relative">
                      <p className="absolute -top-4 -left-4 italic text-sm text-slate-500">
                        {index + 1}
                      </p>
                      <p className="text-2xl font-bold">{student.full_name}</p>
                      <p className="text-sm font-normal">
                        [ {student.matric_no} ]
                      </p>
                      <div className="flex flex-row gap-2">
                        <Badge
                          className={`text-md  ${
                            student.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-700/30"
                              : "bg-red-200 text-red-700"
                          }`}
                          variant={
                            student.status === "Active"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {student.status === "Active" ? "Active" : "I"}
                        </Badge>
                        <Badge variant="default" className="text-md">
                          {student.programme_code}
                        </Badge>
                        <Badge variant="secondary" className="text-md">
                          {student.faculty_code}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full flex flex-col gap-3 justify-end">
                    <Link href={`tel:6${student.phone.replace(/[-]/g, "")}`}>
                      <Phone className="h-6 w-6 text-cyan-500" />
                    </Link>
                    <Link
                      href={`https://wa.me/6${student.phone.replace(
                        /[-]/g,
                        ""
                      )}`}
                    >
                      <MessageCircle className="h-6 w-6 text-green-500" />
                    </Link>
                    <Link href={`mailto:${student.email}`}>
                      <Inbox className="h-6 w-6 text-slate-500" />
                    </Link>
                    <Link href={`/protected/student/${student.matric_no}`}>
                      <ArrowRightCircle className="w-6 h-6 text-purple-500" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="fob" className="flex flex-col gap-4">
              {fob_data.map((student, index) => (
                <Card
                  key={student.matric_no}
                  className="w-full hover:shadow-lg transition-shadow grid grid-cols-[1fr_auto] gap-4"
                >
                  {/*  <CardHeader className="flex flex-col flex-nowrap gap-2">
                <CardTitle className="text-2xl font-bold">
                  {student.full_name}
                  <p className="text-sm font-normal">[ {student.matric_no} ]</p>
                </CardTitle>
              </CardHeader> */}
                  <CardContent>
                    <div className="flex flex-col gap-2 relative">
                      <p className="absolute -top-4 -left-4 italic text-sm text-slate-500">
                        {index + 1}
                      </p>
                      <p className="text-2xl font-bold">{student.full_name}</p>
                      <p className="text-sm font-normal">
                        [ {student.matric_no} ]
                      </p>
                      <div className="flex flex-row gap-2">
                        <Badge
                          className={`text-md  ${
                            student.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-700/30"
                              : "bg-red-200 text-red-700"
                          }`}
                          variant={
                            student.status === "Active"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {student.status === "Active" ? "Active" : "I"}
                        </Badge>
                        <Badge variant="default" className="text-md">
                          {student.programme_code}
                        </Badge>
                        <Badge variant="secondary" className="text-md">
                          {student.faculty_code}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full flex flex-col gap-3 justify-end">
                    <Link href={`tel:6${student.phone.replace(/[-]/g, "")}`}>
                      <Phone className="h-6 w-6 text-cyan-500 hover:text-cyan-700" />
                    </Link>
                    <Link
                      href={`https://wa.me/6${student.phone.replace(
                        /[-]/g,
                        ""
                      )}`}
                    >
                      <MessageCircle className="h-6 w-6 text-green-500" />
                    </Link>
                    <Link href={`mailto:${student.email}`}>
                      <Inbox className="h-6 w-6 text-slate-500" />
                    </Link>
                    <Link href={`/protected/student/${student.matric_no}`}>
                      <ArrowRightCircle className="w-6 h-6 text-purple-500" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="feh" className="flex flex-col gap-4">
              {feh_data.map((student, index) => (
                <Card
                  key={student.matric_no}
                  className="w-full hover:shadow-lg transition-shadow grid grid-cols-[1fr_auto] gap-4"
                >
                  {/*  <CardHeader className="flex flex-col flex-nowrap gap-2">
                <CardTitle className="text-2xl font-bold">
                  {student.full_name}
                  <p className="text-sm font-normal">[ {student.matric_no} ]</p>
                </CardTitle>
              </CardHeader> */}
                  <CardContent>
                    <div className="flex flex-col gap-2 relative">
                      <p className="absolute -top-4 -left-4 italic text-sm text-slate-500">
                        {index + 1}
                      </p>
                      <p className="text-2xl font-bold">{student.full_name}</p>
                      <p className="text-sm font-normal">
                        [ {student.matric_no} ]
                      </p>
                      <div className="flex flex-row gap-2">
                        <Badge
                          className={`text-md  ${
                            student.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-700/30"
                              : "bg-red-200 text-red-700"
                          }`}
                          variant={
                            student.status === "Active"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {student.status === "Active" ? "Active" : "I"}
                        </Badge>
                        <Badge variant="default" className="text-md">
                          {student.programme_code}
                        </Badge>
                        <Badge variant="secondary" className="text-md">
                          {student.faculty_code}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full flex flex-col gap-3 justify-end">
                    <Link href={`tel:6${student.phone.replace(/[-]/g, "")}`}>
                      <Phone className="h-6 w-6 text-cyan-500" />
                    </Link>
                    <Link
                      href={`https://wa.me/6${student.phone.replace(
                        /[-]/g,
                        ""
                      )}`}
                    >
                      <MessageCircle className="h-6 w-6 text-green-500" />
                    </Link>
                    <Link href={`mailto:${student.email}`}>
                      <Inbox className="h-6 w-6 text-slate-500" />
                    </Link>
                    <Link href={`/protected/student/${student.matric_no}`}>
                      <ArrowRightCircle className="w-6 h-6 text-purple-500" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="sit" className="flex flex-col gap-4">
              {sit_data.map((student, index) => (
                <Card
                  key={student.matric_no}
                  className="w-full hover:shadow-lg transition-shadow grid grid-cols-[1fr_auto] gap-4"
                >
                  {/*  <CardHeader className="flex flex-col flex-nowrap gap-2">
                <CardTitle className="text-2xl font-bold">
                  {student.full_name}
                  <p className="text-sm font-normal">[ {student.matric_no} ]</p>
                </CardTitle>
              </CardHeader> */}
                  <CardContent>
                    <div className="flex flex-col gap-2 relative">
                      <p className="absolute -top-4 -left-4 italic text-sm text-slate-500">
                        {index + 1}
                      </p>
                      <p className="text-2xl font-bold">{student.full_name}</p>
                      <p className="text-sm font-normal">
                        [ {student.matric_no} ]
                      </p>
                      <div className="flex flex-row gap-2">
                        <Badge
                          className={`text-md  ${
                            student.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-700/30"
                              : "bg-red-200 text-red-700"
                          }`}
                          variant={
                            student.status === "Active"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {student.status === "Active" ? "Active" : "I"}
                        </Badge>
                        <Badge variant="default" className="text-md">
                          {student.programme_code}
                        </Badge>
                        <Badge variant="secondary" className="text-md">
                          {student.faculty_code}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full flex flex-col gap-3 justify-end">
                    <Link href={`tel:6${student.phone.replace(/[-]/g, "")}`}>
                      <Phone className="h-6 w-6 text-cyan-500" />
                    </Link>
                    <Link
                      href={`https://wa.me/6${student.phone.replace(
                        /[-]/g,
                        ""
                      )}`}
                    >
                      <MessageCircle className="h-6 w-6 text-green-500" />
                    </Link>
                    <Link href={`mailto:${student.email}`}>
                      <Inbox className="h-6 w-6 text-slate-500" />
                    </Link>
                    <Link href={`/protected/student/${student.matric_no}`}>
                      <ArrowRightCircle className="w-6 h-6 text-purple-500" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
        {/*         <Button variant="outline">Load More</Button>
         */}{" "}
      </div>
    </div>
  );
}
