/**
 * config/giveawayCollectionTypes.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Every winner-collection type is DATA here, not code — same philosophy
 * as config/welcomeThemes.config.ts. The button, modal, service, and
 * panel-renderer files never branch on "which collection type is this,"
 * only on "what does this type's definition say" (field label, button
 * label, modal title, validation).
 *
 * V1 registers exactly one type: wallet, with per-chain validation
 * nested inside its own validate(). A future type (email, game ID,
 * shipping info) is one more object in COLLECTION_TYPES below — no
 * other file needs to change.
 */

export interface CollectionTypeDefinition {
  key: string;
  label: string;
  fieldLabel: string;
  buttonLabel: string;
  getModalTitle: (config: Record<string, unknown>) => string;
  /** Basic format sanity checks — not cryptographic/checksum validation. */
  validate: (value: string, config: Record<string, unknown>) => boolean;
}

export const SUPPORTED_CHAINS = ['SOL', 'ETH', 'BTC'] as const;
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

const CHAIN_VALIDATORS: Record<string, RegExp> = {
  SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, // base58, excludes 0/O/I/l
  ETH: /^0x[a-fA-F0-9]{40}$/,
  BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
};

export const WALLET_COLLECTION_TYPE: CollectionTypeDefinition = {
  key: 'wallet',
  label: 'Wallet',
  fieldLabel: 'Wallet Address',
  buttonLabel: 'Submit Wallet',
  getModalTitle: (config) => `Submit ${(config.chain as string) ?? ''} Wallet`.trim(),
  validate: (value, config) => {
    const chain = (config.chain as string) ?? '';
    const pattern = CHAIN_VALIDATORS[chain];
    // Unknown chain (shouldn't happen given SUPPORTED_CHAINS gates
    // creation) — fall back to a non-empty check rather than rejecting.
    if (!pattern) return value.trim().length > 0;
    return pattern.test(value.trim());
  },
};

export const COLLECTION_TYPES: CollectionTypeDefinition[] = [WALLET_COLLECTION_TYPE];

export function getCollectionTypeByKey(key: string | null): CollectionTypeDefinition | undefined {
  if (!key) return undefined;
  return COLLECTION_TYPES.find((type) => type.key === key);
}