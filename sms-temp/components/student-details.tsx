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
  Trash2
} from "lucide-react";
import { Students } from "@/app/student/studentColumns";
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
import { createClient } from "@/lib/supabase/client";

interface StudentDetailsProps {
  studentData: Students;
}
const supabase = createClient();
const handleDeleteEngagement = async (engagementId: string) => {
  // Implement the logic to delete the engagement

  const { error } = await supabase
    .from("engagements")
    .delete()
    .eq("id", engagementId);

  if (error) {
    console.log("Error deleting engagement:", error.message);
    return;
  }
  window.location.reload();
};

const StudentDetailsPage: React.FC<StudentDetailsProps> = ({ studentData }) => {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {/* Personal Information Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1 md:text-center text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                      {studentData.full_name}
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-3">
                      Matric No: {studentData.matric_no}
                    </p>
                    <Badge variant="outline">{studentData.status}</Badge>
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
                          {studentData.email}
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Academic Details Card */}
          <div>
            <Card className="shadow-sm">
              <CardHeader className="">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
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
                  <p className="text-sm text-muted-foreground mb-1">Faculty</p>
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
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6">
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {studentData.engagements.length === 0 && "No activity yet"}
              {studentData.engagements.length > 0 &&
                studentData.engagements.map((engagement, index) => (
                  <Card
                    key={index}
                    className="flex flex-row gap-2 justify-between items-end"
                  >
                    <CardContent className="flex flex-col gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(engagement.created_at)
                          .toLocaleString()
                          .slice(0, 10)}{" "}
                        - {engagement.handled_by}
                      </p>
                      <p className="text-lg font-medium">
                        {engagement.subject}{" "}
                        <Badge variant={"default"}>{engagement.channel}</Badge>
                      </p>
                      <p className="text-sm italic">{engagement.body}</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant={"link"}
                        size="icon"
                        onClick={() => {
                          handleDeleteEngagement(engagement.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              {/*  <EngagementTable
                columns={engagementColumns}
                data={studentData.engagements}
              /> */}
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
  );
};

export default StudentDetailsPage;
