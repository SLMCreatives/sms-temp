import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRightCircle,
  ArrowUpCircle,
  Mail,
  MessageCircle,
  Phone
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Students } from "../student/studentColumns";

export const dynamic = "force-dynamic";
const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase.from("students").select("*");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

const data = await getData();
const n_fob = data.filter((student) => student.faculty_code === "FOB").length;
const n_feh = data.filter((student) => student.faculty_code === "FEH").length;
const n_sit = data.filter((student) => student.faculty_code === "SIT").length;

export default async function EngagementPage() {
  // Create and await the client
  const { data: engagements, error } = await supabase
    .from("engagements")
    .select("*, students(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }

  // console.log(engagements.length);
  // Now we can use the client methods
  const formatDate = (dateString: string) => {
    // convert date to locate string
    const date = new Date(dateString);
    const localisedDate = date.toLocaleDateString("en-MY");
    const localisedTime = date.toLocaleTimeString("en-MY");
    return `${localisedDate} ${localisedTime}`; // localisedDate localisedTime;
  };

  /* const feh_engagement = engagements.filter(
    (engagement) => engagement.faculty_code === "FEH"
  );
  const sit_engagement = engagements.filter(
    (engagement) => engagement.faculty_code === "SIT"
  ); */

  return (
    <div className="flex flex-col gap-4 p-10 lg:grid grid-cols-3">
      <p className="text-2xl font-bold lg:col-span-3">Engagement Tracker</p>
      <div className="flex flex-row gap-2 justify-between lg:col-span-3 py-10">
        <p className="text-xl text-center flex flex-col px-3">
          <span className="font-bold">FOB</span>
          <span className="text-xl md:text-2xl">
            {
              engagements.filter(
                (engagement) => engagement.students.faculty_code === "FOB"
              ).length
            }{" "}
            / {n_fob}
          </span>
          <span className="italic text-sm">students called</span>
        </p>
        <p className="text-xl text-center flex flex-col px-3">
          <span className="font-bold">FEH</span>
          <span className="text-xl md:text-2xl">
            {
              engagements.filter(
                (engagement) => engagement.students.faculty_code === "FEH"
              ).length
            }{" "}
            / {n_feh}
          </span>
          <span className="italic text-sm">students called</span>
        </p>
        <p className="text-xl text-center flex flex-col px-3">
          <span className="font-bold">SIT</span>
          <span className="text-xl md:text-2xl">
            {
              engagements.filter(
                (engagement) => engagement.students.faculty_code === "SIT"
              ).length
            }{" "}
            / {n_sit}
          </span>
          <span className="italic text-sm">students called</span>
        </p>
      </div>
      <p className="text-xl font-bold lg:col-span-3">Engagement Cards</p>

      {engagements.map((engagement) => (
        <Card
          key={engagement.id}
          className={`bg-white ${
            engagement.sentiment === "negative" ? "bg-red-100" : ""
          } ${engagement.outcome === "no_response" ? "bg-red-100" : ""} ${
            engagement.outcome === "followup" ? "bg-yellow-100" : ""
          }`}
        >
          <CardHeader>
            <CardTitle className="justify-between flex flex-row">
              <p className="text-xl text-nowrap">
                {engagement.matric_no} [{engagement.students.faculty_code}{" "}
                {engagement.students.study_level}]
              </p>
            </CardTitle>
            <CardDescription>
              {engagement.handled_by} - {formatDate(engagement.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <p className="text-md font-bold">{engagement.subject}</p>
              <p className="text-sm text-muted-foreground">{engagement.body}</p>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-row justify-between w-full">
              <div className="flex flex-row gap-2">
                Outcome:{" "}
                <Badge
                  variant={
                    engagement.outcome === "followup"
                      ? "destructive"
                      : "default"
                  }
                  className="capitalize"
                >
                  {engagement.outcome.replace("_", " ")}
                </Badge>
              </div>
              <Drawer>
                <DrawerTrigger asChild>
                  <ArrowUpCircle className="min-w-6 min-h-6 text-purple-500 cursor-pointer" />
                </DrawerTrigger>
                <DrawerContent className="w-full min-h-full lg:max-w-2xl mx-auto overflow-scroll ring">
                  <div className="w-full mx-auto p-8 flex flex-col gap-2 overflow-visible min-h-full">
                    <DrawerTitle className="w-full flex flex-row justify-between">
                      {engagement.students.matric_no}
                      <div className="flex flex-row gap-4">
                        <Link
                          href={`tel:6${engagement.students.phone.replace(
                            /[-]/g,
                            ""
                          )}`}
                        >
                          <Phone className="h-6 w-6 text-cyan-500" />
                        </Link>
                        <Link
                          href={`https://wa.me/6${engagement.students.phone.replace(
                            /[-]/g,
                            ""
                          )}`}
                        >
                          <MessageCircle className="h-6 w-6 text-green-500" />
                        </Link>
                        <Link href={`mailto:${engagement.students.email}`}>
                          <Mail className="h-6 w-6 text-slate-500" />
                        </Link>
                      </div>
                    </DrawerTitle>
                    <p className="text-2xl font-bold line-clamp-2 ">
                      {engagement.students.full_name}
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
                        value={engagement.students.programme_name}
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
                        value={engagement.students.email.toLocaleLowerCase()}
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
                        value={engagement.students.phone}
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
                        value={engagement.students.nationality}
                      />
                      {engagement.students.lms_activity && (
                        <>
                          <p className="text-md font-bold col-span-2">
                            CN Activity
                          </p>
                          <Label
                            htmlFor="lms_activity"
                            className="text-xs italic text-slate-500"
                          >
                            SRB Progress
                          </Label>
                          <Input
                            name="lms_activity"
                            readOnly
                            value={
                              engagement.students.lms_activity.srb_progress +
                              "%"
                            }
                            className={`w-full ${
                              engagement.students.lms_activity.srb_progress ===
                              0
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
                            value={
                              engagement.students.lms_activity.course_progress +
                              "%"
                            }
                            className={`w-full ${
                              engagement.students.lms_activity
                                .course_progress === 0
                                ? "text-red-500 font-bold"
                                : ""
                            }`}
                          />
                        </>
                      )}
                    </div>

                    <div className="flex flex-row gap-2 justify-between w-full py-8 group hover:cursor-pointer">
                      <p className="text-md group-hover:font-bold">
                        View Student Page
                      </p>
                      <div className="flex flex-row gap-2">
                        <Link
                          href={`/student/${engagement.students.matric_no}`}
                        >
                          <ArrowRightCircle className="w-6 h-6 text-orange-500 group-hover:text-orange-600" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
