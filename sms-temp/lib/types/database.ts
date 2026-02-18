// 1. Core Student Record
export interface Student {
  matric_no: string; // Primary Key
  full_name: string;
  email: string | null;
  phone: string | null;
  intake_code: string;
  study_mode: string;
  status: string;
  faculty_code: string | null;
  programme_name: string | null;
  sst_id: number | null; // Foreign Key to SST table
  created_at: string; // ISO Timestamp
  a_engagements: Engagement[] | null;
  a_payments: Payment | null;
  a_lms_activity: LMSActivity | null;
}

// 2. Payment Tracking
export interface Payment {
  id: number; // Primary Key (bigint)
  matric_no: string; // Foreign Key to Student
  payment_mode: string;
  payment_status: string;
  ptptn_proof_status: boolean;
  updated_at: string;
}

// 3. LMS & Academic Progress
export interface LMSActivity {
  matric_no: string; // Primary Key & Foreign Key
  cp_w1: number;
  cp_w2: number;
  cp_w3: number;
  latest_cp: number;
  last_login_at: string | null;
  course_visits: number;
  updated_at: string;
}

// 4. Team Engagements (Interaction Logs)
export interface Engagement {
  id: string; // UUID
  matric_no: string;
  sst_id: number | null;
  topic: string;
  topic_other_remarks: string | null;
  channel: string; // e.g., 'whatsapp', 'call'
  sentiment: "Positive" | "Neutral" | "Negative" | string;
  remarks: string | null;
  outcome: string;
  next_followup_date: string | null;
  created_at: string;
}

// 5. Helper Type for Dashboard Rows (Joined Data)
export type StudentDashboardRow = Student & {
  lms?: LMSActivity;
  payment?: Payment;
  engagements?: Engagement[];
};
