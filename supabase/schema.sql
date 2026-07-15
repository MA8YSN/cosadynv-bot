-- Giveaway System schema (V1)
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- before deploying the Giveaway System.
--
-- Deliberately does NOT include `type`/`metadata` columns yet — V1 stays
-- focused on what's actually used. Add those via a migration when
-- multiple giveaway types become a real feature, per the approved
-- architecture decision.

create table giveaways (
  id uuid primary key,
  guild_id text not null,
  channel_id text not null,
  message_id text not null,
  prize text not null,
  winner_count integer not null,
  status text not null default 'active',  -- 'active' | 'ended' | 'cancelled'
  created_by text not null,
  created_at timestamptz not null default now(),
  ends_at timestamptz not null,
  ended_at timestamptz
);

create table giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references giveaways(id),
  user_id text not null,
  entered_at timestamptz not null default now(),
  unique (giveaway_id, user_id)
);

create table giveaway_winners (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references giveaways(id),
  user_id text not null,
  selected_at timestamptz not null default now()
);

-- Speeds up the scheduler's "find expired active giveaways" poll and the
-- admin's "list active giveaways for this server" query.
create index idx_giveaways_status_ends_at on giveaways (status, ends_at);
create index idx_giveaways_guild_status on giveaways (guild_id, status);