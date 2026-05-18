import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
        a_students!matric_no (
          full_name,
          email,
          phone,
          intake_code
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const flat = (engagements ?? []).map((e: any) => ({
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
      student_name: e.a_students?.full_name ?? '',
      student_email: e.a_students?.email ?? '',
      student_phone: e.a_students?.phone ?? '',
      intake_code: e.a_students?.intake_code ?? '',
      sst_name: e.sst_id ? (SST_NAMES[e.sst_id] ?? '') : '',
    }))

    return NextResponse.json({ data: flat })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
