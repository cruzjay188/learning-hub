-- ════════════════════════════════════════════════════════════════════════════
-- Security hardening (docs/security-rules.md §12, findings 3–5)
--
-- 3. user_id is filled in by the database (default auth.uid()), so the front end never sends it.
--    The "with check (user_id = auth.uid())" policies already refuse a forged value; this makes
--    the database, not the browser, the source of the owner.
-- 4. jsonb columns get a size limit, so nobody can store megabytes in a progress row.
-- 5. profiles: students may change their display name, nothing else (not id, not created_at).
-- ════════════════════════════════════════════════════════════════════════════

-- 3. the owner comes from the login, not from the request
alter table public.lecture_progress  alter column user_id set default auth.uid();
alter table public.assignment_status alter column user_id set default auth.uid();
alter table public.study_days        alter column user_id set default auth.uid();
alter table public.student_settings  alter column user_id set default auth.uid();

-- 4. size limits on the jsonb columns (a full lecture's ticks are well under 1 KB)
alter table public.lecture_progress
  add constraint lecture_progress_steps_size  check (pg_column_size(steps)  <= 16384),
  add constraint lecture_progress_recall_size check (pg_column_size(recall) <= 16384);

-- 5. only the display name can be changed
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;
