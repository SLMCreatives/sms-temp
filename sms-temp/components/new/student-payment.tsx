import { BanknoteArrowUp, IdCard } from "lucide-react";
import { StudentDashboardRow } from "@/lib/types/database";

const informationTabs = [
  {
    label: "Payment Mode",
    value: "student.a_payments.payment_mode",
    icon: IdCard
  },
  {
    label: "Payment Status",
    value: "student.a_payments.payment_status",
    icon: BanknoteArrowUp
  },

  {
    label: "PTPTN Proof",
    value:
      "student.a_payments.ptptn_proof_status === true ? 'Approved' : 'No Proof'",
    icon: BanknoteArrowUp
  }
];

export default function StudentPayment({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  student
}: {
  student: StudentDashboardRow;
}) {
  return (
    <div className="space-y-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2 items-start">
        <p className="font-semibold">Payment Status</p>

        {informationTabs.map((tab) => (
          <div key={tab.value} className="flex flex-row items-center gap-3">
            {/* <p className="text-sm text-muted-foreground">{tab.label}</p> */}
            <tab.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="font-medium text-xs break-all text-right line-clamp-1">
              {eval(tab.value)}
            </p>
          </div>
        ))}
        {/*  {student.payment &&
          student.payment.payment_mode === "PTPTN" && (
            <ChangeStatusPTPTNForm student={student} />
          )} */}
      </div>
    </div>
  );
}
