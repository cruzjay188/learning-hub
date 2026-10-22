-- ════════════════════════════════════════════════════════════════════════════
-- Learning Hub · student accounts and progress
--
-- Anyone can register (email + password). Each student gets a profile, and everything they
-- save (step ticks, ratings, notes, flip-card results, assignment statuses, study days, weekly
-- goal) lives in tables only they can read or change (row-level security on auth.uid()).
--
-- The course itself (lectures, guides, schedule) is NOT here yet: it ships with the site in
-- hub-data.json. So lecture_id / assignment_id are plain text ids from that file, not foreign keys.
--
--   auth.users 1─1 profiles 1─* lecture_progress   (one row per lecture you've touched)
--                           1─* assignment_status  (one row per assignment you've changed)
--                           1─* study_days         (one row per day you studied)
--                           1─1 student_settings   (weekly goal, catch-up done)
-- ════════════════════════════════════════════════════════════════════════════

-- Keeps updated_at current on any table that uses it.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ Profiles: one per login, made the moment someone registers               │
-- └──────────────────────────────────────────────────────────────────────────┘
create table public.profiles (
  id           uuid        primary key references auth.users (id) on delete cascade,
  display_name text        not null check (char_length(display_name) between 1 and 50),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Runs as the table owner (security definer) because the new user can't insert their own
-- profile yet. Name = the "name" sent at sign-up, else the part of the email before the @.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Student'
    ), 50)
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ What each student saves                                                  │
-- └──────────────────────────────────────────────────────────────────────────┘

-- One row per lecture: which steps are ticked, your rating, notes and flip-card results.
create table public.lecture_progress (
  user_id     uuid        not null references public.profiles (id) on delete cascade,
  lecture_id  text        not null check (char_length(lecture_id) between 1 and 80),
  steps       jsonb       not null default '{}'::jsonb,                    -- { "s1": true, "s2": true }
  notes       text        not null default '' check (char_length(notes) <= 10000),
  confidence  smallint    not null default 0 check (confidence between 0 and 5),  -- 0 = not rated
  rated_at    timestamptz,
  reviewed_at timestamptz,
  touched_at  timestamptz,                                              -- last time you ticked a step
  recall      jsonb       not null default '{"missed": [], "got": []}'::jsonb,
  updated_at  timestamptz not null default now(),
  primary key (user_id, lecture_id),
  check (jsonb_typeof(steps) = 'object'),
  check (jsonb_typeof(recall) = 'object')
);

-- Assignment statuses you set in the hub (they override the course default).
create table public.assignment_status (
  user_id       uuid        not null references public.profiles (id) on delete cascade,
  assignment_id text        not null check (char_length(assignment_id) between 1 and 120),
  status        text        not null check (status in ('todo', 'in-progress', 'check', 'done')),
  updated_at    timestamptz not null default now(),
  primary key (user_id, assignment_id)
);

-- Days you studied (the weekly goal counts these).
create table public.study_days (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day     date not null,
  primary key (user_id, day)
);

-- One row per student: weekly goal and whether the catch-up banner is done.
create table public.student_settings (
  user_id            uuid        primary key references public.profiles (id) on delete cascade,
  weekly_target      smallint    not null default 4 check (weekly_target between 1 and 7),
  onboarded_at       timestamptz,
  onboarding_skipped boolean     not null default false,
  updated_at         timestamptz not null default now()
);

create trigger lecture_progress_set_updated_at before update on public.lecture_progress for each row execute function public.set_updated_at();
create trigger assignment_status_set_updated_at before update on public.assignment_status for each row execute function public.set_updated_at();
create trigger student_settings_set_updated_at before update on public.student_settings for each row execute function public.set_updated_at();


-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ Security: you can only see and change your own rows                      │
-- └──────────────────────────────────────────────────────────────────────────┘
alter table public.profiles          enable row level security;
alter table public.lecture_progress  enable row level security;
alter table public.assignment_status enable row level security;
alter table public.study_days        enable row level security;
alter table public.student_settings  enable row level security;

-- Logged-out visitors (anon) get nothing; logged-in students get the table, filtered by the policies below.
revoke all on public.profiles, public.lecture_progress, public.assignment_status, public.study_days, public.student_settings from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.lecture_progress, public.assignment_status, public.study_days, public.student_settings to authenticated;

create policy "Read your own profile"   on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Update your own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- the same four rules on each progress table
do $$
declare t text;
begin
  foreach t in array array['lecture_progress', 'assignment_status', 'study_days', 'student_settings'] loop
    execute format('create policy "Read your own rows" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('create policy "Add your own rows" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format('create policy "Change your own rows" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create policy "Delete your own rows" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end;
$$;
