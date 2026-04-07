import { StudentAttritionDashboard } from "@/components/student-attrition-dashboard";
import { getData } from "../../student/getData";

export default async function Page() {
  const data = await getData();

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-5xl items-start justify-start">
      <StudentAttritionDashboard data={data} />
    </div>
  );
}
