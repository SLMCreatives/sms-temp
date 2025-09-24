import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Label } from "./ui/label";
import { Students } from "@/app/student/studentColumns";

type StudentStatus = "Active" | "At-Risk" | "Withdrawn" | "Deferred";

interface ChangeStatusFormProps {
  student: Students;
}

const STATUS_OPTIONS: StudentStatus[] = [
  "Active",
  "At-Risk",
  "Withdrawn",
  "Deferred"
];

export default function ChangeStatusForm({ student }: ChangeStatusFormProps) {
  const [status, setStatus] = useState<StudentStatus>(
    student.status as StudentStatus
  );

  const handleStatusChange = (value: string) => {
    // Validate that the value is a valid StudentStatus
    if (STATUS_OPTIONS.includes(value as StudentStatus)) {
      setStatus(value as StudentStatus);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-h-[500px]">
      <div className="grid grid-cols-2 gap-2 px-10 container w-full py-4">
        <Label className="text-lg font-bold" htmlFor="status">
          New Status
        </Label>
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
