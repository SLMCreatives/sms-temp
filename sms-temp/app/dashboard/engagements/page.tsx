"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Engagements } from "@/app/student/studentColumns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

const supabase = createClient();

const ITEMS_PER_PAGE = 12;

export default function EngagementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<string>("all");
  const [data, setData] = useState<{ engagements: Engagements[] }>({
    engagements: []
  });

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("students")
        .select("*, engagements(*), lms_activity(*)");
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setData({
          engagements: data
            ?.flatMap((student) => student.engagements)
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
        });
      }
    }
    fetchData();
  }, []);

  const filteredEngagements = useMemo(() => {
    return data.engagements.filter((engagement: Engagements) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        engagement.matric_no.toLowerCase().includes(searchLower) ||
        engagement.subject.toLowerCase().includes(searchLower) ||
        engagement.body.toLowerCase().includes(searchLower) ||
        engagement.handled_by.toLowerCase().includes(searchLower) ||
        engagement.created_at.toLowerCase().includes(searchLower);

      // Channel filter
      const matchesChannel =
        channelFilter === "all" || engagement.channel === channelFilter;

      // Sentiment filter
      const matchesSentiment =
        sentimentFilter === "all" || engagement.sentiment === sentimentFilter;

      // Outcome filter
      const matchesOutcome =
        outcomeFilter === "all" || engagement.outcome === outcomeFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRange === "last_7_days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesDateRange = new Date(engagement.created_at) >= sevenDaysAgo;
      } else if (dateRange === "last_30_days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesDateRange = new Date(engagement.created_at) >= thirtyDaysAgo;
      } else if (dateRange === "last_90_days") {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        matchesDateRange = new Date(engagement.created_at) >= ninetyDaysAgo;
      }

      if (!matchesDateRange) return false;

      return (
        matchesSearch && matchesChannel && matchesSentiment && matchesOutcome
      );
    });
  }, [
    data.engagements,
    searchQuery,
    channelFilter,
    sentimentFilter,
    outcomeFilter,
    dateRange
  ]);

  const totalPages = Math.ceil(filteredEngagements.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEngagements = filteredEngagements.slice(startIndex, endIndex);

  useMemo(() => {
    setCurrentPage(1);
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setChannelFilter("all");
    setSentimentFilter("all");
    setOutcomeFilter("all");
    setCurrentPage(1);
    setDateRange("all");
  };

  const hasActiveFilters =
    searchQuery ||
    channelFilter !== "all" ||
    sentimentFilter !== "all" ||
    outcomeFilter !== "all" ||
    dateRange !== "all";

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "resolved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "escalated":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "followup":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  /* const gotoStudentPage = (matric_no: string) => {
    // Open new window to student page
    window.open(`/student/${matric_no}`, "_blank");
  }; */

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold mb-2">Students Engagements</h1>
        </div>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-left"
          />
        </div>
      </div>

      {/* Filters Section */}
      <Card className="flex flex-row flex-nowrap mb-4 gap-0 items-start justify-between w-full ">
        <CardHeader className="relative max-w-[24px] lg:hidden">
          <CardTitle className="flex items-center gap-2">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 md:flex h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 md:flex md:flex-row  gap-4 w-full">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Channels</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sentiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Outcomes</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="no_response">No Response</SelectItem>
                <SelectItem value="followup">Follow-up</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Time</SelectItem>
                <SelectItem value="last_7_days">Last 7 days</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="last_90_days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        {hasActiveFilters && (
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full md:w-auto bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredEngagements.length > 0 ? startIndex + 1 : 0}-
        {Math.min(endIndex, filteredEngagements.length)} of{" "}
        {filteredEngagements.length} engagements
      </div>

      {filteredEngagements.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex flex-row items-center justify-between gap-4 py-3">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9 h-9 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Engagements List - Mobile Optimized Cards */}
      <div className="space-y-4 lg:grid lg:grid-cols-3 gap-4 ">
        {filteredEngagements.length === 0 ? (
          <Card className="col-span-3" key={"no-results"}>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No engagements found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedEngagements.map((engagement) => (
            <div key={engagement.id}>
              <Dialog>
                <DialogTrigger asChild>
                  <Card
                    key={engagement.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex flex-row justify-between w-full">
                        <CardTitle>
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {engagement.matric_no}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {engagement.subject}
                              </p>
                            </div>
                          </div>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex flex-col items-end justify-end gap-1">
                            <Badge
                              className={
                                getSentimentColor(engagement.sentiment) +
                                " capitalize"
                              }
                            >
                              {engagement.sentiment}
                            </Badge>
                            <Badge
                              className={
                                getOutcomeColor(engagement.outcome) +
                                " capitalize"
                              }
                            >
                              {engagement.outcome?.replace("_", " ")}
                            </Badge>
                          </div>
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="md:p-6 max-h-fit">
                      {/* Body */}
                      <p className="text-sm leading-relaxed line-clamp-5">
                        {engagement.body}
                      </p>
                    </CardContent>
                    <CardFooter className="w-full">
                      <div className="flex flex-row flex-nowrap items-center justify-between gap-2 pt-2 border-t text-sm text-muted-foreground w-full">
                        <div className="flex flex-col flex-nowrap items-start gap-0">
                          <span className="font-medium text-xs capitalize">
                            {engagement.channel} by:
                          </span>{" "}
                          {engagement.handled_by}
                        </div>

                        <div className="flex flex-row flex-nowrap items-end gap-2 italic">
                          {new Date(engagement.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            }
                          )}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </DialogTrigger>
                <DialogContent className="lg:max-w-2xl w-full max-w-[90vw]">
                  <DialogHeader>
                    <DialogTitle>{engagement.matric_no}</DialogTitle>
                    <DialogDescription>{engagement.subject}</DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <div className="text-sm leading-relaxed">
                      {engagement.body}
                    </div>
                    <div className="flex flex-row flex-nowrap items-center justify-between gap-2 pt-2 border-t text-sm text-muted-foreground w-full">
                      <div className="flex flex-col flex-nowrap items-start gap-0">
                        <span className="font-medium text-xs capitalize">
                          {engagement.channel} by:
                        </span>{" "}
                        {engagement.handled_by}
                      </div>

                      <div className="flex flex-row flex-nowrap items-end gap-2 italic">
                        {new Date(engagement.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          }
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="link"
                      onClick={() =>
                        window.open(
                          `/student/${engagement.matric_no}`,
                          "_blank"
                        )
                      }
                      className="flex flex-row items-center gap-2 hover:gap-[15rem] transition-all duration-200 ease-in-out"
                    >
                      Go to Student Page
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))
        )}
      </div>
      {filteredEngagements.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex flex-row items-center justify-between gap-4 py-3">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9 h-9 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
