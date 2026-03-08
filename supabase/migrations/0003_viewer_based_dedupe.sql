-- Viewer-based dedupe: rate limit and idempotency by viewer_id (cookie or IP) instead of IP only.
-- Enables one view per viewer per video per 10-minute window.

-- 1. Add viewer_id to view_rate_limits and switch PK to (viewer_id, share_hash, bucket)
alter table public.view_rate_limits
  add column if not exists viewer_id text;

update public.view_rate_limits
set viewer_id = ip
where viewer_id is null;

alter table public.view_rate_limits
  alter column viewer_id set not null;

alter table public.view_rate_limits
  drop constraint if exists view_rate_limits_pkey;

alter table public.view_rate_limits
  add primary key (viewer_id, share_hash, bucket);

-- 2. Add viewer_id to view_views for auditing and future dedupe
alter table public.view_views
  add column if not exists viewer_id text;

-- 3. Replace record_video_view to use viewer_id for rate-limit claim
create or replace function public.record_video_view(
  p_hash text,
  p_jti text,
  p_ip text,
  p_viewer_id text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
  v_bucket timestamptz;
begin
  v_bucket := to_timestamp(floor(extract(epoch from now()) / 600) * 600)::timestamptz;

  -- Atomic rate limit: claim (viewer_id, share_hash, bucket). Only one inserter wins per bucket.
  insert into public.view_rate_limits (viewer_id, share_hash, bucket, ip)
  values (p_viewer_id, p_hash, v_bucket, p_ip)
  on conflict (viewer_id, share_hash, bucket) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return 'rate_limited';
  end if;

  -- Idempotency: one insert per jti. ON CONFLICT DO NOTHING so we can use ROW_COUNT.
  insert into public.view_views (jti, share_hash, ip, viewer_id)
  values (p_jti, p_hash, p_ip, p_viewer_id)
  on conflict (jti) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return 'replay';
  end if;

  update public.videos
  set view_count = view_count + 1,
      updated_at = now()
  where share_hash = p_hash
    and not is_revoked;

  return 'recorded';
end;
$$;

-- Support callers that still pass only 3 args (backward compat): default viewer_id to ip
create or replace function public.record_video_view(p_hash text, p_jti text, p_ip text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.record_video_view(p_hash, p_jti, p_ip, p_ip);
end;
$$;

grant execute on function public.record_video_view(text, text, text, text) to anon;
grant execute on function public.record_video_view(text, text, text, text) to authenticated;
grant execute on function public.record_video_view(text, text, text) to anon;
grant execute on function public.record_video_view(text, text, text) to authenticated;

-- 4. Retention: optional cleanup of old anti-abuse rows (run via cron or manually).
-- Uncomment and run periodically, e.g. delete view_views older than 30 days and expired view_rate_limits.
-- delete from public.view_views where created_at < now() - interval '30 days';
-- delete from public.view_rate_limits where bucket < now() - interval '1 day';
