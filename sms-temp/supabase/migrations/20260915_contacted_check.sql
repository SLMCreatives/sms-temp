-- Adds a "contacted" step in front of the onboarding check.
--
-- The split matters: "contacted" records that the SST reached out, while the
-- onboarding check records whether the student responded. Previously a blank
-- onboarding check could not tell "we have not called them yet" from
-- "we called and heard nothing".
--
-- Unlike the other three this is a simple yes/not-yet flag — there is no
-- "did not contact" state, since that is just the absence of a tick.
--
-- Safe to run more than once.

begin;

alter table public.a_students
  add column if not exists contacted    boolean,
  add column if not exists contacted_at timestamptz,
  add column if not exists contacted_by bigint;

-- Backfill 1: anyone with an answered onboarding check must have been
-- contacted, otherwise the sequence would show step 2 done while step 1 is
-- outstanding.
update public.a_students
   set contacted    = true,
       contacted_at = coalesce(contacted_at, onboarding_checked_at),
       contacted_by = coalesce(contacted_by, onboarding_checked_by)
 where onboarding_checked is not null
   and contacted is distinct from true;

-- Backfill 2: any student with a logged engagement was reached at least once.
-- This is what picks up the students whose engagement outcome was 'Contacted'
-- (reached, no reply) — they belong in step 1, not step 2.
update public.a_students s
   set contacted    = true,
       contacted_at = coalesce(s.contacted_at, e.first_at)
  from (
    select matric_no, min(created_at) as first_at
      from public.a_engagements
     group by matric_no
  ) e
 where e.matric_no = s.matric_no
   and s.contacted is distinct from true;

comment on column public.a_students.contacted is
  'Step 0 of the check sequence: true = the SST has reached out. null = not yet. There is no false state.';

create index if not exists a_students_contacted_idx
  on public.a_students (contacted);

commit;

-- Verify: contacted should be >= the number with an answered onboarding check.
select
  count(*) filter (where contacted is true)           as contacted,
  count(*) filter (where onboarding_checked is not null) as onboarding_answered,
  count(*)                                            as total
from public.a_students
where intake_code = 'Sep-26';
