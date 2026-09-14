-- Backfill the onboarding check for the Sept (Sep-26) intake from the
-- engagements the team already logged, so they do not have to re-tick 72
-- students by hand.
--
-- Rule (confirmed with the SST manager):
--   ticked   -> the student replied at some point. 'Responded', plus
--               'no_issue' (the old form's "call went fine"), 'Escalated' and
--               'At Risk' — you cannot escalate or flag a student at risk
--               without having reached them.
--   untouched-> 'Contacted' and 'No Response' mean no reply, and students with
--               no engagements at all stay unticked.
--
-- "Ever responded" wins over "latest outcome": one student (MC260944968) has
-- ['Responded', 'no_issue'] and a later follow-up should not undo the fact
-- that they replied.
--
-- Expected on the current data:
--   1293 Sep-26 students · 137 engaged · 72 ticked · 65 engaged-but-not-ticked
--   · 1156 with no engagements.
--
-- Only ever sets the flag to true, so it is safe to re-run and will not undo a
-- tick someone has since made in the app.

begin;

with responded as (
  select distinct on (e.matric_no)
         e.matric_no,
         e.created_at,
         e.sst_id
    from public.a_engagements e
    join public.a_students   s on s.matric_no = e.matric_no
   where s.intake_code = 'Sep-26'
     and e.outcome in ('Responded', 'no_issue', 'Escalated', 'At Risk')
   -- earliest qualifying engagement = when they first replied
   order by e.matric_no, e.created_at asc
)
update public.a_students s
   set onboarding_checked    = true,
       onboarding_checked_at = r.created_at,
       onboarding_checked_by = r.sst_id
  from responded r
 where s.matric_no = r.matric_no
   and s.onboarding_checked is distinct from true;

commit;

-- Verify: expect ticked = 72, and 0 ticked rows among students with no
-- qualifying engagement.
select
  count(*) filter (where onboarding_checked)                       as ticked,
  count(*) filter (where not onboarding_checked)                   as not_ticked,
  count(*)                                                         as total
from public.a_students
where intake_code = 'Sep-26';
