# Learning Hub data model

This ERD maps the content and student activity in `hub/hub-data.json`, `hub/guides/*.json`, `progress.md`, the calendar feed, and `notes/work-log/`. It is a normalized starting point for moving the Hub's basic content and saved progress into Supabase.

## ERD

```mermaid
erDiagram
    AUTH_USERS ||--o| PROFILES : has
    MODULES ||--o{ LECTURES : contains
    LECTURES ||--o| GUIDES : describes
    GUIDES ||--o{ GUIDE_STEPS : has
    GUIDES ||--o{ GUIDE_REQUIREMENTS : lists
    GUIDES ||--o{ GUIDE_RESOURCES : links
    GUIDES ||--o{ GUIDE_ASSIGNMENTS : assigns
    ASSIGNMENTS ||--o{ GUIDE_ASSIGNMENTS : appears_in
    LECTURES ||--o{ CLASS_SESSIONS : scheduled_as
    ASSIGNMENTS ||--o{ STUDENT_ASSIGNMENTS : tracked_by
    PROFILES ||--o{ STUDENT_ASSIGNMENTS : tracks
    PROFILES ||--o{ STEP_PROGRESS : completes
    GUIDE_STEPS ||--o{ STEP_PROGRESS : has_progress
    PROFILES ||--o{ LECTURE_PROGRESS : tracks
    LECTURES ||--o{ LECTURE_PROGRESS : has_progress
    PROFILES ||--o{ STUDENT_NOTES : writes
    LECTURES ||--o{ STUDENT_NOTES : about
    PROFILES ||--o{ WEEKLY_GOALS : sets
    ASSESSMENTS ||--o{ STUDENT_ASSESSMENTS : tracked_by
    PROFILES ||--o{ STUDENT_ASSESSMENTS : tracks
    PROFILES ||--o{ WORK_LOGS : records
    PROFILES ||--o{ REPOSITORIES : owns
    REPOSITORIES ||--o{ COMMITS : contains
    GUIDES ||--o{ GUIDE_CONCEPTS : teaches
    CONCEPTS ||--o{ GUIDE_CONCEPTS : appears_in

    AUTH_USERS {
      uuid id PK
    }
    PROFILES {
      uuid id PK,FK
      text display_name
      timestamptz created_at
    }
    MODULES {
      text id PK
      text name
      text short_name
      int number
      int sort_order
    }
    LECTURES {
      text id PK
      text module_id FK
      text code
      text title
      text summary
      text goal
      text guide_status
      int estimated_minutes
      int sort_order
    }
    GUIDE_STEPS {
      uuid id PK
      text lecture_id FK
      text source_step_id
      int sort_order
      text title
      text detail
      text code
      text code_label
      text done_when
    }
    GUIDE_REQUIREMENTS {
      uuid id PK
      text lecture_id FK
      int sort_order
      text description
    }
    GUIDE_RESOURCES {
      uuid id PK
      text lecture_id FK
      text label
      text url
    }
    CONCEPTS {
      uuid id PK
      text term UK
      text meaning
    }
    GUIDE_CONCEPTS {
      text lecture_id PK,FK
      uuid concept_id PK,FK
    }
    ASSIGNMENTS {
      text id PK
      text title
      int week_number
      text repo_url
      text local_path
      text notes
    }
    GUIDE_ASSIGNMENTS {
      text lecture_id PK,FK
      text assignment_id PK,FK
    }
    CLASS_SESSIONS {
      uuid id PK
      text lecture_id FK
      date session_date
      time start_time
      text title
      text kind
      int week_number
    }
    STUDENT_ASSIGNMENTS {
      uuid user_id PK,FK
      text assignment_id PK,FK
      text status
      text personal_notes
      timestamptz updated_at
    }
    LECTURE_PROGRESS {
      uuid user_id PK,FK
      text lecture_id PK,FK
      boolean completed
      int rating
      text personal_notes
      timestamptz updated_at
    }
    STEP_PROGRESS {
      uuid user_id PK,FK
      uuid step_id PK,FK
      boolean completed
      timestamptz completed_at
    }
    STUDENT_NOTES {
      uuid id PK
      uuid user_id FK
      text lecture_id FK
      text body
      timestamptz updated_at
    }
    WEEKLY_GOALS {
      uuid id PK
      uuid user_id FK
      int week_number
      text goal
      timestamptz updated_at
    }
    ASSESSMENTS {
      uuid id PK
      text title
      text covers
      int sort_order
    }
    STUDENT_ASSESSMENTS {
      uuid user_id PK,FK
      uuid assessment_id PK,FK
      text status
      text notes
      timestamptz updated_at
    }
    WORK_LOGS {
      uuid id PK
      uuid user_id FK
      date log_date
      text title
      text summary
      text source_path
    }
    REPOSITORIES {
      uuid id PK
      uuid user_id FK
      text name
      text url
      text description
      boolean is_fork
      timestamptz pushed_at
    }
    COMMITS {
      text sha PK
      uuid repository_id FK
      date commit_date
      text message
      text url
    }
```

`AUTH_USERS` is Supabase's built-in `auth.users` table; it is shown to make ownership links clear and should not be recreated. `PROFILES.id` is the authenticated user's UUID.

## What belongs in the database

| Hub data | Tables | Reason |
|---|---|---|
| Modules, lecture guides, ordered guide steps, requirements, resources, concepts | `modules`, `lectures`, `guide_steps`, `guide_requirements`, `guide_resources`, `concepts`, `guide_concepts` | Shared curriculum catalog. Seed from the JSON guide files. |
| Assignment catalog and guide links | `assignments`, `guide_assignments` | Assignments can be associated with more than one lecture, and vice versa. |
| Calendar items | `class_sessions` | One lecture can have several dated sessions. Keep non-lecture items with a null `lecture_id`. |
| Student state | `lecture_progress`, `step_progress`, `student_assignments`, `student_notes`, `weekly_goals` | User-specific and protected by Supabase RLS. |
| Work logs and GitHub activity | `work_logs`, `repositories`, `commits` | Optional syncable activity; these can be added after basic progress works. |
| Assessments | `assessments`, `student_assessments` | The current Hub has a small fixed list; keep each student's status separate from the catalog. |

## Suggested implementation order

1. Create `profiles`, `modules`, `lectures`, `guide_steps`, and the guide child tables; seed the catalog.
2. Add `lecture_progress`, `step_progress`, and `student_assignments` with RLS. This supports per-user checkmarks and ratings.
3. Add notes and weekly goals. Keep these separate from shared guide content so users cannot overwrite one another.
4. Add assessments and schedule sessions; add optional work-log/repository sync when the basic Hub reads and writes correctly.

The companion [`learning_hub_schema.sql`](learning_hub_schema.sql) implements the catalog, sessions, assignments, and student progress tables with initial RLS policies. It intentionally leaves GitHub sync and assessment tracking for a later pass.
