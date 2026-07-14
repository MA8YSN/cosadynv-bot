# embeds/

Feature-specific embed *templates* — the actual content for a specific
embed (e.g. "here's what the rules panel says", "here's what a giveaway
announcement looks like").

This is **not** where styling/branding decisions live — that's
[`src/ui/`](../ui/README.md). Every file in here should compose the design
system (`embeds.brand(...)`, `embeds.success(...)`, etc. from `'../ui'`)
rather than touching `EmbedBuilder`, colors, or icons directly.

Rule of thumb:
- "What color is a success embed?" → `src/ui`
- "What does the verification panel say?" → `src/embeds`

As features grow, group templates by feature
(`embeds/verification/panel.ts`, `embeds/giveaways/announcement.ts`) the
same way `commands/` can be grouped.
