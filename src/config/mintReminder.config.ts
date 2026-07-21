export const MINT_REMINDER_CONFIG = {
  // Channel name where reminders are posted
  channelName: "🚀-mint-reminders",

  // Role to ping (set to null to disable pinging)
  pingRoleName: "Mints" as string | null,

  // Reminder intervals in days (and special "today" / "1hour")
  intervals: [
    { key: "7d",    days: 7,    label: "🚀 Upcoming Mint",   color: 0x10b981 },
    { key: "3d",    days: 3,    label: "🔥 Mint This Week",  color: 0xf59e0b },
    { key: "24h",   days: 1,    label: "⚠️ Tomorrow",         color: 0xef4444 },
    { key: "today", days: 0,    label: "🚨 Mint Today",       color: 0xff0000 },
    { key: "1h",    days: null, label: "⏰ Mint Starts Soon", color: 0xff6b6b },
  ],

  // MintKeeper base URL
  mintKeeperBaseUrl: "https://mintkeeper.vercel.app",

  // Scheduler interval in milliseconds (runs every hour)
  schedulerIntervalMs: 60 * 60 * 1000,
} as const;