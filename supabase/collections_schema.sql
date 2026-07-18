-- Winner Collection schema (V1: wallet collection only, generalized for
-- future collection types — see config/giveawayCollectionTypes.config.ts)
-- Run this in the Supabase SQL editor after schema.sql.

alter table giveaways add column collection_type text;
alter table giveaways add column collection_config jsonb;
alter table giveaways add column collection_channel_id text;
alter table giveaways add column collection_message_id text;

-- Generic on purpose: `value` holds a wallet address today, an email or
-- game ID for a future collection type tomorrow. Adding a new collection
-- type never requires a new table or a migration to this one — only
-- config/giveawayCollectionTypes.config.ts changes.
create table giveaway_collections (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references giveaways(id),
  user_id text not null,
  value text not null,
  submitted_at timestamptz not null default now(),
  unique (giveaway_id, user_id)
);

create index idx_giveaway_collections_giveaway on giveaway_collections (giveaway_id);