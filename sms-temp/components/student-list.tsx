import {
  Phone,
  MessageCircle,
  Mail,
  ArrowUpCircle,
  ArrowRightCircle,
  AlertCircle
} from "lucide-react";
import { Label } from "./ui/label";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle } from "./ui/drawer";
import { Input } from "./ui/input";
import Link from "next/link";
import { LMSActivity, Students } from "@/app/student/studentColumns";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface StudentCardProps {
  student: Students;
  lms_activity: LMSActivity;
  index: number;
}

export function StudentList({
  student,
  lms_activity,
  index
}: StudentCardProps) {
  return (
    <Card
      key={student.matric_no}
      className="w-full hover:shadow-lg transition-shadow grid grid-cols-[1fr_50px] gap-0 py-2"
    >
      <CardContent className="w-full pl-2">
        <div className="flex flex-col gap-2 px-0">
          <p className="text-md font-normal line-clamp-1 capitalize">
            <span className="font-thin">{index + 1}.</span> {student.full_name}
          </p>
        </div>
      </CardContent>
      <CardFooter className="w-full flex flex-row gap-2 justify-end h-full">
        {lms_activity && lms_activity.course_progress < 0.1 ? (
          <Tooltip>
            <TooltipTrigger>
              <AlertCircle className="min-w-6 min-h-6 text-red-500" />
            </TooltipTrigger>
            <TooltipContent>less than 10% CP</TooltipContent>
          </Tooltip>
        ) : null}{" "}
        <Drawer>
          <DrawerTrigger asChild>
            <ArrowUpCircle className="min-w-6 min-h-6 text-purple-500" />
          </DrawerTrigger>
          <DrawerContent className="w-full min-h-full lg:max-w-2xl mx-auto overflow-scroll ring">
            <div className="w-full mx-auto p-8 flex flex-col gap-2 overflow-visible min-h-full">
              <DrawerTitle className="w-full flex flex-row justify-between py-6">
                {student.matric_no}
                <div className="flex flex-row gap-4">
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
                </div>
              </DrawerTitle>
              <p className="text-2xl font-bold line-clamp-2 ">
                {student.full_name}
              </p>
              <div className="grid grid-cols-[120px_1fr] gap-2 gap-x-3 py-2 w-full">
                <Label
                  htmlFor="programme_code"
                  className="text-xs italic text-slate-500"
                >
                  Programme Name
                </Label>
                <Input
                  name="programme_code"
                  readOnly
                  value={student.programme_name}
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
                {student.lms_activity && (
                  <>
                    <p className="text-md font-bold col-span-2">CN Activity</p>
                    <Label
                      htmlFor="lms_activity"
                      className="text-xs italic text-slate-500"
                    >
                      SRB Progress
                    </Label>
                    <Input
                      name="lms_activity"
                      readOnly
                      value={student.lms_activity.srb_progress + "%"}
                      className={`w-full ${
                        student.lms_activity.srb_progress === 0
                          ? "text-red-500 font-bold"
                          : ""
                      }`}
                    />
                    <Label
                      htmlFor="lms_activity"
                      className="text-xs italic text-slate-500"
                    >
                      Course Progress
                    </Label>
                    <Input
                      name="lms_activity"
                      readOnly
                      value={student.lms_activity.course_progress + "%"}
                      className={`w-full ${
                        student.lms_activity.course_progress < 0.1
                          ? "text-red-500 font-bold"
                          : ""
                      }`}
                    />
                  </>
                )}
              </div>

              {/* <div className="flex flex-row gap-2 justify-between w-full py-8 group hover:cursor-pointer">
                <p className="text-md group-hover:font-bold">Contact Student</p>
                <div className="flex flex-row gap-4">
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
                </div>
              </div> */}

              <div className="flex flex-row gap-2 justify-between w-full py-8 group hover:cursor-pointer">
                <p className="text-md group-hover:font-bold">
                  View Student Page & Add Engagement
                </p>
                <div className="flex flex-row gap-2">
                  <Link href={`/student/${student.matric_no}`}>
                    <ArrowRightCircle className="w-6 h-6 text-orange-500 group-hover:text-orange-600" />
                  </Link>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </CardFooter>
    </Card>
  );
}
