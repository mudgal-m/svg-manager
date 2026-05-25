create extension if not exists "pgcrypto";

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.svgs (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  folder_id uuid references public.folders(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists folders_name_idx on public.folders (name);
create index if not exists svgs_folder_id_idx on public.svgs (folder_id);
create index if not exists svgs_name_idx on public.svgs (name);

alter table public.folders enable row level security;
alter table public.svgs enable row level security;

drop policy if exists "public read folders" on public.folders;
drop policy if exists "public insert folders" on public.folders;
drop policy if exists "public update folders" on public.folders;
drop policy if exists "public delete folders" on public.folders;
drop policy if exists "public read svgs" on public.svgs;
drop policy if exists "public insert svgs" on public.svgs;
drop policy if exists "public update svgs" on public.svgs;
drop policy if exists "public delete svgs" on public.svgs;

create policy "public read folders" on public.folders for select using (true);
create policy "public insert folders" on public.folders for insert with check (true);
create policy "public update folders" on public.folders for update using (true) with check (true);
create policy "public delete folders" on public.folders for delete using (true);

create policy "public read svgs" on public.svgs for select using (true);
create policy "public insert svgs" on public.svgs for insert with check (true);
create policy "public update svgs" on public.svgs for update using (true) with check (true);
create policy "public delete svgs" on public.svgs for delete using (true);
