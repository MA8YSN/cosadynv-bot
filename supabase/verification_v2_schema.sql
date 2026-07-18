-- Verification System V2 schema
-- Run this in the Supabase SQL editor before Phase 1 code goes live.
--
-- One row per guild, hybrid shape matching giveaways/giveaway_collections:
-- universal fields as real columns, mode-specific settings in mode_config
-- (jsonb) since only some fields apply to every mode (e.g. lobby_role_id
-- and pre_entry_channel_id only mean anything for 'code_lobby').

create table verification_config (
  guild_id text primary key,
  active_mode text,                      -- 'simple' | 'captcha' | 'code_lobby' | null (not yet configured)
  verified_role_id text,
  lobby_role_id text,                    -- only meaningful for code_lobby
  welcome_channel_id text,
  verify_channel_id text,
  pre_entry_channel_id text,             -- only meaningful for code_lobby
  lobby_chat_channel_id text,
  lobby_giveaways_channel_id text,
  mode_config jsonb not null default '{}'::jsonb,  -- e.g. {"validCodes":[...]} or {"captchaProvider":"..."}
  updated_by text not null,
  updated_at timestamptz not null default now()
);