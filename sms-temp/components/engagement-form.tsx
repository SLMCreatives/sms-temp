"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  MessageCircleMore,
  MessageSquare,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface EngagementFormData {
  matric_no: string;
  channel: string;
  direction: string;
  subject: string;
  body: string;
  handled_by: string;
  sentiment: string;
  outcome: string;
  next_action_date: Date | undefined;
}

export function EngagementForm() {
  const [formData, setFormData] = useState<EngagementFormData>({
    matric_no: "",
    channel: "whatsapp",
    direction: "outbound",
    subject: "",
    body: "",
    handled_by: "",
    sentiment: "",
    outcome: "",
    next_action_date: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await supabase.from("engagements").insert([formData]);
    // Simulate API call
    //await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        matric_no: "",
        channel: "whatsapp",
        direction: "",
        subject: "",
        body: "",
        handled_by: "",
        sentiment: "",
        outcome: "",
        next_action_date: undefined
      });
    }, 3000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFormData = (field: keyof EngagementFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return "💬";
      case "email":
        return "📧";
      case "call":
        return "📞";
      case "sms":
        return "💬";
      case "lms":
        return "🎓";
      default:
        return "💬";
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Engagement Submitted!
            </h2>
            <p className="text-muted-foreground">
              Your student engagement has been successfully recorded and will be
              processed shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pb-6 md:py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <Card className="shadow-sm">
            <CardHeader className="">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Student & Engagement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="matric_no" className="text-sm font-medium">
                    Student Matric Number *
                  </Label>
                  <Input
                    id="matric_no"
                    placeholder="e.g., MC250930001"
                    value={formData.matric_no}
                    onChange={(e) =>
                      updateFormData("matric_no", e.target.value)
                    }
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handled_by" className="text-sm font-medium">
                    Handled By
                  </Label>
                  <Input
                    id="handled_by"
                    placeholder="Your name"
                    value={formData.handled_by}
                    onChange={(e) =>
                      updateFormData("handled_by", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Communication Channel *
                  </Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(value) => updateFormData("channel", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center gap-2">
                          <span>{getChannelIcon("whatsapp")}</span>
                          WhatsApp
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <span>{getChannelIcon("email")}</span>
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="call">
                        <div className="flex items-center gap-2">
                          <span>{getChannelIcon("call")}</span>
                          Phone Call
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <span>{getChannelIcon("sms")}</span>
                          SMS
                        </div>
                      </SelectItem>
                      <SelectItem value="lms">
                        <div className="flex items-center gap-2">
                          <span>{getChannelIcon("lms")}</span>
                          LMS
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 hidden">
                  <Label className="text-sm font-medium">Direction *</Label>
                  <Select
                    value={formData.direction}
                    onValueChange={(value) =>
                      updateFormData("direction", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">
                        Inbound (Student contacted us)
                      </SelectItem>
                      <SelectItem value="outbound">
                        Outbound (We contacted student)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sentiment</Label>
                  <Select
                    value={formData.sentiment}
                    onValueChange={(value) =>
                      updateFormData("sentiment", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Positive
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="neutral">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                            Neutral
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="negative">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            Negative
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interaction Details */}
          <Card className="shadow-sm">
            <CardHeader className="">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <MessageCircleMore className="w-5 h-5" />
                Interaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject/Topic
                </Label>
                <Input
                  id="subject"
                  placeholder="Brief description of the topic discussed"
                  value={formData.subject}
                  onChange={(e) => updateFormData("subject", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body" className="text-sm font-medium">
                  Detailed Notes
                </Label>
                <Textarea
                  id="body"
                  placeholder="Provide detailed notes about the interaction, including key points discussed, student concerns, and any actions taken..."
                  value={formData.body}
                  onChange={(e) => updateFormData("body", e.target.value)}
                  className="min-h-[120px] w-full resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Outcome</Label>
                  <Select
                    value={formData.outcome}
                    onValueChange={(value) => updateFormData("outcome", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resolved">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Resolved
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="followup">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Follow-up Needed
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="no_response">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                            No Response
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="escalated">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            Escalated
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Next Action Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.next_action_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.next_action_date ? (
                          format(formData.next_action_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.next_action_date}
                        onSelect={(date) =>
                          updateFormData("next_action_date", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isSubmitting || !formData.matric_no || !formData.direction
              }
              className="w-full md:w-auto px-8"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Engagement
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
