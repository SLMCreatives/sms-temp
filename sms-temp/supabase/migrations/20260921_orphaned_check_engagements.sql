-- Retract engagements left behind by cleared checks.
--
-- Until now, unticking a check wrote null to the a_students column but left
-- the a_engagements row the tick had created. The history then claimed a
-- contact that had been taken back, and the engagement count was inflated.
--
-- The app now deletes the engagement when the check is cleared
-- (components/new/student-checks.tsx). This cleans up the rows written before
-- that fix: an engagement on one of the four check topics whose matching
-- column is null — i.e. nobody has an answer recorded for it any more.
--
-- Only the check-generated topics are touched. The manual engagement form
-- writes "Onboarding Pulse Check", "CN Engagement Check", "PTPTN Pulse Check"
-- and "Others", none of which appear below, so hand-written logs are safe.
--
-- Run the select first if you want to see what will go:
--
--   select e.matric_no, e.topic, e.created_at
--     from public.a_engagements e
--     join public.a_students s using (matric_no)
--    where (e.topic = 'Contacted'          and s.contacted          is null)
--       or (e.topic = 'Onboarding Check'   and s.onboarding_checked is null)
--       or (e.topic = 'Zero Login Check'   and s.login_checked      is null)
--       or (e.topic = 'PTPTN Application'  and s.ptptn_checked      is null);
--
-- Safe to run more than once.

delete from public.a_engagements e
 using public.a_students s
 where e.matric_no = s.matric_no
   and (
        (e.topic = 'Contacted'         and s.contacted          is null)
     or (e.topic = 'Onboarding Check'  and s.onboarding_checked is null)
     or (e.topic = 'Zero Login Check'  and s.login_checked      is null)
     or (e.topic = 'PTPTN Application' and s.ptptn_checked      is null)
   );
