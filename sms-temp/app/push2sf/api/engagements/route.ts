import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type StudentJoin = {
  full_name: string | null
  email: string | null
  phone: string | null
  intake_code: string | null
  opp_id: string | null
}

type EngagementRow = {
  id: string
  matric_no: string
  sst_id: number | null
  topic: string | null
  topic_other_remarks: string | null
  channel: string | null
  sentiment: string | null
  remarks: string | null
  outcome: string | null
  next_followup_date: string | null
  created_at: string
  a_students: StudentJoin | StudentJoin[] | null
}

const SST_NAMES: Record<number, string> = {
  1: 'Amirul',
  2: 'Farzana',
  3: 'Najwa',
  4: 'Ayu',
  6: 'Miru',
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: engagements, error } = await supabase
      .from('a_engagements')
      .select(`
        id,
        matric_no,
        sst_id,
        topic,
        topic_other_remarks,
        channel,
        sentiment,
        remarks,
        outcome,
        next_followup_date,
        created_at,
        a_students!matric_no!inner (
          full_name,
          email,
          phone,
          intake_code,
          opp_id
        )
      `)
      .eq('a_students.intake_code', 'MAY26')
      .order('created_at', { ascending: false })

    if (error) throw error

    const flat = (engagements ?? []).map((e: EngagementRow) => {
      const student = Array.isArray(e.a_students) ? e.a_students[0] : e.a_students
      return {
        id: e.id,
        matric_no: e.matric_no,
        sst_id: e.sst_id,
        topic: e.topic,
        topic_other_remarks: e.topic_other_remarks,
        channel: e.channel,
        sentiment: e.sentiment,
        remarks: e.remarks,
        outcome: e.outcome,
        next_followup_date: e.next_followup_date,
        created_at: e.created_at,
        student_name: student?.full_name ?? '',
        student_email: student?.email ?? '',
        student_phone: student?.phone ?? '',
        intake_code: student?.intake_code ?? '',
        sst_name: e.sst_id ? (SST_NAMES[e.sst_id] ?? '') : '',
        opp_id: student?.opp_id ?? null,
      }
    })

    return NextResponse.json({ data: flat })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
