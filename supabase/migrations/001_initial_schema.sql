-- ─────────────────────────────────────────────────────────────────────────────
-- Kiln — Initial Schema
-- Run via: supabase db push  OR  paste into the SQL editor in the Supabase dashboard
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- USER PROFILE
-- One row per auth.users entry, created automatically via trigger.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id               uuid        references auth.users on delete cascade primary key,
  name             text        not null default '',
  experience_level text,                          -- Beginner | Hobbyist | Intermediate | Advanced
  goals            text[]      default '{}',      -- array of goal IDs from onboarding
  avatar_url       text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at on profiles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────────────────────────────────────
create table public.projects (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users on delete cascade not null,
  name       text        not null,
  emoji      text        not null default '🏺',
  stage      text        not null default 'Planning',
  clay_body  text        not null default '',
  glaze      text        not null default '',
  notes      text        not null default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index projects_user_id_idx on public.projects (user_id);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- PROJECT PHOTOS
-- ─────────────────────────────────────────────────────────────────────────────
create table public.project_photos (
  id           uuid        default gen_random_uuid() primary key,
  project_id   uuid        references public.projects on delete cascade not null,
  user_id      uuid        references auth.users on delete cascade not null,
  storage_path text        not null,  -- path within the Supabase Storage bucket
  created_at   timestamptz default now() not null
);

create index project_photos_project_id_idx on public.project_photos (project_id);
create index project_photos_user_id_idx    on public.project_photos (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CLAY TYPES  (shared catalog — seeded by admin, read-only for users)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.clay_types (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  description text,
  cone_range  text,
  color       text,
  created_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GLAZES  (shared catalog — seeded by admin, read-only for users)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.glazes (
  id          uuid    default gen_random_uuid() primary key,
  name        text    not null,
  type        text    not null,        -- Glossy | Matte | Satin
  cone        text    not null,        -- Cone 06 | Cone 6 | Cone 10 | Cone 10-12
  atmosphere  text    not null,        -- Oxidation | Reduction | Either
  surface     text,
  color_hex   text,
  description text,
  ingredients jsonb   not null default '[]',  -- [{name, percentage}]
  food_safe   text,                            -- Food safe | Not food safe | Check with supplier
  created_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SAVED GLAZES  (user's favourited glazes from the catalog)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.saved_glazes (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users on delete cascade not null,
  glaze_id   uuid        references public.glazes on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id, glaze_id)
);

create index saved_glazes_user_id_idx on public.saved_glazes (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- INVENTORY  (user's studio materials)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.inventory (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references auth.users on delete cascade not null,
  name            text        not null,
  category        text        not null,  -- Clay | Glaze | Other
  quantity        numeric     not null default 0,
  unit            text        not null,  -- kg | g | L | ml
  max_quantity    numeric     not null default 0,
  alert_threshold numeric     not null default 0,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

create index inventory_user_id_idx on public.inventory (user_id);

create trigger inventory_set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- TOOLS  (shared catalog — seeded by admin, read-only for users)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.tools (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  primary_use text,
  description text,
  icon_name   text,
  icon_color  text,
  created_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- USER TOOLS  (owned / wishlisted tools per user)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.user_tools (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users on delete cascade not null,
  tool_id    uuid        references public.tools on delete cascade not null,
  owned      boolean     not null default false,
  wish_list  boolean     not null default false,
  created_at timestamptz default now() not null,
  unique (user_id, tool_id)
);

create index user_tools_user_id_idx on public.user_tools (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TECHNIQUES  (shared catalog — seeded by admin, read-only for users)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.techniques (
  id              uuid  default gen_random_uuid() primary key,
  name            text  not null,
  category        text  not null,  -- Throwing | Hand-building | Glazing | Finishing
  level           text  not null,  -- Beginner | Intermediate | Advanced
  duration        text,
  description     text,
  thumbnail_color text,
  steps           jsonb not null default '[]',
  tools           jsonb not null default '[]',
  created_at      timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- USER TECHNIQUES  (bookmarked / completed techniques per user)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.user_techniques (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users on delete cascade not null,
  technique_id uuid        references public.techniques on delete cascade not null,
  bookmarked   boolean     not null default false,
  completed    boolean     not null default false,
  created_at   timestamptz default now() not null,
  unique (user_id, technique_id)
);

create index user_techniques_user_id_idx on public.user_techniques (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TIPS  (shared content — seeded by admin, read-only for users)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.tips (
  id         uuid        default gen_random_uuid() primary key,
  title      text        not null,
  body       text        not null,
  category   text,
  created_at timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

-- ── profiles ──────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── projects ──────────────────────────────────────────────────────────────────
alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- ── project_photos ────────────────────────────────────────────────────────────
alter table public.project_photos enable row level security;

create policy "Users can view their own project photos"
  on public.project_photos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own project photos"
  on public.project_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own project photos"
  on public.project_photos for delete
  using (auth.uid() = user_id);

-- ── clay_types (public read-only catalog) ────────────────────────────────────
alter table public.clay_types enable row level security;

create policy "Clay types are publicly readable"
  on public.clay_types for select
  using (true);

-- ── glazes (public read-only catalog) ────────────────────────────────────────
alter table public.glazes enable row level security;

create policy "Glazes are publicly readable"
  on public.glazes for select
  using (true);

-- ── saved_glazes ──────────────────────────────────────────────────────────────
alter table public.saved_glazes enable row level security;

create policy "Users can view their own saved glazes"
  on public.saved_glazes for select
  using (auth.uid() = user_id);

create policy "Users can save glazes"
  on public.saved_glazes for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave glazes"
  on public.saved_glazes for delete
  using (auth.uid() = user_id);

-- ── inventory ─────────────────────────────────────────────────────────────────
alter table public.inventory enable row level security;

create policy "Users can view their own inventory"
  on public.inventory for select
  using (auth.uid() = user_id);

create policy "Users can add inventory items"
  on public.inventory for insert
  with check (auth.uid() = user_id);

create policy "Users can update their inventory"
  on public.inventory for update
  using (auth.uid() = user_id);

create policy "Users can delete inventory items"
  on public.inventory for delete
  using (auth.uid() = user_id);

-- ── tools (public read-only catalog) ─────────────────────────────────────────
alter table public.tools enable row level security;

create policy "Tools are publicly readable"
  on public.tools for select
  using (true);

-- ── user_tools ────────────────────────────────────────────────────────────────
alter table public.user_tools enable row level security;

create policy "Users can view their own tool list"
  on public.user_tools for select
  using (auth.uid() = user_id);

create policy "Users can add tools to their list"
  on public.user_tools for insert
  with check (auth.uid() = user_id);

create policy "Users can update their tool list"
  on public.user_tools for update
  using (auth.uid() = user_id);

create policy "Users can remove tools from their list"
  on public.user_tools for delete
  using (auth.uid() = user_id);

-- ── techniques (public read-only catalog) ────────────────────────────────────
alter table public.techniques enable row level security;

create policy "Techniques are publicly readable"
  on public.techniques for select
  using (true);

-- ── user_techniques ───────────────────────────────────────────────────────────
alter table public.user_techniques enable row level security;

create policy "Users can view their own technique progress"
  on public.user_techniques for select
  using (auth.uid() = user_id);

create policy "Users can add technique progress"
  on public.user_techniques for insert
  with check (auth.uid() = user_id);

create policy "Users can update their technique progress"
  on public.user_techniques for update
  using (auth.uid() = user_id);

create policy "Users can remove technique progress"
  on public.user_techniques for delete
  using (auth.uid() = user_id);

-- ── tips (public read-only content) ──────────────────────────────────────────
alter table public.tips enable row level security;

create policy "Tips are publicly readable"
  on public.tips for select
  using (true);
