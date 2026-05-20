import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type CacheEntry = {
  matric_no: string
  opp_id?: string
  [key: string]: unknown
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entries: CacheEntry[] = body?.entries

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'entries must be a non-empty array' }, { status: 400 })
    }

    const rows = entries
      .filter((e) => e.matric_no)
      .map((e) => ({
        matric_no: e.matric_no,
        opp_id: e.opp_id ?? null,
      }))

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No entries had a valid matric_no' }, { status: 400 })
    }

    const supabase = await createClient()

    const results = await Promise.all(
      rows.map((row) =>
        supabase
          .from('a_students')
          .update({ opp_id: row.opp_id })
          .eq('matric_no', row.matric_no)
      )
    )

    const firstError = results.find((r) => r.error)?.error
    if (firstError) {
      return NextResponse.json(
        { error: firstError.message, details: firstError.details, hint: firstError.hint, code: firstError.code },
        { status: 500 }
      )
    }

    return NextResponse.json({ count: rows.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
