import {
  Phone,
  MessageCircle,
  Mail,
  ArrowUpCircle,
  ArrowRightCircle,
  AlertCircle,
  CircleCheckBig,
  UserRoundX,
  BookX
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
      className={`w-full hover:shadow-lg transition-shadow grid grid-cols-[1fr_50px] gap-0 py-2 ${
        student.lms_activity?.last_login_at === null ||
        student.lms_activity?.course_progress <= 0.2
          ? "border-red-600 border-2"
          : ""
      }`}
    >
      <CardContent className="pl-2 overflow-hidden">
        <div className="flex flex-col gap-2 px-0">
          <p
            className={`text-sm text-nowrap font-normal overflow-hidden capitalize truncate min-w-[200px] ${
              student.lms_activity?.last_login_at === null ||
              student.lms_activity?.course_progress <= 0.2
                ? "text-red-500 font-bold"
                : ""
            }`}
          >
            <span className={`font-thin tracking-tighter  `}>{index + 1}.</span>{" "}
            {student.full_name.toLowerCase()}
          </p>
        </div>
      </CardContent>
      <CardFooter className="w-full flex flex-row gap-1 justify-end h-full">
        {lms_activity &&
        lms_activity.course_progress === 0 &&
        lms_activity.last_login_at === null ? (
          <Tooltip>
            <TooltipTrigger>
              <UserRoundX className="w-5 h-5 text-red-600" />
            </TooltipTrigger>
            <TooltipContent>Not Loged In</TooltipContent>
          </Tooltip>
        ) : null}{" "}
        {lms_activity && lms_activity.course_progress === 0 ? (
          <Tooltip>
            <TooltipTrigger>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </TooltipTrigger>
            <TooltipContent>0% Course Progress</TooltipContent>
          </Tooltip>
        ) : null}{" "}
        {lms_activity &&
        lms_activity.course_progress > 0 &&
        lms_activity.course_progress <= 0.2 ? (
          <Tooltip>
            <TooltipTrigger>
              <BookX className="w-5 h-5 text-red-600" />
            </TooltipTrigger>
            <TooltipContent>Less than 20% Course Progress</TooltipContent>
          </Tooltip>
        ) : null}{" "}
        {student.status === "Active" &&
        student.engagements.length > 0 &&
        student.engagements.some((item) => item.created_at > "2025-10-13") ? (
          <Tooltip>
            <TooltipTrigger>
              <CircleCheckBig className="w-5 h-5 text-green-500" />
            </TooltipTrigger>
            <TooltipContent>Engaged</TooltipContent>
          </Tooltip>
        ) : null}
        <Drawer>
          <DrawerTrigger asChild>
            <ArrowUpCircle
              className={`min-w-6 min-h-6  ${
                student.lms_activity?.last_login_at === null ||
                student.lms_activity?.course_progress <= 0.2
                  ? "text-red-600"
                  : "text-purple-500"
              }`}
            />
          </DrawerTrigger>
          <DrawerContent className="w-full min-h-full lg:max-w-2xl mx-auto overflow-scroll">
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
                <Label
                  htmlFor="status"
                  className="text-xs italic text-slate-500"
                >
                  Status
                </Label>
                <Input
                  name="status"
                  readOnly
                  value={student.status}
                  className={`w-full ${
                    student.status === "Active"
                      ? "text-green-500 font-bold"
                      : "text-red-500 font-bold"
                  }`}
                />

                <p className="text-md font-bold col-span-2">CN Activity</p>
                <Label
                  htmlFor="lms_activity"
                  className="text-xs italic text-slate-500"
                >
                  Course Progress
                </Label>
                <Input
                  name="lms_activity"
                  readOnly
                  value={
                    Math.round(
                      student.lms_activity
                        ? student.lms_activity.course_progress * 100
                        : 0
                    ) + "%"
                  } //student.lms_activity.course_progress * 100 + "%"}
                  className={`w-full ${
                    student.lms_activity &&
                    student.lms_activity.course_progress < 0.2
                      ? "text-red-500 font-bold"
                      : ""
                  }`}
                />
                <Label
                  htmlFor="engagement"
                  className="text-xs italic text-slate-500"
                >
                  Engagement
                </Label>
                <Input
                  name="engagement"
                  readOnly
                  value={
                    student.engagements && student.engagements.length >= 0
                      ? `${student.engagements.length}`
                      : "Not Engaged"
                  }
                  className={`w-full ${
                    student.engagements && student.engagements.length >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />

                {/*  <Label
                        htmlFor="engagement"
                        className="text-xs italic text-slate-500"
                      >
                        Last Engagement
                      </Label>
                      <Textarea
                        name="engagement"
                        readOnly
                        value={
                          student.engagements.length > 0 &&
                          student.engagements[student.engagements.length - 1]
                            .body
                            ? student.engagements[
                                student.engagements.length - 1
                              ].body
                            : student.engagements[0].body
                        }
                        className={`w-full line-clamp-3 resize-none h-16`}
                      /> */}
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
                <p className="text-md group-hover:font-bold">Add Engagement</p>
                <div className="flex flex-row gap-2">
                  <Link href={`/student/${student.matric_no}`} target="_blank">
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
