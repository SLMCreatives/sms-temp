"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../ui/card";
import {
  AlertTriangle,
  BanknoteArrowUp,
  GraduationCap,
  MessageCircle,
  UserCircle
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import FiltersSection from "./filters-section";
import { StudentDashboardRow } from "@/lib/types/database";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import StudentEngagement from "./student-engagement";
import StudentInfo from "./student-info";
import StudentLMSActivity from "./student-lms";
import StudentPayment from "./student-payment";
import StudentSOS from "./student-sos";

export const tabs = [
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
    value: "sos",
    label: "SOS",
    icon: MessageCircle,
    color: "#ef4444"
  },
  {
    value: "escalate",
    label: "Escalate",
    icon: AlertTriangle,
    color: "#dc2626"
  }
];

export default function NewStudentList({
  data
}: {
  data: StudentDashboardRow[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(20);
  const observerTarget = useRef(null);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter(
      (student) =>
        student.full_name.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.matric_no.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const visibleStudents = useMemo(() => {
    return filteredStudents.slice(0, displayLimit);
  }, [filteredStudents, displayLimit]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          displayLimit < filteredStudents.length
        ) {
          setDisplayLimit((prev) => prev + 20); // Load next 20
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayLimit, filteredStudents.length]);

  // Reset limit when searching or filtering
  useEffect(() => {
    setDisplayLimit(20);
  }, [searchQuery]);

  return (
    <>
      <div className="flex flex-col items-center justify-between mb-4 min-w-3xl px-4">
        <div className="flex flex-row items-center w-full gap-2">
          <FiltersSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <p className="text-xs italic text-muted-foreground text-nowrap">
            {filteredStudents.length} / {data.length}
          </p>
        </div>
        <div className="flex flex-col w-full gap-2 lg:hidden">
          {visibleStudents.length === 0 && (
            <div className="flex flex-col items-center justify-start">
              <UserCircle className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No students found</p>
            </div>
          )}
          {visibleStudents.map((student, index) => (
            <Drawer key={index}>
              <DrawerTrigger>
                <Card
                  key={index}
                  className="w-full flex flex-col items-start justify-between gap-3 border-0"
                >
                  <CardContent className="w-full h-full flex items-start justify-start">
                    <div className="flex flex-row gap-2 items-start justify-between">
                      <p className="text-sm font-bold text-ellipsis whitespace-nowrap overflow-hidden text-left max-w-[300px]">
                        {student.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground text-right">
                        {student.matric_no}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </DrawerTrigger>
              <DrawerContent className="w-full h-full dark:bg-black">
                <DrawerHeader className="sr-only">
                  <DrawerTitle>
                    Student Information
                    </DrawerTitle>
                    </DrawerHeader>
                <Card className="w-full min-h-[285px] flex flex-col items-start justify-between gap-3 border-0 px-6">
                  <CardHeader >
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
                    <Tabs
                      defaultValue="information"
                      className="w-full flex flex-col gap-2"
                    >
                      <TabsList className=" w-full h-full flex flex-row rounded-none border-b p-0 gap-4 items-center justify-end">
                        {tabs.map((tab) => (
                          <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className={`bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full w-fit items-center justify-center rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none group`}
                          >
                            <tab.icon
                              className={`w-10 h-10 mb-2 group-hover:text-[${tab.color}]`}
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
                        value="sos"
                        className="items-start w-full justify-center"
                      >
                        <StudentSOS student={student} />
                      </TabsContent>
                      <TabsContent
                        value="escalate"
                        className="items-start w-full h-full justify-start"
                      >
                        <StudentEngagement student={student} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className=""></CardFooter>
                </Card>
              </DrawerContent>
            </Drawer>
          ))}
          <div
            ref={observerTarget}
            className="h-10 w-full flex items-center justify-center"
          >
            {displayLimit < filteredStudents.length && (
              <p className="text-xs text-muted-foreground animate-pulse">
                Loading more...
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
