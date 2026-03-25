/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { StudentDashboardRow } from "@/lib/types/database";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../ui/card";

const supabase = createClient();

/* export async function updateStudentData(
  tableName: string,
  matric_no: string,
  updates: Record<string, any>
) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq("matric_no", matric_no)
      .select();

    if (error) {
      console.log(`Error updating ${tableName}:`, error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.log(`Failed to update ${tableName}:`, error);
    throw error;
  }
} */

export async function updateStudentData(
  tableName: string,
  matric_no: string,
  updates: Record<string, any>
) {
  try {
    // Special handling for a_payments:
    // update if row exists, otherwise insert new row
    if (tableName === "a_payments") {
      const { data: existingRow, error: fetchError } = await supabase
        .from("a_payments")
        .select("matric_no")
        .eq("matric_no", matric_no)
        .maybeSingle();

      if (fetchError) {
        console.log("Error checking a_payments row:", fetchError);
        throw fetchError;
      }

      if (existingRow) {
        const { data, error } = await supabase
          .from("a_payments")
          .update(updates)
          .eq("matric_no", matric_no)
          .select();

        if (error) {
          console.log("Error updating a_payments:", error);
          throw error;
        }

        return { success: true, action: "updated", data };
      }

      const { data, error } = await supabase
        .from("a_payments")
        .insert({
          matric_no,
          ...updates
        })
        .select();

      if (error) {
        console.log("Error inserting into a_payments:", error);
        throw error;
      }

      return { success: true, action: "inserted", data };
    }

    // Default update flow for other tables
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq("matric_no", matric_no)
      .select();

    if (error) {
      console.log(`Error updating ${tableName}:`, error);
      throw error;
    }
    return { success: true, action: "updated", data };
  } catch (error) {
    console.log(`Failed to update ${tableName}:`, error);
    throw error;
  }
}

