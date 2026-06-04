import { StudentAttritionDashboard } from "@/components/student-attrition-dashboard";
import { getData } from "../student/getData";

export default async function Page() {
  const data = await getData();

  return (
    <div className="w-full">
      <StudentAttritionDashboard data={data} />
    </div>
  );
}
