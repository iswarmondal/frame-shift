-- Videos table: owned by auth.users, shareable via unguessable hash
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled',
  blob_url text not null,
  blob_path text not null,
  share_hash text not null,
  is_revoked boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint videos_share_hash_unique unique (share_hash)
);

create index videos_owner_id_created_at_desc on public.videos (owner_id, created_at desc);
create index videos_share_hash on public.videos (share_hash) where not is_revoked;

alter table public.videos enable row level security;

-- Owners: full access to own rows
create policy "owners_select_own"
  on public.videos for select
  using (auth.uid() = owner_id);

create policy "owners_insert_own"
  on public.videos for insert
  with check (auth.uid() = owner_id);

create policy "owners_update_own"
  on public.videos for update
  using (auth.uid() = owner_id);

create policy "owners_delete_own"
  on public.videos for delete
  using (auth.uid() = owner_id);

-- Public read by share_hash: only via RPC that checks is_revoked and returns single row
-- (no direct anon select on table; we use a function with security definer)

create or replace function public.get_video_by_share_hash(p_hash text)
returns setof public.videos
language sql
security definer
set search_path = public
as $$
  select *
  from public.videos
  where share_hash = p_hash
    and not is_revoked
  limit 1;
$$;

-- Atomic view count increment (for public playback page)
create or replace function public.increment_video_view_count(p_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.videos
  set view_count = view_count + 1,
      updated_at = now()
  where share_hash = p_hash
    and not is_revoked;
end;
$$;

-- Optional: keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger videos_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

-- Allow anon and authenticated to call public video lookup (function enforces rules)
grant execute on function public.get_video_by_share_hash(text) to anon;
grant execute on function public.increment_video_view_count(text) to anon;
grant execute on function public.get_video_by_share_hash(text) to authenticated;
grant execute on function public.increment_video_view_count(text) to authenticated;
