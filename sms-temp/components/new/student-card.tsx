import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import {
  Phone,
  MessageCircle,
  Inbox,
  AlertTriangle,
  BanknoteArrowUp,
  GraduationCap,
  UserCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../ui/card";
import StudentEngagement from "./student-engagement";
import StudentInfo from "./student-info";
import StudentLMSActivity from "./student-lms";
import StudentPayment from "./student-payment";
import { Student } from "@/lib/types/database";

const tabs = [
  {
    value: "information",
    label: "Information",
    icon: UserCircle,
    color: "#4f46e5"
  },
  {
    value: "lms-activity",
    label: "CN Activity",
    icon: GraduationCap,
    color: "#059669"
  },
  {
    value: "payment",
    label: "Payment",
    icon: BanknoteArrowUp,
    color: "#d97706"
  },
  {
    value: "escalate",
    label: "Escalate",
    icon: AlertTriangle,
    color: "#dc2626"
  }
];

export function NewStudentCard({
  student,
  index
}: {
  student: Student;
  index: number;
}) {
  return (
    <>
      <Card
        key={index}
        className="w-full min-h-[285px] flex flex-col items-start justify-between gap-3 border-0"
      >
        <CardHeader>
          <CardTitle className="text-xl font-bold -mb-2 overflow-hidden text-ellipsis whitespace-nowrap w-full capitalize">
            {student.full_name}
          </CardTitle>
          <CardDescription>
            <div className="flex flex-row gap-2 justify-start items-center">
              <p>{student.matric_no}</p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full h-full flex items-start justify-start">
          <Tabs defaultValue="escalate" className="w-full flex flex-col gap-2">
            <TabsList className="bg-background h-full flex flex-row rounded-none border-b p-0 gap-4 items-center justify-end">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full w-fit items-center justify-center rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none group`}
                >
                  <tab.icon
                    className={`w-5 h-5 mb-2 group-hover:text-[${tab.color}]`}
                  />
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent
              value="information"
              className="items-start w-full justify-center"
            >
              <StudentInfo student={student} />
            </TabsContent>
            <TabsContent
              value="lms-activity"
              className="items-start w-full justify-center"
            >
              <StudentLMSActivity student={student} />
            </TabsContent>
            <TabsContent
              value="payment"
              className="items-start w-full justify-center"
            >
              <StudentPayment student={student} />
            </TabsContent>
            <TabsContent
              value="escalate"
              className="items-start w-full justify-center"
            >
              <StudentEngagement student={student} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="w-full items-end justify-end flex gap-4">
          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Inbox className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </CardFooter>
      </Card>
    </>
  );
}
