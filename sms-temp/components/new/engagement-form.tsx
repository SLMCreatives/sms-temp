"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircleMore, MessageSquare, Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Maps auth user full_name to the numeric sst_id in the database
const SST_NAME_TO_ID: Record<string, number> = {
  Amirul: 1,
  Farzana: 2,
  Najwa: 3,
  Ayu: 4,
  Miru: 6
};

interface EngagementFormData {
  matric_no: string;
  sst_id: number | null;
  topic: string;
  topic_other_remarks: string | null;
  channel: string;
  remarks: string | null;
  outcome: string; // stores the status value (Contacted, Responded, etc.)
}

interface EngagementFormProps {
  matric_no: string;
}

export function NewEngagementForm({ matric_no }: EngagementFormProps) {
  const [formData, setFormData] = useState<EngagementFormData>({
    matric_no: matric_no,
    sst_id: null,
    topic: "",
    topic_other_remarks: null,
    channel: "whatsapp",
    remarks: "",
    outcome: ""
  });

  // Display-only — not submitted to DB
  const [handledByName, setHandledByName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const fullName: string =
        data.user.user_metadata?.full_name ?? data.user.email ?? "";
      setHandledByName(fullName);

      // Match the name to a known sst_id; try exact match then partial
      const exactId = SST_NAME_TO_ID[fullName];
      if (exactId) {
        setFormData((prev) => ({ ...prev, sst_id: exactId }));
        return;
      }
      const partialKey = Object.keys(SST_NAME_TO_ID).find((name) =>
        fullName.toLowerCase().includes(name.toLowerCase())
      );
      if (partialKey) {
        setFormData((prev) => ({
          ...prev,
          sst_id: SST_NAME_TO_ID[partialKey]
        }));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await supabase.from("a_engagements").insert([formData]);
    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        matric_no: matric_no,
        sst_id: formData.sst_id,
        topic: "",
        topic_other_remarks: null,
        channel: "whatsapp",
        remarks: "",
        outcome: ""
      });
      router.refresh();
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
      case "teams":
        return "🟣";
      default:
        return "💬";
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen dark:bg-black flex items-center justify-center px-4">
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
    <div className="min-h-screen dark:bg-black">
      <div className="container mx-auto px-4 pb-6 md:py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Student & Engagement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="matric_no" className="text-sm font-medium">
                    Student Matric Number
                  </Label>
                  <Input
                    id="matric_no"
                    value={formData.matric_no}
                    readOnly
                    className="w-full text-left"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handled_by" className="text-sm font-medium">
                    Handled By
                  </Label>
                  <Input
                    id="handled_by"
                    value={handledByName}
                    readOnly
                    placeholder="Loading..."
                    className="w-full bg-muted text-muted-foreground"
                  />
                </div>
              </div>

              <Separator />

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
                    <SelectItem value="call">
                      <div className="flex items-center gap-2">
                        <span>{getChannelIcon("call")}</span>
                        Call
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <span>{getChannelIcon("email")}</span>
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="teams">
                      <div className="flex items-center gap-2">
                        <span>{getChannelIcon("teams")}</span>
                        Teams
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Interaction Details */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <MessageCircleMore className="w-5 h-5" />
                Interaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Student Status / Engagement *
                </Label>
                <Select
                  value={formData.outcome}
                  onValueChange={(value) => updateFormData("outcome", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contacted">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Contacted
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Responded">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Responded
                      </Badge>
                    </SelectItem>
                    <SelectItem value="No Response">
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        No Response
                      </Badge>
                    </SelectItem>
                    <SelectItem value="In Progress">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        In Progress
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Resolved">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Resolved
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Escalated">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        Escalated
                      </Badge>
                    </SelectItem>
                    <SelectItem value="At Risk">
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        At Risk
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Topic *</Label>
                <Select
                  value={formData.topic}
                  onValueChange={(value) => {
                    updateFormData("topic", value);
                    if (value !== "Others") {
                      updateFormData("topic_other_remarks", null);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Onboarding Pulse Check">
                      Onboarding Pulse Check
                    </SelectItem>
                    <SelectItem value="CN Engagement Check">
                      CN Engagement Check
                    </SelectItem>
                    <SelectItem value="PTPTN Pulse Check">
                      PTPTN Pulse Check
                    </SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.topic === "Others" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="topic_other_remarks"
                    className="text-sm font-medium"
                  >
                    Specify Topic *
                  </Label>
                  <Input
                    id="topic_other_remarks"
                    placeholder="Describe the topic"
                    value={formData.topic_other_remarks ?? ""}
                    onChange={(e) =>
                      updateFormData("topic_other_remarks", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-sm font-medium">
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  placeholder="Write down student response and summary of the engagement. Include important details, student concerns, and any follow-up actions required."
                  value={formData.remarks ?? ""}
                  onChange={(e) => updateFormData("remarks", e.target.value)}
                  className="min-h-[120px] w-full resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.outcome ||
                !formData.topic ||
                (formData.topic === "Others" && !formData.topic_other_remarks)
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
