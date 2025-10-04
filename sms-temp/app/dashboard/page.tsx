import { StudentAttritionDashboard } from "@/components/student-attrition-dashboard";

export default function Page() {
  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start">
      <StudentAttritionDashboard />
    </div>
  );
}
