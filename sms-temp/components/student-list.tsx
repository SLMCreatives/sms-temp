import {
  Phone,
  MessageCircle,
  Mail,
  ArrowUpCircle,
  ArrowRightCircle
} from "lucide-react";
import { Label } from "./ui/label";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle } from "./ui/drawer";
import { Input } from "./ui/input";
import Link from "next/link";
import { Students } from "@/app/student/studentColumns";

interface StudentCardProps {
  student: Students;
  index: number;
}

export function StudentList({ student, index }: StudentCardProps) {
  return (
    <Card
      key={student.matric_no}
      className="w-full hover:shadow-lg transition-shadow grid grid-cols-[1fr_50px] gap-0 py-2"
    >
      <CardContent className="w-full pl-2">
        <div className="flex flex-col gap-2 px-0">
          {/* <p className="italic text-xs text-slate-500 ">
            {index + 1} - {student.programme_code}
          </p> */}
          <p className="text-md font-normal line-clamp-1 capitalize">
            <span className="font-thin">{index + 1}.</span>{" "}
            {student.full_name.toLocaleLowerCase()}
          </p>
        </div>
      </CardContent>
      <CardFooter className="w-full flex flex-col gap-3 justify-end items-between h-full">
        <Drawer>
          <DrawerTrigger asChild>
            <ArrowUpCircle className="w-6 h-6 text-purple-500" />
          </DrawerTrigger>
          <DrawerContent className="w-full lg:max-w-2xl mx-auto">
            <div className="w-full mx-auto min-h-screen p-8 flex flex-col gap-2">
              <DrawerTitle>Student Name</DrawerTitle>
              <p className="text-3xl font-bold line-clamp-2">
                {student.full_name}
              </p>
              <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                <p className="text-md font-bold col-span-2">Student Details</p>
                <Label
                  htmlFor="matric_no"
                  className="text-xs italic text-slate-500"
                >
                  Matric No
                </Label>
                <Input name="matric_no" readOnly value={student.matric_no} />
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
                <Input name="phone" readOnly value={student.phone} />
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
                <Input name="nationality" readOnly value={student.study_mode} />
              </div>
              <div className="flex flex-row gap-2 justify-between w-full py-8">
                <p className="text-md font-bold">Actions</p>
                <Link href={`tel:6${student.phone.replace(/[-]/g, "")}`}>
                  <Phone className="h-6 w-6 text-cyan-500" />
                </Link>
                <Link
                  href={`https://wa.me/6${student.phone.replace(/[-]/g, "")}`}
                >
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </Link>
                <Link href={`mailto:${student.email}`}>
                  <Mail className="h-6 w-6 text-slate-500" />
                </Link>
                <Link href={`/student/${student.matric_no}`}>
                  <ArrowRightCircle className="w-6 h-6 text-orange-500" />
                </Link>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </CardFooter>
    </Card>
  );
}
