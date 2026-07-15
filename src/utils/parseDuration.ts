/**
 * utils/parseDuration.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Parses simple duration strings like "3d", "1h30m", "45m" into
 * milliseconds. Used by /giveaway create since Discord has no native
 * duration input type. Returns null for anything unparseable.
 */

const UNIT_MS: Record<string, number> = {
  d: 24 * 60 * 60 * 1000,
  h: 60 * 60 * 1000,
  m: 60 * 1000,
  s: 1000,
};

export function parseDuration(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  const pattern = /(\d+)\s*(d|h|m|s)/g;
  let match: RegExpExecArray | null;
  let totalMs = 0;
  let matchedAnything = false;

  while ((match = pattern.exec(trimmed)) !== null) {
    matchedAnything = true;
    const value = Number(match[1]);
    const unit = match[2];
    totalMs += value * UNIT_MS[unit];
  }

  if (!matchedAnything || totalMs <= 0) return null;
  return totalMs;
}