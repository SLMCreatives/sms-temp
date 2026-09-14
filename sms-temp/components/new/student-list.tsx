"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../ui/card";
import { AlertTriangle, BanknoteArrowUp, UserCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import FiltersSection, {
  ALL,
  emptyFilters,
  StudentFilters
} from "./filters-section";
import { StudentDashboardRow } from "@/lib/types/database";
import { getStudentLevel, levelOptionsFrom } from "@/lib/student-level";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle
} from "../ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import StudentEngagement from "./student-engagement";
import StudentInfo from "./student-info";
import StudentPayment from "./student-payment";

export const tabs = [
  {
    value: "information",
    label: "Information",
    icon: UserCircle,
    color: "#4f46e5"
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

export default function NewStudentList({
  data
}: {
  data: StudentDashboardRow[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<StudentFilters>(emptyFilters);
  const [displayLimit, setDisplayLimit] = useState(20);
  const observerTarget = useRef(null);

  // Options come from the rows in scope so empty levels/campuses never appear.
  const levelOptions = useMemo(() => levelOptionsFrom(data), [data]);
  const campusOptions = useMemo(
    () =>
      Array.from(
        new Set(data.map((s) => s.campus_code).filter(Boolean) as string[])
      ).sort(),
    [data]
  );

  const matchesPaymentMode = (mode: string | undefined, filter: string) => {
    if (filter === ALL) return true;
    const pm = mode ?? "";
    const isSelf = pm.toLowerCase().includes("self");
    const isPtptn = pm.toUpperCase().includes("PTPTN");
    if (filter === "SELF") return isSelf;
    if (filter === "PTPTN") return isPtptn;
    return !isSelf && !isPtptn;
  };

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter((student) => {
      const matchesQuery =
        student.full_name.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.matric_no.toLowerCase().includes(query);
      if (!matchesQuery) return false;
      if (
        filters.study_level !== ALL &&
        getStudentLevel(student.programme_name) !== filters.study_level
      )
        return false;
      if (
        filters.campus_code !== ALL &&
        student.campus_code !== filters.campus_code
      )
        return false;
      return matchesPaymentMode(
        student.a_payments?.payment_mode,
        filters.payment_mode
      );
    });
  }, [data, searchQuery, filters]);

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
  }, [searchQuery, filters]);

  return (
    <>
      <div className="flex flex-col items-center justify-between mb-4 min-w-3xl px-4">
        <div className="flex flex-col w-full gap-1">
          <FiltersSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            levelOptions={levelOptions}
            campusOptions={campusOptions}
          />
          <p className="text-xs italic text-muted-foreground text-nowrap self-end">
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
              <DrawerContent className="w-full h-full ">
                <DrawerHeader className="sr-only">
                  <DrawerTitle>Student Information</DrawerTitle>
                </DrawerHeader>
                <Card className="w-full flex flex-col items-start justify-between gap-3 border-0 px-6 dark:bg-black bg-white">
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
                        value="payment"
                        className="items-start w-full justify-center"
                      >
                        <StudentPayment student={student} />
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
