/**
 * config/verification.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Verification role IDs and (for now) the list of valid invite codes.
 *
 * IMPORTANT: replace both role ID placeholders below with your server's
 * real Discord role IDs before deploying the panel — right-click a role
 * in Server Settings → Roles (Developer Mode must be enabled) → Copy ID.
 * Replace the placeholder code with your server's real invite code(s).
 *
 * validCodes is intentionally only ever read from inside
 * services/verificationService.ts's validateInviteCode() — nothing else
 * in the codebase reads this array directly. When codes move to a
 * database later, only that one function's body changes; the modal,
 * buttons, and command are untouched.
 */

export const VERIFICATION_CONFIG = {
  verifiedRoleId: '1525890044986920990',
  lobbyRoleId: '1526597750559609073',
  validCodes: ['1414'],
};