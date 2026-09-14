-- Engagement checks replace the long "Add Engagement" form.
--
-- Three sequential checks per student, plus a free-text remarks log and an
-- at-risk flag. PTPTN deliberately has no new column here: it reuses the
-- existing a_payments.ptptn_proof_status so the "PTPTN proof pending" metric
-- and table filter keep working off a single source of truth.
--
-- Safe to run more than once.

alter table public.a_students
  add column if not exists onboarding_checked     boolean not null default false,
  add column if not exists onboarding_checked_at  timestamptz,
  add column if not exists onboarding_checked_by  bigint,
  add column if not exists login_checked          boolean not null default false,
  add column if not exists login_checked_at       timestamptz,
  add column if not exists login_checked_by       bigint,
  add column if not exists remarks                text,
  add column if not exists at_risk                boolean not null default false,
  add column if not exists at_risk_reason         text,
  add column if not exists at_risk_intent         text;

-- Intent drives the suggested status: deciding -> At Risk, defer -> Deferred,
-- withdraw -> Withdraw. Null when the student is not flagged.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'a_students_at_risk_intent_check'
  ) then
    alter table public.a_students
      add constraint a_students_at_risk_intent_check
      check (at_risk_intent is null or at_risk_intent in ('deciding', 'defer', 'withdraw'));
  end if;
end $$;

-- Status is limited to these four values everywhere in the UI. Note the
-- existing data uses 'Withdraw' (not 'Withdrawn') across 92 rows, so that
-- spelling is kept.
--
-- One row (MC260542878) currently reads 'Defer IEP', which is off-list and
-- would make the constraint below fail. Normalise anything unexpected to the
-- nearest valid value first. Review this if you have other bespoke statuses.
update public.a_students
   set status = 'Deferred'
 where status ilike 'defer%'
   and status <> 'Deferred';

update public.a_students
   set status = 'Active'
 where status is null
    or status not in ('Active', 'At Risk', 'Deferred', 'Withdraw');

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'a_students_status_check'
  ) then
    alter table public.a_students
      add constraint a_students_status_check
      check (status in ('Active', 'At Risk', 'Deferred', 'Withdraw'));
  end if;
end $$;

comment on column public.a_students.onboarding_checked is
  'Onboarding check: true = student responded / joined the onboarding session.';
comment on column public.a_students.login_checked is
  'Zero-login check: true = CN login confirmed okay. Applies to Online and Conventional.';
comment on column public.a_students.remarks is
  'Running remarks log. One textarea, newest line appended by the SST member.';

create index if not exists a_students_onboarding_checked_idx
  on public.a_students (onboarding_checked);
create index if not exists a_students_at_risk_idx
  on public.a_students (at_risk);
