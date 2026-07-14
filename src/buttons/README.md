# buttons/

Each file here exports a default `Button` (see `types/index.ts`):

```ts
import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';

const button: Button = {
  customId: 'my_button_id',
  async execute(interaction: ButtonInteraction) {
    await interaction.reply({ content: 'Clicked!', ephemeral: true });
  },
};

export default button;
```

Picked up automatically via `interactionCreate` routing (see
`events/interactionCreate.ts`) — no manual registration needed. Unlike
slash commands, buttons don't need to be "deployed" to Discord's API; they
just need to exist in this folder before a user clicks a button with a
matching `customId`.
