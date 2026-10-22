-- Learning Hub starter schema for Supabase.
-- Shared curriculum rows are readable by signed-in users; student progress is private.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.modules (
  id text primary key, name text not null, short_name text not null,
  number integer, sort_order integer not null unique
);
create table public.lectures (
  id text primary key,
  module_id text references public.modules(id) on delete set null,
  code text, title text not null, summary text not null default '',
  goal text not null default '',
  guide_status text check (guide_status in ('full', 'outline')),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 0),
  sort_order integer not null unique
);
create table public.guide_steps (
  id uuid primary key default gen_random_uuid(),
  lecture_id text not null references public.lectures(id) on delete cascade,
  source_step_id text not null, sort_order integer not null, title text not null,
  detail text not null default '', code text, code_label text, done_when text not null default '',
  unique (lecture_id, source_step_id), unique (lecture_id, sort_order)
);
create table public.guide_requirements (
  id uuid primary key default gen_random_uuid(),
  lecture_id text not null references public.lectures(id) on delete cascade,
  sort_order integer not null, description text not null, unique (lecture_id, sort_order)
);
create table public.guide_resources (
  id uuid primary key default gen_random_uuid(),
  lecture_id text not null references public.lectures(id) on delete cascade,
  sort_order integer not null, label text not null, url text not null,
  unique (lecture_id, sort_order)
);
create table public.concepts (
  id uuid primary key default gen_random_uuid(), term text not null unique, meaning text not null
);
create table public.guide_concepts (
  lecture_id text not null references public.lectures(id) on delete cascade,
  concept_id uuid not null references public.concepts(id) on delete cascade,
  primary key (lecture_id, concept_id)
);
create table public.assignments (
  id text primary key, title text not null,
  week_number integer not null check (week_number > 0),
  repo_url text, repo_label text, local_path text, notes text not null default ''
);
create table public.guide_assignments (
  lecture_id text not null references public.lectures(id) on delete cascade,
  assignment_id text not null references public.assignments(id) on delete cascade,
  primary key (lecture_id, assignment_id)
);
create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  lecture_id text references public.lectures(id) on delete set null,
  session_date date not null, start_time time, title text not null,
  kind text not null check (kind in ('lecture', 'project', 'work', 'career', 'admin', 'event', 'noclass', 'milestone')),
  week_number integer not null check (week_number > 0),
  unique (session_date, start_time, title)
);

-- Per-user saved state.
create table public.lecture_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lecture_id text not null references public.lectures(id) on delete cascade,
  completed boolean not null default false,
  rating smallint check (rating is null or rating between 1 and 5),
  personal_notes text not null default '', updated_at timestamptz not null default now(),
  primary key (user_id, lecture_id)
);
create table public.step_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  step_id uuid not null references public.guide_steps(id) on delete cascade,
  completed boolean not null default false, completed_at timestamptz,
  primary key (user_id, step_id),
  check (not completed or completed_at is not null)
);
create table public.student_assignments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  assignment_id text not null references public.assignments(id) on delete cascade,
  status text not null default 'todo' check (status in ('done', 'in-progress', 'todo', 'check', 'quiz')),
  personal_notes text not null default '', updated_at timestamptz not null default now(),
  primary key (user_id, assignment_id)
);
create table public.student_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lecture_id text references public.lectures(id) on delete cascade,
  body text not null, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_number integer not null check (week_number > 0), goal text not null,
  updated_at timestamptz not null default now(), unique (user_id, week_number)
);
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null unique, covers text not null default '', sort_order integer not null unique
);
create table public.student_assessments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  status text not null default 'todo' check (status in ('done', 'in-progress', 'todo', 'check', 'quiz')),
  personal_notes text not null default '', updated_at timestamptz not null default now(),
  primary key (user_id, assessment_id)
);

create index class_sessions_date_idx on public.class_sessions(session_date);
create index lectures_module_sort_idx on public.lectures(module_id, sort_order);
create index assignments_week_idx on public.assignments(week_number);
create index student_notes_user_lecture_idx on public.student_notes(user_id, lecture_id);

alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Users can create own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "Users can update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Catalog is read-only to signed-in clients. Seed/update it with a trusted admin process.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'modules', 'lectures', 'guide_steps', 'guide_requirements', 'guide_resources',
    'concepts', 'guide_concepts', 'assignments', 'guide_assignments', 'class_sessions', 'assessments'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy "Authenticated read %1$s" on public.%1$I for select to authenticated using (true)', table_name);
  end loop;
end $$;

-- Every student row is scoped to auth.uid() for select, insert, update, and delete.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'lecture_progress', 'step_progress', 'student_assignments', 'student_notes',
    'weekly_goals', 'student_assessments'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy "Read own %1$s" on public.%1$I for select to authenticated using (user_id = (select auth.uid()))', table_name);
    execute format('create policy "Insert own %1$s" on public.%1$I for insert to authenticated with check (user_id = (select auth.uid()))', table_name);
    execute format('create policy "Update own %1$s" on public.%1$I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', table_name);
    execute format('create policy "Delete own %1$s" on public.%1$I for delete to authenticated using (user_id = (select auth.uid()))', table_name);
  end loop;
end $$;

grant usage on schema public to authenticated;
grant select on public.modules, public.lectures, public.guide_steps,
  public.guide_requirements, public.guide_resources, public.concepts,
  public.guide_concepts, public.assignments, public.guide_assignments,
  public.class_sessions, public.assessments to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.lecture_progress, public.step_progress,
  public.student_assignments, public.student_notes, public.weekly_goals,
  public.student_assessments to authenticated;
