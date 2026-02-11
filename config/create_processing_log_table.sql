-- Create a table to track processed videos for daily digest
create table if not exists processed_videos (
  video_id text primary key,
  channel_id text not null,
  title text not null,
  processed_at timestamptz default now(),
  status text default 'success'
);

-- Create an index for faster lookups by channel
create index if not exists idx_processed_videos_channel on processed_videos(channel_id);

-- Add comment
comment on table processed_videos is 'Tracks which YouTube videos have been processed by the daily digest pipeline';
