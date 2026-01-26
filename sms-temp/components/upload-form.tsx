/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface UploadFormProps {
  onSuccess: () => void;
}

interface CSVRow {
  matric_no: string;
  last_login_at: string;
  course_progress: number;
  submitted_assignments: number;
  srb_progress: number;
  course_visits: number;
  created_at: string;
  updated_at: string;
}

const supabase = createClient();

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState<{
    total: number;
    updated: number;
    inserted: number;
    errors: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setUploadStats(null);
    } else {
      toast("Please select a valid CSV file.");
    }
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      rows.push(row as CSVRow);
    }

    return rows;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast("Please select a CSV file to upload.");
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setUploadStats({ total: 0, updated: 0, inserted: 0, errors: 0 });

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      const stats = { total: rows.length, updated: 0, inserted: 0, errors: 0 };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        setProgress(((i + 1) / rows.length) * 100);

        try {
          // Check if record exists with this matric_no
          const { data: existing } = await supabase
            .from("jan26_lms_activity")
            .select("id")
            .eq("matric_no", row.matric_no.toUpperCase())
            .single();

          const recordData = {
            //matric_no: row.matric_no.toUpperCase(),
            last_login_at: row.last_login_at ? row.last_login_at : null,
            course_progress: row.course_progress,
            submitted_assignments: row.submitted_assignments,
            srb_progress: row.srb_progress,
            course_visits: row.course_visits
            //updated_at: new Date().toISOString()
          };

          const newrecordData = {
            matric_no: row.matric_no.toUpperCase(),
            last_login_at: row.last_login_at ? row.last_login_at : null,
            course_progress: row.course_progress,
            submitted_assignments: row.submitted_assignments,
            srb_progress: row.srb_progress,
            course_visits: row.course_visits
            //updated_at: new Date().toISOString()
          };

          if (existing) {
            // Update existing record
            const { error } = await supabase
              .from("jan26_lms_activity")
              .update(recordData)
              .eq("matric_no", row.matric_no.toUpperCase());

            if (error) throw error;
            stats.updated++;
          } else {
            // Insert new record
            const { error } = await supabase.from("jan26_lms_activity").insert([
              {
                ...newrecordData
              }
            ]);

            if (error) throw error;
            stats.inserted++;
          }
        } catch (error) {
          console.log(`Error processing row ${i + 1}:`, error);
          stats.errors++;
        }
      }

      setUploadStats(stats);
      toast(
        `Processed ${stats.total} records: ${stats.inserted} inserted, ${stats.updated} updated, ${stats.errors} errors.`
      );

      setFile(null);
      onSuccess();
    } catch (error) {
      console.log("Upload error:", error);
      toast(
        "Failed to process CSV file. Please check the format and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          CSV file should include headers: matric_no, last_login_at,
          course_progress, submitted_assignments, srb_progress, course_visits
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">Upload CSV File</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="csv-file"
                  className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {file ? (
                    <>
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="text-sm text-muted-foreground">
                        Click to select CSV file
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {uploadStats && !isLoading && (
          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Upload Summary:</p>
                <ul className="text-sm space-y-1">
                  <li>Total Records: {uploadStats.total}</li>
                  <li className="text-green-600">
                    New Records Inserted: {uploadStats.inserted}
                  </li>
                  <li className="text-blue-600">
                    Existing Records Updated: {uploadStats.updated}
                  </li>
                  {uploadStats.errors > 0 && (
                    <li className="text-red-600">
                      Errors: {uploadStats.errors}
                    </li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isLoading || !file} className="w-full">
          {isLoading ? "Processing CSV..." : "Upload and Update Table"}
        </Button>
      </form>
    </div>
  );
}
