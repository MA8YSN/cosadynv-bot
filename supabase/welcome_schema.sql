-- Welcome System schema (V1)
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- before deploying the Welcome System. Separate file from schema.sql
-- since it's a distinct feature added later — run both, order doesn't
-- matter between them.

create table welcome_config (
  guild_id text primary key,
  channel_id text not null,
  theme text not null default 'classic',
  message_template text not null,
  dm_enabled boolean not null default false,
  updated_by text not null,
  updated_at timestamptz not null default now()
);