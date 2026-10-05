-- The student workspace stopped returning rows: its one query
-- (app/student/getData.tsx) embeds a_engagements(*) for every student in the
-- current intakes, and a_engagements had no index on matric_no — only its
-- primary key on id. Postgres therefore had to scan all ~12,000 engagement
-- rows once per parent student (~2,500 of them), which crossed the statement
-- timeout and came back as 57014. getData() catches the error and returns [],
-- so the page rendered "No students match these filters" instead of failing.
--
-- Measured on the live data before this migration:
--   students + payments + lms          570 ms, 2507 rows
--   the same query + a_engagements(*)  timeout at ~3 s
--
-- matric_no leads the index so the embed can seek straight to a student's
-- engagements; created_at follows because the query orders the embedded rows
-- by it, letting the same index serve the sort.
create index if not exists a_engagements_matric_no_created_at_idx
  on public.a_engagements (matric_no, created_at);

-- The same query filters a_students by intake_code, which was a sequential
-- scan over every intake in the table, not just the two on screen.
create index if not exists a_students_intake_code_idx
  on public.a_students (intake_code);
