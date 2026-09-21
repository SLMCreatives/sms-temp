-- Publish the students workspace tables so the browser gets change events.
--
-- Without this the client subscribes happily and simply never hears anything:
-- Supabase Realtime only replays rows from the `supabase_realtime`
-- publication, and new tables are not in it by default.
--
-- Replica identity is deliberately left alone. INSERT and UPDATE payloads
-- carry every column regardless; replica identity only decides how much of the
-- *old* row is sent, which the app does not read — and FULL would put a copy of
-- every row version into the WAL for no gain.
--
-- Safe to run more than once.

do $$
declare
  t text;
begin
  foreach t in array array[
    'a_students',
    'a_payments',
    'a_lms_activity',
    'a_engagements'
  ]
  loop
    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = t
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I', t
      );
    end if;
  end loop;
end $$;
