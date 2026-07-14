/**
 * config/selfRoles.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Single source of truth for every Self Roles category and the Discord
 * role each option maps to. No role ID is hardcoded anywhere outside this
 * file — the service, embed, and select-menu handler all work generically
 * off this config.
 *
 * V1 ships exactly one category (Notifications). Adding a future category
 * — e.g. "Regions" or "Trading Style" — means adding one more entry to
 * SELF_ROLE_CATEGORIES below. No service, embed, or handler code needs to
 * change; they all iterate categories/options generically, never assuming
 * "there are exactly 4 notification roles".
 *
 * IMPORTANT: replace every `roleId` placeholder below with your server's
 * real Discord role IDs before deploying the panel — right-click a role
 * in Server Settings → Roles (Developer Mode must be enabled) → Copy ID.
 */

export interface SelfRoleOption {
  /** Stable identifier used as the select-menu option's value — never the raw Discord role ID. */
  key: string;
  label: string;
  emoji: string;
  /** Shown in the embed AND as the select-menu option's description (Discord caps this at 100 chars). */
  description: string;
  /** The actual Discord role this option grants/removes. */
  roleId: string;
}

export interface SelfRoleCategory {
  key: string;
  /** Embed title, e.g. "🔔 Notification Roles". */
  title: string;
  /** Intro copy shown above the role list in the embed. */
  description: string;
  /** Line shown at the bottom of the embed, just above the select menu. */
  instructions: string;
  options: SelfRoleOption[];
}

export const SELF_ROLE_CATEGORIES: SelfRoleCategory[] = [
  {
    key: 'notifications',
    title: '🔔 Notification Roles',
    description:
      'Stay informed without unnecessary pings.\n\n' +
      'Choose the notifications you want to receive. You can update your ' +
      'preferences at any time by revisiting this panel.',
    instructions: '⬇️ Use the menu below to choose your notification roles.',
    options: [
      {
        key: 'alpha',
        label: 'Alpha',
        emoji: '💎',
        description:
          'Receive high-conviction alpha, early project discoveries, ecosystem ' +
          'updates, and promising opportunities shared by the team.',
        roleId: '1526403685322854491',
      },
      {
        key: 'raids',
        label: 'Raids',
        emoji: '⚔️',
        description:
          'Get notified whenever community engagement raids go live and help ' +
          'support our partnered projects.',
        roleId: '1526403965489512640',
      },
      {
        key: 'giveaways',
        label: 'Giveaways',
        emoji: '🎁',
        description:
          'Receive alerts for giveaways, whitelist campaigns, contests, and ' +
          'exclusive community rewards.',
        roleId: '1526403956383813662',
      },
      {
        key: 'mints',
        label: 'Mints',
        emoji: '🚀',
        description:
          'Get notified about upcoming and live NFT mints so you never miss ' +
          'an important launch.',
        roleId: '1526404110541131887',
      },
    ],
  },
  // Future categories (e.g. regions, trading style, roles-by-holding) get
  // added here as additional entries — no other file needs to change.
];