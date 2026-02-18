"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../ui/accordion";
import { Card, CardContent, CardFooter } from "../ui/card";
import {
  AlertTriangle,
  BanknoteArrowUp,
  Copy,
  GraduationCap,
  MessageCircle,
  Phone,
  UserCircle
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import FiltersSection from "./filters-section";
import { StudentDashboardRow } from "@/lib/types/database";
import { Button } from "../ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import StudentEngagement from "./student-engagement";
import StudentInfo from "./student-info";
import StudentLMSActivity from "./student-lms";
import StudentPayment from "./student-payment";

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
      <div className="flex flex-col items-center justify-between mb-4 min-w-3xl">
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
            <Accordion
              key={index}
              type="single"
              collapsible
              className="w-[90vw] mx-auto"
            >
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger className="w-full justify-between items-center p-4">
                  <p className="capitalize line-clamp-1">
                    {index + 1}. {student.full_name}
                  </p>
                </AccordionTrigger>
                <AccordionContent className="w-full px-4">
                  <Card>
                    <CardContent className="w-full">
                      <Tabs
                        defaultValue="information"
                        className="w-full flex flex-row-reverse gap-2"
                      >
                        <TabsList className="bg-background h-full flex-col rounded-none border-l p-0 gap-1">
                          {tabs.map((tab) => (
                            <TabsTrigger
                              key={tab.value}
                              value={tab.value}
                              className="bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full w-full justify-start rounded-none border-0 border-l-2 border-transparent data-[state=active]:shadow-none"
                            >
                              <tab.icon className="w-6 h-6 ml-2 group" />
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
                    <CardFooter className="p-0">
                      <div className="flex flex-row gap-2 justify-end items-center px-4 w-full">
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() =>
                            window.navigator.clipboard.writeText(
                              student.full_name
                            )
                          }
                        >
                          <Copy className="w-10 h-10 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="lg" asChild>
                          <Link
                            href={`/student/${student.matric_no}`}
                            target="_blank"
                          >
                            <UserCircle className="w-10 h-10 text-muted-foreground" />
                          </Link>
                        </Button>

                        <Button variant="ghost" size="lg" asChild>
                          <Link
                            href={`tel:${student.phone?.replace(/[^0-9]/g, "")}`}
                          >
                            <Phone className="w-10 h-10 text-muted-foreground" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="lg" asChild>
                          <Link
                            href={`https://wa.me/6${student.phone?.replace(
                              /[^0-9]/g,
                              ""
                            )}`}
                            target="_blank"
                          >
                            <MessageCircle className="w-10 h-10 text-muted-foreground" />
                          </Link>
                        </Button>

                        {/* 
                        <Inbox className="w-4 h-4 text-muted-foreground flex-shrink-0" /> */}
                      </div>
                    </CardFooter>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
