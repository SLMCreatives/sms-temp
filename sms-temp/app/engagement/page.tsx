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
import { Students } from "../student/studentColumns";
//import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("nov25_students")
    .select("*");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

const data = await getData();
//const data_active = data.filter((student) => student.status === "Active");
const n_fob = data.filter(
  (student) => student.faculty_code === "FOB" && student.status === "Active"
).length;
const n_feh = data.filter(
  (student) => student.faculty_code === "FEH" && student.status === "Active"
).length;
const n_sit = data.filter(
  (student) => student.faculty_code === "SIT" && student.status === "Active"
).length;

export default async function EngagementPage() {
  // Create and await the client
  const { data: engagements, error } = await supabase
    .from("nov25_engagements")
    .select("*, nov25_students(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }

  // Now we can use the client methods
  const formatDate = (dateString: string) => {
    // convert date to locate string
    const date = new Date(dateString);
    const localisedDate = date.toLocaleDateString("en-MY");
    const localisedTime = date.toLocaleTimeString("en-MY");
    return `${localisedDate} ${localisedTime}`; // localisedDate localisedTime;
  };

  return (
    <div className="flex flex-col gap-4 p-10 lg:grid grid-cols-3">
      <p className="text-2xl font-bold lg:col-span-3">Engagement Tracker</p>
      <div className="flex flex-row gap-2 justify-between lg:col-span-3 py-10">
        <p className="text-xl text-center flex flex-col px-3">
          <span className="font-bold">FOB</span>
          <span className="text-xl md:text-2xl">
            {
              engagements.filter(
                (engagement) =>
                  engagement.nov25_students.faculty_code === "FOB" &&
                  engagement.nov25_students.status === "Active"
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
                (engagement) =>
                  engagement.nov25_students.faculty_code === "FEH" &&
                  engagement.nov25_students.status === "Active"
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
                (engagement) =>
                  engagement.nov25_students.faculty_code === "SIT" &&
                  engagement.nov25_students.status === "Active"
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
          } ${
            engagement.outcome === "no_response"
              ? "border-red-300 border-2"
              : ""
          } ${engagement.outcome === "followup_ro" ? "bg-yellow-100" : ""}`}
        >
          <CardHeader>
            <CardTitle className="justify-between flex flex-row">
              <p className="text-xl text-nowrap">
                {engagement.matric_no} [{engagement.nov25_students.faculty_code}{" "}
                {engagement.nov25_students.study_level}]
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
                    engagement.outcome === "deferred" ||
                    engagement.outcome === "withdraw"
                      ? "destructive"
                      : "default"
                  }
                  className="capitalize"
                >
                  {engagement.outcome
                    ? engagement.outcome.replace(/_/g, " ")
                    : "N/A"}
                </Badge>
              </div>
              {/*  <div className="flex flex-row gap-4 justify-end">
                {engagement.comments && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size={"sm"} className="px-0">
                        Comments ({engagement.comments.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Comment Section</DialogTitle>
                      </DialogHeader>

                      <CommentSection engagementId={engagement.id} />
                    </DialogContent>
                  </Dialog>
                )}
                <Drawer>
                  <DrawerTrigger asChild>
                    <ArrowUpCircle className="min-w-6 min-h-6 text-purple-500 cursor-pointer" />
                  </DrawerTrigger>
                  <DrawerContent className="w-full min-h-full lg:max-w-2xl mx-auto overflow-scroll">
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
                                engagement.students.lms_activity
                                  .srb_progress === 0
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
                                engagement.students.lms_activity
                                  .course_progress + "%"
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
              </div> */}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
