import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { Students } from "../student/studentColumns";
import { User2Icon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import Link from "next/link";

const sst = [
  {
    id: 1,
    name: "Amirul",
    image: "sst/amirul.png"
  },
  {
    id: 2,
    name: "Farzana",
    image: "sst/farzana.png"
  },
  {
    id: 3,
    name: "Ayu",
    image: "sst/ayu.jpeg"
  },
  {
    id: 4,
    name: "Najwa",
    image: "sst/najwa.png"
  }
];

const supabase = createClient();

async function getData(): Promise<Students[]> {
  const { data: students, error } = await supabase
    .from("jan26_students")
    .select("*, jan26_lms_activity(*), jan26_engagements(*), jan26_payment(*)");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function SSTpage() {
  const engagements = await getData();
  const amirulEngagement = engagements.filter((student) =>
    student.jan26_engagements?.some(
      (engagement) => engagement.handled_by === "Amirul"
    )
  );
  const farzanaEngagement = engagements.filter((student) =>
    student.jan26_engagements.some(
      (engagement) => engagement.handled_by === "Farzana"
    )
  );
  const ayuEngagement = engagements.filter((student) =>
    student.jan26_engagements.some(
      (engagement) => engagement.handled_by === "Ayu SST"
    )
  );
  const najwaEngagement = engagements.filter((student) =>
    student.jan26_engagements.some(
      (engagement) => engagement.handled_by === "Najwa"
    )
  );
  const totalEngagement =
    amirulEngagement.length +
    farzanaEngagement.length +
    ayuEngagement.length +
    najwaEngagement.length;
  /* 
  console.log(
    amirulEngagement.length,
    farzanaEngagement.length,
    ayuEngagement.length,
    najwaEngagement.length
  ); */
  return (
    <div className="flex flex-col mx-auto w-full lg:max-w-5xl items-start justify-start gap-4 px-8 py-6">
      <div className="flex flex-row gap-2 items-center justify-between w-full">
        <p className="text-3xl italic font-bold">SST Tracker</p>
        <div className="flex flex-col gap-0 items-end">
          <p className="text-sm italic">Total Engaged</p>
          <p className="text-xl font-bold italic">{totalEngagement} students</p>
        </div>
      </div>
      <section className="flex flex-row lg:grid grid-cols-[158px_1fr_1fr_1fr_1fr]  py-4 border-y-2 border-b-foreground/10 w-full items-center justify-between mx-auto">
        <div className="w-32 lg:col-span-[128px]"></div>
        {sst.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={item.image} className="object-cover" />
              <AvatarFallback>{item.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <p className="text-center italic text-sm">{item.name}</p>
          </div>
        ))}
      </section>
      {/* No of Engagements */}
      <section className="flex flex-row lg:grid grid-cols-5 pb-4 pr-4 border-b-2 border-b-foreground/10 w-full items-start justify-between mx-auto ">
        <div className="w-28">Engaged</div>
        <div className="text-center">{amirulEngagement.length}</div>
        <div className="text-center">{farzanaEngagement.length}</div>
        <div className="text-center">{ayuEngagement.length}</div>
        <div className="text-center">{najwaEngagement.length}</div>
      </section>
      {/* Week 1 */}
      <section className="flex flex-row lg:grid grid-cols-5 pb-4 pr-4 border-b-2 border-b-foreground/10 w-full items-start justify-between mx-auto ">
        <div className="w-28">Student</div>
        <div className="text-center">
          {amirulEngagement.map((student, index) => (
            <div className="flex flex-col gap-0" key={index}>
              <Link href={`/student/${student.matric_no}`} target="_blank">
                <Tooltip>
                  <TooltipTrigger>
                    <User2Icon className="mx-auto max-w-6 max-h-6" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{student.full_name}</p>
                    <p>Matric No: {student.matric_no}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center">
          {farzanaEngagement.map((student, index) => (
            <div className="flex flex-col gap-1" key={index}>
              <Link href={`/student/${student.matric_no}`} target="_blank">
                <Tooltip>
                  <TooltipTrigger>
                    <User2Icon className="mx-auto max-w-6 max-h-6" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{student.full_name}</p>
                    <p>Matric No: {student.matric_no}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center">
          {ayuEngagement.map((student, index) => (
            <div className="flex flex-col gap-1" key={index}>
              <Link href={`/student/${student.matric_no}`} target="_blank">
                <Tooltip>
                  <TooltipTrigger>
                    <User2Icon className="mx-auto max-w-6 max-h-6" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{student.full_name}</p>
                    <p>Matric No: {student.matric_no}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center">
          {najwaEngagement.map((student, index) => (
            <div className="flex flex-col gap-1" key={index}>
              <Link href={`/student/${student.matric_no}`} target="_blank">
                <Tooltip>
                  <TooltipTrigger>
                    <User2Icon className="mx-auto max-w-6 max-h-6" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{student.full_name}</p>
                    <p>Matric No: {student.matric_no}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
