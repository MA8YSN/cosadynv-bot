/**
 * ui/terminology.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Standard vocabulary for the Cosadyn ecosystem — spelling/capitalization
 * for shared terms, once, everywhere. Features import TERMS instead of
 * hand-typing these strings.
 */

export const TERMS = {
  FCFS: 'FCFS',
  GTD: 'GTD',
  FREE_MINT: 'Free Mint',
  WHITELIST: 'Whitelist',
  MINTED: 'Minted',
  VERIFIED: 'Verified',
  LOBBY: 'Lobby',
} as const;

export type TermKey = keyof typeof TERMS;