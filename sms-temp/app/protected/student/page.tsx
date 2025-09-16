import { createClient } from "@/lib/supabase/client";
import { studentColumns, Students } from "./studentColumns";
import DataTable from "./studentTable";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightCircle,
  ArrowUpCircle,
  Mail,
  MessageCircle,
  Phone
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const dataMobile = data.slice(0, 50); // Limit to first 20 records for mobile view
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
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <p className="italic text-xs text-slate-500 ">
                        {index + 1} - {student.matric_no}
                      </p>
                      <p className="text-xl font-bold line-clamp-2">
                        {student.full_name}
                      </p>

                      <div className="flex flex-row flex-wrap gap-2">
                        <Badge
                          className={`text-sm  ${
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

                        <Badge variant="default" className="text-sm">
                          {student.faculty_code} - {student.programme_code}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          {student.study_level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full flex flex-col gap-3 justify-end items-between h-full">
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
                      <Mail className="h-6 w-6 text-slate-500" />
                    </Link>
                    {/*  <Link href={`/protected/student/${student.matric_no}`}>
                      <ArrowUpCircle className="w-6 h-6 text-purple-500" />
                    </Link> */}
                    <Drawer>
                      <DrawerTrigger asChild>
                        <ArrowUpCircle className="w-6 h-6 text-purple-500" />
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="w-full mx-auto min-h-screen p-8 flex flex-col gap-2">
                          <DrawerTitle>Student Name</DrawerTitle>
                          <p className="text-3xl font-bold line-clamp-2">
                            {student.full_name}
                          </p>
                          <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                            <p className="text-md font-bold col-span-2">
                              Student Details
                            </p>
                            <Label
                              htmlFor="matric_no"
                              className="text-xs italic text-slate-500"
                            >
                              Matric No
                            </Label>
                            <Input
                              name="matric_no"
                              readOnly
                              value={student.matric_no}
                            />
                            <Label
                              htmlFor="email"
                              className="text-xs italic text-slate-500"
                            >
                              Email
                            </Label>
                            <Input
                              name="email"
                              readOnly
                              value={student.email.toLocaleLowerCase()}
                            />
                            <Label
                              htmlFor="phone"
                              className="text-xs italic text-slate-500"
                            >
                              Phone No.
                            </Label>
                            <Input
                              name="phone"
                              readOnly
                              value={student.phone}
                            />
                            <Label
                              htmlFor="nationality"
                              className="text-xs italic text-slate-500"
                            >
                              Nationality
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.nationality}
                            />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                            <p className="text-md font-bold col-span-2">
                              Programme Details
                            </p>
                            <Label
                              htmlFor="programme_code"
                              className="text-xs italic text-slate-500"
                            >
                              Programme Name
                            </Label>
                            <Input
                              name="programme_code"
                              readOnly
                              value={student.programme_code}
                            />
                            <Label
                              htmlFor="study_level"
                              className="text-xs italic text-slate-500"
                            >
                              Study Level
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.study_level}
                            />
                            <Label
                              htmlFor="study_mode"
                              className="text-xs italic text-slate-500"
                            >
                              Study Mode
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.study_mode}
                            />
                          </div>
                          <div className="flex flex-row gap-2 justify-between w-full py-8">
                            <p className="text-md font-bold">Actions</p>
                            <Link
                              href={`tel:6${student.phone.replace(/[-]/g, "")}`}
                            >
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
                              <Mail className="h-6 w-6 text-slate-500" />
                            </Link>
                            <Link
                              href={`/protected/student/${student.matric_no}`}
                            >
                              <ArrowRightCircle className="w-6 h-6 text-orange-500" />
                            </Link>
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>
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
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <p className="italic text-xs text-slate-500 ">
                        {index + 1} - {student.matric_no}
                      </p>
                      <p className="text-xl font-bold line-clamp-2">
                        {student.full_name}
                      </p>

                      <div className="flex flex-row flex-wrap gap-2">
                        <Badge
                          className={`text-sm  ${
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

                        <Badge variant="default" className="text-sm">
                          {student.faculty_code} - {student.programme_code}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          {student.study_level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full flex flex-col gap-3 justify-end items-between h-full">
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
                      <Mail className="h-6 w-6 text-slate-500" />
                    </Link>
                    {/*  <Link href={`/protected/student/${student.matric_no}`}>
                      <ArrowUpCircle className="w-6 h-6 text-purple-500" />
                    </Link> */}
                    <Drawer>
                      <DrawerTrigger asChild>
                        <ArrowUpCircle className="w-6 h-6 text-purple-500" />
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="w-full mx-auto min-h-screen p-8 flex flex-col gap-2">
                          <DrawerTitle>Student Name</DrawerTitle>
                          <p className="text-3xl font-bold line-clamp-2">
                            {student.full_name}
                          </p>
                          <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                            <p className="text-md font-bold col-span-2">
                              Student Details
                            </p>
                            <Label
                              htmlFor="matric_no"
                              className="text-xs italic text-slate-500"
                            >
                              Matric No
                            </Label>
                            <Input
                              name="matric_no"
                              readOnly
                              value={student.matric_no}
                            />
                            <Label
                              htmlFor="email"
                              className="text-xs italic text-slate-500"
                            >
                              Email
                            </Label>
                            <Input
                              name="email"
                              readOnly
                              value={student.email.toLocaleLowerCase()}
                            />
                            <Label
                              htmlFor="phone"
                              className="text-xs italic text-slate-500"
                            >
                              Phone No.
                            </Label>
                            <Input
                              name="phone"
                              readOnly
                              value={student.phone}
                            />
                            <Label
                              htmlFor="nationality"
                              className="text-xs italic text-slate-500"
                            >
                              Nationality
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.nationality}
                            />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                            <p className="text-md font-bold col-span-2">
                              Programme Details
                            </p>
                            <Label
                              htmlFor="programme_code"
                              className="text-xs italic text-slate-500"
                            >
                              Programme Name
                            </Label>
                            <Input
                              name="programme_code"
                              readOnly
                              value={student.programme_code}
                            />
                            <Label
                              htmlFor="study_level"
                              className="text-xs italic text-slate-500"
                            >
                              Study Level
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.study_level}
                            />
                            <Label
                              htmlFor="study_mode"
                              className="text-xs italic text-slate-500"
                            >
                              Study Mode
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.study_mode}
                            />
                          </div>
                          <div className="flex flex-row gap-2 justify-between w-full py-8">
                            <p className="text-md font-bold">Actions</p>
                            <Link
                              href={`tel:6${student.phone.replace(/[-]/g, "")}`}
                            >
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
                              <Mail className="h-6 w-6 text-slate-500" />
                            </Link>
                            <Link
                              href={`/protected/student/${student.matric_no}`}
                            >
                              <ArrowRightCircle className="w-6 h-6 text-orange-500" />
                            </Link>
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>
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
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <p className="italic text-xs text-slate-500 ">
                        {index + 1} - {student.matric_no}
                      </p>
                      <p className="text-xl font-bold line-clamp-2">
                        {student.full_name}
                      </p>

                      <div className="flex flex-row flex-wrap gap-2">
                        <Badge
                          className={`text-sm  ${
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

                        <Badge variant="default" className="text-sm">
                          {student.faculty_code} - {student.programme_code}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          {student.study_level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full flex flex-col gap-3 justify-end items-between h-full">
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
                      <Mail className="h-6 w-6 text-slate-500" />
                    </Link>
                    {/*  <Link href={`/protected/student/${student.matric_no}`}>
                      <ArrowUpCircle className="w-6 h-6 text-purple-500" />
                    </Link> */}
                    <Drawer>
                      <DrawerTrigger asChild>
                        <ArrowUpCircle className="w-6 h-6 text-purple-500" />
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="w-full mx-auto min-h-screen p-8 flex flex-col gap-2">
                          <DrawerTitle>Student Name</DrawerTitle>
                          <p className="text-3xl font-bold line-clamp-2">
                            {student.full_name}
                          </p>
                          <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                            <p className="text-md font-bold col-span-2">
                              Student Details
                            </p>
                            <Label
                              htmlFor="matric_no"
                              className="text-xs italic text-slate-500"
                            >
                              Matric No
                            </Label>
                            <Input
                              name="matric_no"
                              readOnly
                              value={student.matric_no}
                            />
                            <Label
                              htmlFor="email"
                              className="text-xs italic text-slate-500"
                            >
                              Email
                            </Label>
                            <Input
                              name="email"
                              readOnly
                              value={student.email.toLocaleLowerCase()}
                            />
                            <Label
                              htmlFor="phone"
                              className="text-xs italic text-slate-500"
                            >
                              Phone No.
                            </Label>
                            <Input
                              name="phone"
                              readOnly
                              value={student.phone}
                            />
                            <Label
                              htmlFor="nationality"
                              className="text-xs italic text-slate-500"
                            >
                              Nationality
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.nationality}
                            />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                            <p className="text-md font-bold col-span-2">
                              Programme Details
                            </p>
                            <Label
                              htmlFor="programme_code"
                              className="text-xs italic text-slate-500"
                            >
                              Programme Name
                            </Label>
                            <Input
                              name="programme_code"
                              readOnly
                              value={student.programme_code}
                            />
                            <Label
                              htmlFor="study_level"
                              className="text-xs italic text-slate-500"
                            >
                              Study Level
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.study_level}
                            />
                            <Label
                              htmlFor="study_mode"
                              className="text-xs italic text-slate-500"
                            >
                              Study Mode
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.study_mode}
                            />
                          </div>
                          <div className="flex flex-row gap-2 justify-between w-full py-8">
                            <p className="text-md font-bold">Actions</p>
                            <Link
                              href={`tel:6${student.phone.replace(/[-]/g, "")}`}
                            >
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
                              <Mail className="h-6 w-6 text-slate-500" />
                            </Link>
                            <Link
                              href={`/protected/student/${student.matric_no}`}
                            >
                              <ArrowRightCircle className="w-6 h-6 text-orange-500" />
                            </Link>
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>
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
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <p className="italic text-xs text-slate-500 ">
                        {index + 1} - {student.matric_no}
                      </p>
                      <p className="text-xl font-bold line-clamp-2">
                        {student.full_name}
                      </p>

                      <div className="flex flex-row flex-wrap gap-2">
                        <Badge
                          className={`text-sm  ${
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

                        <Badge variant="default" className="text-sm">
                          {student.faculty_code} - {student.programme_code}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          {student.study_level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full flex flex-col gap-3 justify-end items-between h-full">
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
                      <Mail className="h-6 w-6 text-slate-500" />
                    </Link>
                    {/*  <Link href={`/protected/student/${student.matric_no}`}>
                      <ArrowUpCircle className="w-6 h-6 text-purple-500" />
                    </Link> */}
                    <Drawer>
                      <DrawerTrigger asChild>
                        <ArrowUpCircle className="w-6 h-6 text-purple-500" />
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="w-full mx-auto min-h-screen p-8 flex flex-col gap-2">
                          <DrawerTitle>Student Name</DrawerTitle>
                          <p className="text-3xl font-bold line-clamp-2">
                            {student.full_name}
                          </p>
                          <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                            <p className="text-md font-bold col-span-2">
                              Student Details
                            </p>
                            <Label
                              htmlFor="matric_no"
                              className="text-xs italic text-slate-500"
                            >
                              Matric No
                            </Label>
                            <Input
                              name="matric_no"
                              readOnly
                              value={student.matric_no}
                            />
                            <Label
                              htmlFor="email"
                              className="text-xs italic text-slate-500"
                            >
                              Email
                            </Label>
                            <Input
                              name="email"
                              readOnly
                              value={student.email.toLocaleLowerCase()}
                            />
                            <Label
                              htmlFor="phone"
                              className="text-xs italic text-slate-500"
                            >
                              Phone No.
                            </Label>
                            <Input
                              name="phone"
                              readOnly
                              value={student.phone}
                            />
                            <Label
                              htmlFor="nationality"
                              className="text-xs italic text-slate-500"
                            >
                              Nationality
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.nationality}
                            />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                            <p className="text-md font-bold col-span-2">
                              Programme Details
                            </p>
                            <Label
                              htmlFor="programme_code"
                              className="text-xs italic text-slate-500"
                            >
                              Programme Name
                            </Label>
                            <Input
                              name="programme_code"
                              readOnly
                              value={student.programme_code}
                            />
                            <Label
                              htmlFor="study_level"
                              className="text-xs italic text-slate-500"
                            >
                              Study Level
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.study_level}
                            />
                            <Label
                              htmlFor="study_mode"
                              className="text-xs italic text-slate-500"
                            >
                              Study Mode
                            </Label>
                            <Input
                              name="nationality"
                              readOnly
                              value={student.study_mode}
                            />
                          </div>
                          <div className="flex flex-row gap-2 justify-between w-full py-8">
                            <p className="text-md font-bold">Actions</p>
                            <Link
                              href={`tel:6${student.phone.replace(/[-]/g, "")}`}
                            >
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
                              <Mail className="h-6 w-6 text-slate-500" />
                            </Link>
                            <Link
                              href={`/protected/student/${student.matric_no}`}
                            >
                              <ArrowRightCircle className="w-6 h-6 text-orange-500" />
                            </Link>
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>
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
