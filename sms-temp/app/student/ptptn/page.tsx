import { createClient } from "@/lib/supabase/client";
import { Students } from "@/app/student/studentColumns";

const supabase = createClient();

async function getData() {
  const { data: students, error } = await supabase
    .from("jan26_students")
    .select("*, jan26_payments (*), jan26_lms_activity (*)");
  if (error) {
    console.log("Error fetching data:", error.message);
    return [];
  }
  return students as Students[];
}

export default async function PTPTNpage() {
  const data = await getData();
  const ptptn = data.filter(
    (student) => student.jan26_payment.payment_mode === "PTPTN"
  );
  console.log(ptptn.length);
  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start gap-4 px-8 py-6 ring">
      <p className="text-3xl italic font-bold">PTPTN</p>
      <p className="text-lg font-bold">PTPTN Page</p>
      <div className="flex flex-col gap-2 lg:grid grid-cols-2 pb-4 border-b-2 border-b-foreground/10">
        <p className="lg:col-span-2">
          <span className="font-bold">Total:</span> {ptptn.length}
        </p>
      </div>
    </div>
  );
}
