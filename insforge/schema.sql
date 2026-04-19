create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role text not null check (role in ('agent', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists content_sources (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('release_note', 'help_center_article')),
  title text not null,
  source_url text,
  raw_content text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references content_sources(id) on delete set null,
  title text not null,
  audience text not null default 'new_and_existing_agents',
  lesson_json jsonb not null default '{}'::jsonb,
  validation_status text not null default 'validated_against_sandbox',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  lesson_id uuid references lessons(id) on delete cascade,
  current_step integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists qa_events (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  lesson_id uuid references lessons(id) on delete set null,
  question text not null,
  answer_summary text not null,
  source_screen text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_lessons_source_id on lessons(source_id);
create index if not exists idx_lesson_progress_user_email on lesson_progress(user_email);
create index if not exists idx_qa_events_created_at on qa_events(created_at desc);

insert into profiles (id, email, name, role)
values
  ('00000000-0000-0000-0000-000000000001', 'shrey@lofty.demo', 'Shrey Demo', 'agent'),
  ('00000000-0000-0000-0000-000000000002', 'pm@agentreborn.demo', 'Agent Reborn PM', 'admin')
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  role = excluded.role;

insert into content_sources (id, type, title, source_url, raw_content, storage_path)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'release_note',
    'Lofty 4.40 Feature Updates',
    'https://help.lofty.com/hc/en-us/articles/48927271391259-Feature-Updates-for-Lofty-4-40',
    'Lofty 4.40 includes Sales Agent as a Digital Employee, smarter AI conversations, Transaction Lead Portal, transaction role defaults, and Smart Plan performance reporting.',
    'lofty-academy-artifacts/lofty-4-40-lesson.json'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'help_center_article',
    'Aidentified Integration',
    'https://help.lofty.com/hc/en-us/articles/40537616665627-Aidentified-Integration',
    'The Aidentified Integration article explains how to connect Aidentified to Lofty, connect LinkedIn, and send selected records to Lofty.',
    null
  )
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  source_url = excluded.source_url,
  raw_content = excluded.raw_content,
  storage_path = excluded.storage_path;

insert into lessons (id, source_id, title, audience, lesson_json, validation_status, published)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Lofty 4.40: Sales Agent Digital Employee',
    'new_and_existing_agents',
    $${
      "sourceType": "release_note",
      "entryPoint": "Dashboard > New Updates",
      "steps": [
        {
          "target": "updates",
          "label": "Open New Updates",
          "narration": "This release card introduces new Lofty capabilities without forcing agents to leave their workflow."
        },
        {
          "target": "updates",
          "label": "Explain Sales Agent",
          "narration": "Sales Agent is now presented as a Digital Employee agents can hire, evaluate, and understand as a teammate."
        }
      ],
      "trustNotes": [
        "Explain what the AI will do before asking the agent to rely on it.",
        "Show that the agent remains in control of outreach decisions."
      ]
    }$$::jsonb,
    'validated_against_sandbox',
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Aidentified Integration Walkthrough',
    'existing_agents',
    $${
      "sourceType": "help_center_article",
      "entryPoint": "Integrations > Aidentified",
      "steps": [
        {
          "target": "updates",
          "label": "Connect Aidentified to Lofty",
          "narration": "Choose the Lofty option from Aidentified Connect, enter Lofty credentials, and submit."
        },
        {
          "target": "updates",
          "label": "Connect LinkedIn",
          "narration": "Use Connect > LinkedIn and follow the import steps from the article."
        },
        {
          "target": "updates",
          "label": "Send selected records",
          "narration": "Select prospect checkboxes and choose Add to Lofty."
        }
      ],
      "calloutStyle": "numbered_red_boxes"
    }$$::jsonb,
    'validated_against_sandbox',
    true
  )
on conflict (id) do update set
  source_id = excluded.source_id,
  title = excluded.title,
  audience = excluded.audience,
  lesson_json = excluded.lesson_json,
  validation_status = excluded.validation_status,
  published = excluded.published;
