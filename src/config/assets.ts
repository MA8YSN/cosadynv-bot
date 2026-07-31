/**
 * config/assets.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Centralized banner/asset URLs — never hardcode a banner URL in a feature
 * file, reference ASSETS.banners.* instead. One place to update if an
 * asset changes.
 *
 * TODO: every URL below is a placeholder. The source .gif files exist
 * locally but Discord embeds require a public https URL — host these
 * (Discord CDN via a private channel, Supabase Storage, GitHub raw, etc.)
 * and paste the URLs in.
 *
 * TODO: no verification.gif was provided in the current asset set despite
 * being required by COS-005 — placeholder added, needs a real asset.
 */

export const ASSETS = {
  banners: {
    welcome: 'https://tueessikavaggzhrimge.supabase.co/storage/v1/object/sign/banners/WELCOME%20.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84NzVlNTk5YS03N2YwLTQxZmYtYjQxYS0xYzA4Y2Q1NTEzMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYW5uZXJzL1dFTENPTUUgLmdpZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU1MzM0NDAsImV4cCI6MTgxNzA2OTQ0MH0.LbcoVzHwiqFTZbPLQPd81B4hTnawRw0paNL--qguUXU', // TODO: WELCOME.gif — not applied per COS-005 (Welcome Card intentionally unchanged)
    rules: 'https://tueessikavaggzhrimge.supabase.co/storage/v1/object/sign/banners/WELCOME%20.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84NzVlNTk5YS03N2YwLTQxZmYtYjQxYS0xYzA4Y2Q1NTEzMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYW5uZXJzL1dFTENPTUUgLmdpZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU1MzM0NDAsImV4cCI6MTgxNzA2OTQ0MH0.LbcoVzHwiqFTZbPLQPd81B4hTnawRw0paNL--qguUXU', // TODO: rules.gif — no Rules embed system exists yet to apply this to
    announcement: 'https://tueessikavaggzhrimge.supabase.co/storage/v1/object/sign/banners/announcement%20.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84NzVlNTk5YS03N2YwLTQxZmYtYjQxYS0xYzA4Y2Q1NTEzMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYW5uZXJzL2Fubm91bmNlbWVudCAuZ2lmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NTUzMzU0OCwiZXhwIjoxODE3MDY5NTQ4fQ.Ih4IF9v-bCaEPpbM7ocorubmzH1_FPENm5T9RuW1esg', // TODO: announcement.gif — no Announcement embed system exists yet to apply this to
    giveaway: 'https://tueessikavaggzhrimge.supabase.co/storage/v1/object/sign/banners/giveaway.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84NzVlNTk5YS03N2YwLTQxZmYtYjQxYS0xYzA4Y2Q1NTEzMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYW5uZXJzL2dpdmVhd2F5LmdpZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU1MzM0NzcsImV4cCI6MTgxNzA2OTQ3N30.my1gL8atcBeS5JX3kOQ9qgDY_kSLIXR1iYbGlMKF8mE', // TODO: giveaway.gif
    selfRoles: 'https://tueessikavaggzhrimge.supabase.co/storage/v1/object/sign/banners/WELCOME%20.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84NzVlNTk5YS03N2YwLTQxZmYtYjQxYS0xYzA4Y2Q1NTEzMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYW5uZXJzL1dFTENPTUUgLmdpZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU1MzM0NDAsImV4cCI6MTgxNzA2OTQ0MH0.LbcoVzHwiqFTZbPLQPd81B4hTnawRw0paNL--qguUXU', // TODO: self_roles.gif
    mintReminder: 'https://tueessikavaggzhrimge.supabase.co/storage/v1/object/sign/banners/giveaway.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84NzVlNTk5YS03N2YwLTQxZmYtYjQxYS0xYzA4Y2Q1NTEzMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYW5uZXJzL2dpdmVhd2F5LmdpZiIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU1MzM0NzcsImV4cCI6MTgxNzA2OTQ3N30.my1gL8atcBeS5JX3kOQ9qgDY_kSLIXR1iYbGlMKF8mE', // TODO: mint_reminder.gif
    verification: '', // TODO: no verification asset provided — needs one
  },
};