export default function EditStudent({
  student
}: {
  student: StudentDashboardRow;
}) {
  const router = useRouter();

  const [studentLoading, setStudentLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [studentChanges, setStudentChanges] = useState<Record<string, any>>({});
  const [paymentChanges, setPaymentChanges] = useState<Record<string, any>>({});
  const [open, setOpen] = useState(false);

  const profile = [
    {
      value: student.phone,
      label: "Phone",
      editable: false,
      table: "a_students"
    },
    {
      value: student.status,
      label: "Status",
      editable: true,
      options: ["Active", "Withdraw", "Deferred", "At Risk"],
      table: "a_students"
    },
    {
      value: student.a_payments?.payment_mode,
      label: "Payment Mode",
      editable: true,
      options: ["PTPTN", "Self", "Others"],
      table: "a_payments"
    },
    {
      value: student.a_payments?.payment_status,
      label: "Payment Status",
      editable: true,
      options: ["Not Paid", "Pending", "Paid"],
      table: "a_payments"
    },
    {
      value: student.a_payments?.ptptn_proof_status,
      label: "PTPTN Proof",
      editable: true,
      options: ["TRUE", "FALSE"],
      table: "a_payments"
    },
    {
      value: student.sst_id,
      label: "Assigned SST",
      editable: true,
      options: ["1", "2", "3", "4", "5"],
      table: "a_students"
    }
  ];

  const sstMembers = [
    { value: "1", label: "Amirul" },
    { value: "2", label: "Farzana" },
    { value: "3", label: "Najwa" },
    { value: "4", label: "Ayu" },
    { value: "5", label: "Miru" }
  ];

  const studentFields = profile.filter((item) => item.table === "a_students");
  const paymentFields = profile.filter((item) => item.table === "a_payments");

  const getColumnName = (fieldLabel: string, tableName: string): string => {
    const columnMap: Record<string, Record<string, string>> = {
      a_students: {
        Name: "full_name",
        "Matric No": "matric_no",
        Phone: "phone",
        Status: "status",
        "Assigned SST": "sst_id"
      },
      a_payments: {
        "Payment Mode": "payment_mode",
        "Payment Status": "payment_status",
        "PTPTN Proof": "ptptn_proof_status"
      }
    };

    return columnMap[tableName]?.[fieldLabel] || fieldLabel;
  };

  const handleValueChange = (
    tableName: string,
    fieldLabel: string,
    newValue: string
  ) => {
    if (tableName === "a_students") {
      setStudentChanges((prev) => ({
        ...prev,
        [fieldLabel]: newValue
      }));
    }

    if (tableName === "a_payments") {
      setPaymentChanges((prev) => ({
        ...prev,
        [fieldLabel]: newValue
      }));
    }
  };

  const handleCancel = () => {
    setStudentChanges({});
    setPaymentChanges({});
    setOpen(false);
  };

  const handleSaveStudents = async () => {
    try {
      setStudentLoading(true);

      if (Object.keys(studentChanges).length === 0) {
        toast("Please make changes to student details before saving.");
        return;
      }

      const updates: Record<string, any> = {};

      studentFields.forEach((item) => {
        if (studentChanges[item.label] !== undefined) {
          const columnName = getColumnName(item.label, "a_students");
          updates[columnName] = studentChanges[item.label];
        }
      });

      await updateStudentData("a_students", student.matric_no, updates);

      toast("Student details updated successfully!");
      router.refresh();
      setStudentChanges({});
    } catch (error) {
      toast("Error saving student details: " + error);
    } finally {
      setStudentLoading(false);
    }
  };

  const handleSavePayments = async () => {
    try {
      setPaymentLoading(true);

      if (Object.keys(paymentChanges).length === 0) {
        toast("Please make changes to payment details before saving.");
        return;
      }

      const updates: Record<string, any> = {};

      paymentFields.forEach((item) => {
        if (paymentChanges[item.label] !== undefined) {
          const columnName = getColumnName(item.label, "a_payments");
          updates[columnName] = paymentChanges[item.label];
        }
      });

      await updateStudentData("a_payments", student.matric_no, updates);

      toast("Payment details updated successfully!");
      router.refresh();
      setPaymentChanges({});
    } catch (error) {
      toast("Error saving payment details: " + error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderField = (item: (typeof profile)[number], index: number) => {
    return (
      <div key={index} className="flex flex-col">
        <div className="text-xs italic">{item.label}</div>

        {item.editable === false && (
          <div className="text-sm font-bold">{item.value}</div>
        )}

        {item.editable === true &&
          item.label !== "Assigned SST" &&
          item.options && (
            <Select
              onValueChange={(value) =>
                handleValueChange(item.table, item.label, value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={item.value || "Select"} />
              </SelectTrigger>
              <SelectContent>
                {item.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

        {item.label === "Assigned SST" && (
          <Select
            onValueChange={(value) =>
              handleValueChange(item.table, item.label, value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={item.value || "Select SST"} />
            </SelectTrigger>
            <SelectContent>
              {sstMembers.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={"secondary"} size="lg" className="group">
            <Settings className="w-6 h-6 group-hover:animate-spin" />
          </Button>
        </DialogTrigger>

        <DialogContent className="dark:bg-black bg-zinc-50 text-black dark:text-white dark:border dark:border-white">
          <DialogTitle>Update Student Information</DialogTitle>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold -mb-2 overflow-hidden text-ellipsis whitespace-nowrap w-full capitalize">
                {student.full_name}
              </CardTitle>
              <CardDescription className="w-full">
                {student.matric_no}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Student Section */}
              <Card className="w-full">
                <CardHeader className="sr-only">
                  <CardTitle>Student Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                  {studentFields.map((item, index) => renderField(item, index))}

                  <Button
                    variant={"outline"}
                    onClick={handleSaveStudents}
                    disabled={studentLoading}
                  >
                    {studentLoading ? "Saving..." : "Save"}
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card className="w-full">
                <CardHeader className="sr-only">
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                  {paymentFields.map((item, index) => renderField(item, index))}

                  <Button
                    variant={"outline"}
                    onClick={handleSavePayments}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? "Saving..." : "Save"}
                  </Button>
                </CardContent>
              </Card>
            </CardContent>

            <CardFooter className="w-full justify-center space-x-2 hidden">
              <Button onClick={handleCancel} variant="outline">
                Close
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}
