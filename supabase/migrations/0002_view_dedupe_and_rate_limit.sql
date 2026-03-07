-- View deduplication and rate limiting: one view per (jti) and one per (ip, hash) per window.
create table public.view_views (
  jti text primary key,
  share_hash text not null,
  ip text not null,
  created_at timestamptz not null default now()
);

create index view_views_rate_limit on public.view_views (share_hash, ip, created_at desc);

alter table public.view_views enable row level security;

-- No direct access; only via security definer RPC
create policy "no_direct_access"
  on public.view_views for all
  using (false)
  with check (false);

-- Single RPC: check rate limit, insert idempotency row, increment view count.
-- Returns 'recorded' | 'rate_limited' | 'replay'.
create or replace function public.record_video_view(p_hash text, p_jti text, p_ip text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rate_limited boolean;
begin
  -- Rate limit: same ip + hash already viewed in last 10 minutes
  select exists (
    select 1 from public.view_views
    where share_hash = p_hash
      and ip = p_ip
      and created_at > now() - interval '10 minutes'
  ) into v_rate_limited;
  if v_rate_limited then
    return 'rate_limited';
  end if;

  -- Idempotency: insert jti (one-time use). On conflict = replay.
  insert into public.view_views (jti, share_hash, ip)
  values (p_jti, p_hash, p_ip);
  -- If we get here, insert succeeded.

  -- Increment view count for this video (same logic as increment_video_view_count)
  update public.videos
  set view_count = view_count + 1,
      updated_at = now()
  where share_hash = p_hash
    and not is_revoked;

  return 'recorded';
exception
  when unique_violation then
    return 'replay';
end;
$$;

grant execute on function public.record_video_view(text, text, text) to anon;
grant execute on function public.record_video_view(text, text, text) to authenticated;

-- Optional: periodic cleanup of old view_views rows (e.g. run daily)
-- delete from public.view_views where created_at < now() - interval '7 days';
