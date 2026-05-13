-- =============================================
-- AI Cricket Quiz Battle — Database Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- ROOMS
-- =============================================
create table public.rooms (
  id                     uuid primary key default uuid_generate_v4(),
  room_code              text unique not null,
  host_id                text not null,
  status                 text not null default 'waiting'
                         check (status in ('waiting','starting','playing','reviewing','finished')),
  current_question_index int not null default 0,
  total_questions        int not null default 10,
  time_per_question      int not null default 15,
  difficulty             text not null default 'medium'
                         check (difficulty in ('easy','medium','hard','mixed')),
  question_timer_end     timestamptz,
  started_at             timestamptz,
  created_at             timestamptz default now()
);

-- =============================================
-- PLAYERS
-- =============================================
create table public.players (
  id          uuid primary key default uuid_generate_v4(),
  room_id     uuid references public.rooms(id) on delete cascade,
  username    text not null,
  avatar_seed text,
  score       int not null default 0,
  streak      int not null default 0,
  is_ready    boolean not null default false,
  is_host     boolean not null default false,
  joined_at   timestamptz default now(),
  unique(room_id, username)
);

-- =============================================
-- QUESTIONS
-- =============================================
create table public.questions (
  id              uuid primary key default uuid_generate_v4(),
  room_id         uuid references public.rooms(id) on delete cascade,
  question_text   text not null,
  options         jsonb not null,
  correct_answer  text not null,
  difficulty      text default 'medium'
                  check (difficulty in ('easy','medium','hard')),
  question_order  int not null,
  created_at      timestamptz default now()
);

-- =============================================
-- ANSWERS
-- =============================================
create table public.answers (
  id              uuid primary key default uuid_generate_v4(),
  question_id     uuid references public.questions(id) on delete cascade,
  player_id       uuid references public.players(id) on delete cascade,
  selected_answer text,
  time_taken      real,
  is_correct      boolean,
  points_awarded  int default 0,
  answered_at     timestamptz default now(),
  unique(question_id, player_id)
);

-- =============================================
-- INDEXES
-- =============================================
create index idx_players_room on public.players(room_id);
create index idx_questions_room on public.questions(room_id);
create index idx_questions_order on public.questions(room_id, question_order);
create index idx_answers_question on public.answers(question_id);
create index idx_rooms_code on public.rooms(room_code);

-- =============================================
-- ROW LEVEL SECURITY (permissive for hackathon)
-- =============================================
alter table public.rooms enable row level security;
alter table public.players enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;

create policy "public_rooms" on public.rooms for all using (true) with check (true);
create policy "public_players" on public.players for all using (true) with check (true);
create policy "public_questions" on public.questions for all using (true) with check (true);
create policy "public_answers" on public.answers for all using (true) with check (true);
