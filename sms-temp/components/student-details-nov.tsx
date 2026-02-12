"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  Globe,
  FileText,
  CheckCircle,
  BanknoteArrowUp,
  FolderCheck
} from "lucide-react";
//import { Comments, Students } from "@/app/student/studentColumns";
import { EngagementForm } from "./engagement-form";
//import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
//import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "./ui/sheet";
import { Button } from "./ui/button";
//import { createClient } from "@/lib/supabase/client";
//import CommentSection from "./comment-section";
import { Students } from "@/app/student/studentColumns";
import ChangeStatusForm from "./change-status";
//import { Switch } from "./ui/switch";
import ChangeStatusPTPTNForm from "./change-status-ptptn";

interface StudentDetailsProps {
  studentData: Students;
}
const StudentDetailsPageNov: React.FC<StudentDetailsProps> = ({
  studentData
}) => {
  /*  const dateFormated = (dateString: string) => {
    // convert date to locate string
    const date = new Date(dateString);
    const localisedDate = date.toLocaleDateString("en-MY");
    const localisedTime = date.toLocaleTimeString("en-MY");
    return `${localisedDate} ${localisedTime}`;
  }; */

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {/* Personal Information Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="">
                <div className="flex flex-row justify-between">
                  <CardTitle className="text-lg md:text-xl text-muted-foreground flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Student Information
                  </CardTitle>
                  <ChangeStatusForm student={studentData} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1 text-left">
                    <h2 className="text-xl md:text-2xl lg:text-5xl font-bold text-left text-foreground mb-1">
                      {studentData.full_name}
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-3 lg:mb-0 flex flex-row gap-2 items-center w-full">
                      Matric No: {studentData.matric_no}
                    </p>
                    {/*                     <ChangeStatusForm student={studentData} />
                     */}{" "}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-sm md:text-base break-all">
                          {studentData.email.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-sm md:text-base">
                          {studentData.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Nationality
                        </p>
                        <p className="font-medium text-sm md:text-base">
                          {studentData.nationality}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Entry Type
                        </p>
                        <p className="font-medium text-sm md:text-base">
                          {studentData.entry_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Study Mode
                        </p>
                        <p className="font-medium text-sm md:text-base">
                          {studentData.study_mode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BanknoteArrowUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Payment Mode
                        </p>
                        <p className="font-medium text-sm md:text-base">
                          {studentData.nov25_payment
                            ? studentData.nov25_payment?.payment_mode
                            : "No record"}
                        </p>
                      </div>
                    </div>
                    {studentData.nov25_payment?.payment_mode !== "PTPTN" && (
                      <div className="flex items-center gap-3">
                        <FolderCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Payment Status
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {studentData.nov25_payment
                              ? studentData.nov25_payment?.payment_status
                              : "No record"}
                          </p>
                        </div>
                      </div>
                    )}
                    {studentData.nov25_payment?.payment_mode === "PTPTN" && (
                      <div className="flex items-center gap-3">
                        <FolderCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Proof of PTPTN
                          </p>
                          <div className="flex flex-row gap-2">
                            {/*  <p className="font-medium text-sm md:text-base">
                              {studentData.nov25_payment
                                ? studentData.nov25_payment.proof
                                : "No record"}
                            </p>
                            <Switch
                              checked={
                                studentData.nov25_payment?.proof === "TRUE"
                              }
                            /> */}
                            <ChangeStatusPTPTNForm student={studentData} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 col-span-2 lg:grid grid-cols-2 py-10">
              <Card className="shadow-sm">
                <CardHeader className="">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Registration Date
                      </p>
                      <p className="font-medium text-sm md:text-base">
                        {studentData.admission_date}
                      </p>
                    </div>
                  </div>
                  <div className="">
                    <p className="text-sm text-muted-foreground mb-1">
                      Programme
                    </p>
                    <p className="font-medium text-foreground text-sm md:text-base">
                      {" "}
                      {studentData.programme_name}
                    </p>
                  </div>
                  <div className="">
                    <p className="text-sm text-muted-foreground mb-1">
                      Faculty
                    </p>
                    <p className="font-medium text-foreground text-sm md:text-base">
                      {" "}
                      {studentData.faculty_code}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Study Level
                    </p>
                    <p className="font-medium text-foreground text-sm md:text-base">
                      {studentData.study_level}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    LMS Activity
                  </CardTitle>
                  {/*  <CardDescription className="text-sm text-muted-foreground italic">
                    Data as of: 10 Nov 2025
                  </CardDescription> */}
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {/* <div className="">
                    <p className="text-sm text-muted-foreground mb-1">
                      SRB Progress
                    </p>
                    <p className="font-medium text-foreground text-sm md:text-base">
                      {" "}
                      {(studentData.lms_activity &&
                        studentData.lms_activity.srb_progress + "%") ||
                        "No record"}
                    </p>
                  </div> */}
                  <div className="">
                    <p className="text-sm text-muted-foreground mb-1">
                      Course Progress
                    </p>
                    <p className="font-medium text-foreground text-sm md:text-base">
                      {studentData.nov25_lms_activity
                        ? Math.round(
                            studentData.nov25_lms_activity.course_progress * 100
                          ) + "%"
                        : "No record"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="font-medium text-foreground text-sm md:text-base">
                      {/*  {studentData.nov25_lms_activity === null ? "Unknown" : ""} */}
                      {studentData.nov25_lms_activity &&
                      studentData.nov25_lms_activity?.course_progress <= 0.2
                        ? "⚠️ At Risk"
                        : "Active"}
                    </p>
                  </div>

                  {/* <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">
                      Last Login
                    </p>
                    <p className="font-medium text-foreground text-sm md:text-base">
                      {studentData.nov25_lms_activity.last_login_at &&
                      studentData.nov25_lms_activity.last_login_at
                        ? dateFormated(
                            studentData.nov25_lms_activity?.last_login_at
                          )
                        : "Not Logged In"}
                    </p>
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 flex">
            <Card className="shadow-sm">
              <CardHeader className="">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Engagement Tracker
                </CardTitle>
                <CardDescription>
                  Track and manage student engagement. Everytime you contact a
                  students, please add it here.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2">
                {!studentData.nov25_engagements && "No activity yet"}
                {studentData.nov25_engagements &&
                  studentData.nov25_engagements.map((engagement, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(engagement.created_at)
                            .toLocaleString()
                            .slice(0, 10)}{" "}
                          - {engagement.handled_by}
                        </p>
                        <p className="text-lg font-medium">
                          {engagement.subject}{" "}
                          <Badge variant={"default"}>
                            {engagement.channel}
                          </Badge>
                        </p>
                        <p className="text-sm italic">{engagement.body}</p>
                      </CardContent>
                      <CardFooter className="">
                        {/* <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" size={"sm"} className="px-0">
                              Comments ({comments.length})
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Comment Section</DialogTitle>
                            </DialogHeader>

                            <CommentSection engagementId={engagement.id} />
                          </DialogContent>
                        </Dialog> */}
                      </CardFooter>
                    </Card>
                  ))}
              </CardContent>
              <CardFooter>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant={"default"}>Add Engagement</Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full h-full overflow-y-scroll lg:w-1/2"
                  >
                    <SheetHeader>
                      <SheetTitle>Add Engagement</SheetTitle>
                    </SheetHeader>
                    <EngagementForm matric_no={studentData.matric_no} />
                  </SheetContent>
                </Sheet>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsPageNov;
