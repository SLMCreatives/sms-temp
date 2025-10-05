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

const supabase = createClient();

const ITEMS_PER_PAGE = 12;

export default function EngagementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<{ engagements: Engagements[] }>({
    engagements: []
  });

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("students")
        .select("*, engagements(*)")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        console.log("Fetched data:", data);
        setData({
          engagements: data?.flatMap((student) => student.engagements) || []
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
        engagement.handled_by.toLowerCase().includes(searchLower);

      // Channel filter
      const matchesChannel =
        channelFilter === "all" || engagement.channel === channelFilter;

      // Sentiment filter
      const matchesSentiment =
        sentimentFilter === "all" || engagement.sentiment === sentimentFilter;

      // Outcome filter
      const matchesOutcome =
        outcomeFilter === "all" || engagement.outcome === outcomeFilter;

      return (
        matchesSearch && matchesChannel && matchesSentiment && matchesOutcome
      );
    });
  }, [
    data.engagements,
    searchQuery,
    channelFilter,
    sentimentFilter,
    outcomeFilter
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
  };

  const hasActiveFilters =
    searchQuery ||
    channelFilter !== "all" ||
    sentimentFilter !== "all" ||
    outcomeFilter !== "all";

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

  const gotoStudentPage = (matric_no: string) => {
    // Open new window to student page
    window.open(`/student/${matric_no}`, "_blank");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Student Engagements</h1>
        <p className="text-muted-foreground">
          Search and filter all student feedback and engagements
        </p>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Search and filter engagements by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by matric no, subject, body, or handler..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-fit">
            <div>
              <label className="text-sm font-medium mb-2 block">Channel</label>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Sentiment
              </label>
              <Select
                value={sentimentFilter}
                onValueChange={setSentimentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sentiments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Outcome</label>
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All outcomes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All outcomes</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full md:w-auto bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredEngagements.length > 0 ? startIndex + 1 : 0}-
        {Math.min(endIndex, filteredEngagements.length)} of{" "}
        {filteredEngagements.length} engagements
      </div>

      {filteredEngagements.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
          <Card className="">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No engagements found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedEngagements.map((engagement) => (
            <Card
              key={engagement.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                gotoStudentPage(engagement.matric_no);
              }}
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
                          getOutcomeColor(engagement.outcome) + " capitalize"
                        }
                      >
                        {engagement.outcome.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 min-h-[150px]">
                <div className="space-y-3">
                  {/* Body */}
                  <p className="text-sm leading-relaxed line-clamp-5">
                    {engagement.body}
                  </p>
                </div>
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
          ))
        )}
      </div>
      {filteredEngagements.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
