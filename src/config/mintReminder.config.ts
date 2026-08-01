export const MINT_REMINDER_CONFIG = {
  // Channel name where reminders are posted
  channelName: "🚀-mint-reminders",

  // Role to ping (set to null to disable pinging)
  pingRoleName: "Mints" as string | null,

  // Single reminder sent only on the mint day
  intervals: [
    {
      key: "today",
      days: 0,
      label: "🚨 Mint Today",
      color: 0xff0000,
    },
  ],

  // MintKeeper base URL
  mintKeeperBaseUrl: "https://mintkeeper.vercel.app",

  // Scheduler interval in milliseconds (runs every hour)
  schedulerIntervalMs: 60 * 60 * 1000,
} as const;