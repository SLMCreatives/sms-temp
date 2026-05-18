export type Engagement = {
  id: string
  matric_no: string
  sst_id: number
  topic: string | null
  topic_other_remarks: string | null
  channel: string | null
  sentiment: string | null
  remarks: string | null
  outcome: string | null
  next_followup_date: string | null
  created_at: string
  // Joined fields
  student_name?: string
  student_email?: string
  student_phone?: string
  sst_name?: string
  intake_code?: string
}

export type SalesforceTask = {
  engagement_id: string
  matric_no: string
  subject: string
  type: string
  sub_type: string
  due_date: string | null
  comments: string
  contact_name: string
  contact_email: string
  contact_phone: string
  assigned_sst: string
  status: string
  task_record_type: string
  outcome_original: string | null
}

const OUTCOME_TO_STATUS: Record<string, string> = {
  'no_response': 'No Reply',
  'no_issue': 'Successful',
  'followup-ro': 'Not Started',
  'followup-sales': 'Not Started',
  'withdrawn': 'Not Interested',
  'deferred': 'Not Interested',
}

export function mapEngagementToSFTask(engagement: Engagement): SalesforceTask {
  const commentParts = [
    engagement.remarks && `Remarks: ${engagement.remarks}`,
    engagement.outcome && `Outcome: ${engagement.outcome}`,
    engagement.sentiment && `Sentiment: ${engagement.sentiment}`,
    engagement.topic_other_remarks && `Other: ${engagement.topic_other_remarks}`,
  ].filter(Boolean)

  return {
    engagement_id: engagement.id,
    matric_no: engagement.matric_no,
    subject: engagement.topic || '(No Subject)',
    type: engagement.channel || '',
    sub_type: engagement.topic || '',
    due_date: engagement.next_followup_date || null,
    comments: commentParts.join('\n'),
    contact_name: engagement.student_name || '',
    contact_email: engagement.student_email || '',
    contact_phone: engagement.student_phone || '',
    assigned_sst: engagement.sst_name || '',
    status: engagement.outcome ? (OUTCOME_TO_STATUS[engagement.outcome] ?? 'Not Started') : 'Not Started',
    task_record_type: 'SST Activity',
    outcome_original: engagement.outcome,
  }
}
