# Community Bot — Foundation (v1)

A modular, production-oriented Discord bot built to become the core
infrastructure of a private crypto community. This is **v1**: the
architecture and one working command (`/deploy`). Every future feature
(verification, self-roles, giveaways, Citizen IDs, contribution tracking,
leaderboards, raid management, mint reminders, dashboard integration) will
slot into this structure without requiring a rewrite.

## Tech Stack

- TypeScript
- Node.js (>=18.17)
- discord.js v14
- Supabase (`@supabase/supabase-js`)
- zod (env validation)
- ESLint + Prettier

## Project Structure

```
src/
├── commands/         Slash commands. One file per command, default-exports a `Command`.
├── events/            Discord.js client events (ready, interactionCreate, ...).
├── buttons/           Button interaction handlers.
├── modals/            Modal (pop-up form) submission handlers.
├── ui/                Design system: colors, icons, embed factory, button factory. See src/ui/README.md.
├── embeds/            Feature-specific embed *content*, built on top of ui/. See src/embeds/README.md.
├── services/          Business logic layer, sits between commands and the database.
├── database/          Supabase client + generated DB types.
├── handlers/          Loaders that scan commands/events folders and wire them up.
├── utils/             Cross-cutting helpers (logger, etc.).
├── config/            Env validation + non-secret bot configuration.
├── types/             Shared TypeScript interfaces (Command, Button, BotEvent, ...).
├── client.ts          Builds the Discord.js Client with our custom collections attached.
├── index.ts           Entry point — boots the bot. Orchestration only, no logic.
└── deploy-commands.ts Standalone script to push slash commands to Discord's API.
```

### Why this shape?

- **Everything is a "drop a file in" operation.** Adding a new slash
  command means creating `src/commands/mynewcommand.ts` that default-exports
  a `Command` object — `commandHandler.ts` finds and registers it
  automatically. Same pattern for events, buttons, and modals. No central
  "please also register this here" list to maintain or forget.
- **One router for all interactions.** Discord sends a single
  `interactionCreate` event for commands, buttons, AND modals.
  `events/interactionCreate.ts` is the one place that inspects the
  interaction type and dispatches to the right registry. Individual
  command/button/modal files never touch routing logic.
- **Commands vs. services.** Commands should stay thin: parse input, call a
  service, reply. Business logic (verification checks, giveaway draws,
  Citizen ID generation, contribution math) belongs in `services/`, which
  stays Discord-agnostic so it can be reused by future features (e.g. a
  dashboard hitting the same logic via an API route).
- **One Supabase client.** `database/supabase.ts` is the only file that
  calls `createClient`. Everything else imports `supabase` from there.
- **Fail fast on config.** `config/env.ts` validates every required
  environment variable with zod at startup. A missing `DISCORD_TOKEN`
  crashes immediately with a clear message instead of a cryptic error five
  minutes later.

## Design System (`src/ui/`)

Every embed and button in the bot is built through `src/ui/`, not
`new EmbedBuilder()` / `new ButtonBuilder()` directly — this is what keeps
rules, verification, giveaways, profiles, and leaderboards visually
consistent without anyone having to remember the brand color by hand.
It's enforced by ESLint (`npm run lint` fails if a file outside `src/ui/`
instantiates one of these builders directly), not just a convention.

```ts
import { embeds, buttons, row } from '../ui';

const embed = embeds.success({ title: 'Verified', description: 'You\u2019re in.' });
const actionRow = row(buttons.primary({ customId: 'next_step', label: 'Continue' }));
```

Full docs: [`src/ui/README.md`](src/ui/README.md).

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Where to get it |
|---|---|
| `DISCORD_TOKEN` | [Discord Developer Portal](https://discord.com/developers/applications) → your app → Bot → Reset/copy Token |
| `DISCORD_CLIENT_ID` | Same app → General Information → Application ID |
| `DISCORD_GUILD_ID` | Right-click your server in Discord (Developer Mode on) → Copy Server ID. Leave empty for global command deployment. |
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — the `service_role` secret, **not** the anon key |

### 3. Invite the bot to your server

In the Developer Portal → OAuth2 → URL Generator, select scopes
`bot` and `applications.commands`, grant the permissions your features will
need (at minimum `Send Messages`, `Embed Links`), and open the generated
URL to invite it.

### 4. Register slash commands

```bash
npm run deploy-commands
```

Run this again any time a command's name, description, or options change.
With `DISCORD_GUILD_ID` set, updates appear instantly — ideal for
development. Omit it in production for a global rollout (takes up to ~1
hour to propagate everywhere).

### 5. Run the bot

```bash
npm run dev     # development, auto-restarts on file changes
npm run build   # compiles to dist/
npm start       # runs the compiled output (production)
```

You should see:

```
[..] SUCCESS (CommandHandler) Loaded 1 command(s)
[..] SUCCESS (EventHandler)   Loaded 2 event(s)
[..] SUCCESS (Ready)          Logged in as YourBot#0000
[..] INFO    (Ready)          Serving 1 guild(s)
[..] INFO    (Ready)          1 command(s) active
```

## Usage (v1)

`/deploy [channel]` — sends a preview embed into the given channel (or the
current one). Requires "Manage Server" permission. This proves the full
pipeline (command → embed module → Discord API) works end to end, and is
the foundation the real embed-deployment system will be built on top of.

## Code Quality

```bash
npm run lint        # check for issues
npm run lint:fix     # auto-fix what's fixable
npm run format       # run Prettier
```

## Roadmap

This foundation is deliberately minimal. Planned next, in rough order:
verification, self-roles (buttons), the full custom-embed builder,
giveaways, WL winners, Citizen ID system, contribution tracking, member
profiles, leaderboards, raid management, mint reminders, and dashboard
integration. Each will live in its own `services/*Service.ts` plus the
relevant `commands/`, `buttons/`, and `modals/` files — the architecture
above doesn't change as they're added.
