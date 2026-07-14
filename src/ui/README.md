# ui/ — Design System

The single place that defines what the bot *looks* like. Every embed and
button in the bot — now and in every future feature — must be built
through this module instead of instantiating discord.js builders directly.
This is enforced by ESLint, not just convention (see bottom of this file).

## Files

| File | Purpose |
|---|---|
| `theme.ts` | Brand colors and icons. Change a value here, it updates everywhere. |
| `embed.ts` | `createEmbed()` + semantic presets (`embeds.success`, `.error`, `.warning`, `.info`, `.brand`). The only file allowed to call `new EmbedBuilder()`. |
| `buttons.ts` | `buttons.primary/secondary/success/danger/link` + `row()` to wrap them into an action row. |
| `selectMenu.ts` | Reserved for the select-menu factory — not built yet, no feature needs one. |
| `modal.ts` | Reserved for the modal factory — not built yet. |
| `index.ts` | Barrel export. Always import from `'../ui'`, never from an individual file inside it. |

## Usage

```ts
import { embeds, buttons, row } from '../ui';

// A status reply
await interaction.reply({
  embeds: [embeds.success({ title: 'Verified', description: 'You now have access.' })],
});

// A branded feature panel with a button
const embed = embeds.brand({
  title: 'Server Rules',
  icon: 'shield',
  description: 'Read and accept the rules below to gain access.',
});

const actionRow = row(
  buttons.success({ customId: 'rules_accept', label: 'I Agree', icon: 'success' }),
);

await channel.send({ embeds: [embed], components: [actionRow] });
```

## Why this exists

Without a central design system, feature #12 (leaderboards) ends up with
slightly different footer text, a different shade of "success green", and
a button labeled "Confirm" while feature #3 (verification) used "Accept" —
because ten different command files each made their own small styling
decision. Centralizing those decisions here means:

- **One place to rebrand.** Change `theme.colors.primary` and every embed
  in the bot updates.
- **New features inherit the visual language for free.** A new command
  file never has to decide what an error embed looks like — it just calls
  `embeds.error(...)`.
- **Consistency is structural, not a code-review reminder.**

## Enforcement

`eslint.config.js` blocks `new EmbedBuilder()` and `new ButtonBuilder()`
anywhere outside `src/ui/**`. If you see:

```
Do not instantiate EmbedBuilder directly — use createEmbed()/embeds.* from src/ui instead...
```

...it means a command/service reached for the raw discord.js builder
instead of the design system. Import from `'../ui'` instead.

When `selectMenu.ts` / `modal.ts` are implemented, add the same
restriction for `StringSelectMenuBuilder` / `ModalBuilder` to keep this
guarantee complete.
