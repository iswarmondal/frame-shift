-- Add optional markdown description to videos (empty by default for new and existing rows)
alter table public.videos
  add column if not exists description text not null default '';

comment on column public.videos.description is 'Markdown description for the video; shown to viewers below the player.';
