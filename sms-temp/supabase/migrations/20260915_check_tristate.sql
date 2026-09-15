-- Let the team report a negative outcome on each check.
--
-- Until now each check was a plain boolean, so "false" meant both "we have not
-- asked yet" and "we asked and they have not done it". Those need to be told
-- apart: the first is outstanding work, the second is a resolved answer.
--
-- New meaning for all three checks:
--   null  -> not actioned yet   (outstanding)
--   true  -> confirmed done     (joined / logged in / applied)
--   false -> reported not done  (did not join / no CN login / not applied)
--
-- Existing data: 'false' today only ever meant "not actioned yet" (the column
-- defaulted to false and nothing wrote false deliberately), so it converts to
-- null. The 73 'true' rows from the Sept backfill are left untouched.
--
-- Safe to run more than once.

begin;

alter table public.a_students
  alter column onboarding_checked drop default,
  alter column onboarding_checked drop not null,
  alter column login_checked      drop default,
  alter column login_checked      drop not null;

update public.a_students
   set onboarding_checked = null
 where onboarding_checked = false;

update public.a_students
   set login_checked = null
 where login_checked = false;

-- PTPTN keeps a_payments.ptptn_proof_status as the record of "proof received",
-- but that column cannot express "asked, and they have not applied". This holds
-- the SST's answer; the app writes both so the existing payment metric and the
-- CSV export stay correct.
alter table public.a_students
  add column if not exists ptptn_checked    boolean,
  add column if not exists ptptn_checked_at timestamptz,
  add column if not exists ptptn_checked_by bigint;

-- Carry over any proof already on file as a confirmed 'yes'.
update public.a_students s
   set ptptn_checked    = true,
       ptptn_checked_at = p.updated_at
  from public.a_payments p
 where p.matric_no = s.matric_no
   and p.ptptn_proof_status is true
   and s.ptptn_checked is null;

comment on column public.a_students.onboarding_checked is
  'Onboarding check. null = not actioned, true = joined/responded, false = did not join.';
comment on column public.a_students.login_checked is
  'Zero-login check. null = not actioned, true = CN login confirmed, false = still no login.';
comment on column public.a_students.ptptn_checked is
  'PTPTN check. null = not actioned, true = applied + proof, false = not applied yet.';

commit;

-- Verify: expect pending/confirmed/declined to add up to the intake total.
select
  count(*) filter (where onboarding_checked is null)  as onboarding_pending,
  count(*) filter (where onboarding_checked is true)  as onboarding_yes,
  count(*) filter (where onboarding_checked is false) as onboarding_no,
  count(*)                                            as total
from public.a_students
where intake_code = 'Sep-26';
