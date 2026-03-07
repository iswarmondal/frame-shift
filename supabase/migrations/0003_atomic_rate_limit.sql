-- Atomic rate limit: one row per (ip, share_hash, 10-min bucket).
-- INSERT ... ON CONFLICT DO NOTHING makes "claim this bucket" race-free.
create table public.view_rate_limits (
  ip text not null,
  share_hash text not null,
  bucket timestamptz not null,
  primary key (ip, share_hash, bucket)
);

alter table public.view_rate_limits enable row level security;

create policy "no_direct_access"
  on public.view_rate_limits for all
  using (false)
  with check (false);

-- Replace record_video_view so rate-limit check and claim are atomic.
create or replace function public.record_video_view(p_hash text, p_jti text, p_ip text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
begin
  -- Atomic rate limit: claim (ip, share_hash, bucket). Only one inserter wins per bucket.
  insert into public.view_rate_limits (ip, share_hash, bucket)
  values (p_ip, p_hash, to_timestamp(floor(extract(epoch from now()) / 600) * 600)::timestamptz)
  on conflict (ip, share_hash, bucket) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return 'rate_limited';
  end if;

  -- Idempotency: one insert per jti. ON CONFLICT DO NOTHING so we can use ROW_COUNT.
  insert into public.view_views (jti, share_hash, ip)
  values (p_jti, p_hash, p_ip)
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
