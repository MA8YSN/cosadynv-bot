import {
  TextChannel,
  ChannelType,
  type Guild,
} from "discord.js";
import { buildMintReminderEmbed, type ReminderInterval } from "../embeds/mintReminderEmbed";
import { type MintProject } from "../database/mintProjects.repository";
import { MINT_REMINDER_CONFIG } from "../config/mintReminder.config";

export class MintReminderPresentation {
  constructor() {}

  private async getReminderChannel(guild: Guild): Promise<TextChannel | null> {
    console.log(
      `[MintReminderPresentation] 🔍 Looking for channel "${MINT_REMINDER_CONFIG.channelName}" in guild "${guild.name}"`
    );

    // Force fetch full channel list if cache is empty
    if (guild.channels.cache.size === 0) {
      console.log("[MintReminderPresentation] ⚠️  Channel cache empty — fetching from API...");
      await guild.channels.fetch();
    }

    console.log(
      `[MintReminderPresentation] 📋 Channels in cache (${guild.channels.cache.size} total):`
    );
    guild.channels.cache.forEach((c) => {
      console.log(`  • #${c.name} (type=${c.type}, id=${c.id})`);
    });

    const channel = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        c.name === MINT_REMINDER_CONFIG.channelName
    ) as TextChannel | undefined;

    if (!channel) {
      console.warn(
        `[MintReminderPresentation] ❌ Channel "${MINT_REMINDER_CONFIG.channelName}" NOT FOUND`
      );
      console.warn(
        `[MintReminderPresentation] ℹ️  Make sure the channel exists and the name matches exactly (including emoji)`
      );
      return null;
    }

    console.log(
      `[MintReminderPresentation] ✅ Found channel: #${channel.name} (${channel.id})`
    );
    return channel;
  }

  async sendReminder(
    guild: Guild,
    project: MintProject,
    interval: ReminderInterval
  ): Promise<boolean> {
    console.log(
      `[MintReminderPresentation] 📤 Preparing to send "${interval.key}" reminder for "${project.name}"`
    );

    const channel = await this.getReminderChannel(guild);
    if (!channel) return false;

    // Check bot permissions
    const me = guild.members.me;
    if (me) {
      const perms = channel.permissionsFor(me);
      console.log(`[MintReminderPresentation] 🔐 Bot permissions in #${channel.name}:`);
      console.log(`  • SendMessages: ${perms?.has("SendMessages")}`);
      console.log(`  • EmbedLinks: ${perms?.has("EmbedLinks")}`);
      console.log(`  • ViewChannel: ${perms?.has("ViewChannel")}`);

      if (!perms?.has("SendMessages") || !perms?.has("EmbedLinks")) {
        console.error(
          `[MintReminderPresentation] ❌ Bot missing permissions in #${channel.name} — cannot send message`
        );
        return false;
      }
    }

    // Build embed
    const { embed, row } = buildMintReminderEmbed(project, interval);
    console.log(`[MintReminderPresentation] ✅ Embed built for "${project.name}"`);

    // Ping role
    let content: string | undefined;
    if (MINT_REMINDER_CONFIG.pingRoleName) {
      if (guild.roles.cache.size === 0) {
        console.log("[MintReminderPresentation] ⚠️  Role cache empty — fetching...");
        await guild.roles.fetch();
      }
      const pingRole = guild.roles.cache.find(
        (r) => r.name === MINT_REMINDER_CONFIG.pingRoleName
      );
      if (pingRole) {
        content = `<@&${pingRole.id}>`;
        console.log(`[MintReminderPresentation] 🔔 Pinging role: @${pingRole.name} (${pingRole.id})`);
      } else {
        console.warn(
          `[MintReminderPresentation] ⚠️  Ping role "${MINT_REMINDER_CONFIG.pingRoleName}" not found — sending without ping`
        );
      }
    }

    // Send
    console.log(
      `[MintReminderPresentation] 📨 Sending message to #${channel.name}...`
    );
    try {
      const message = await channel.send({
        content,
        embeds: [embed],
        components: [row],
      });
      console.log(
        `[MintReminderPresentation] ✅ Message sent — id=${message.id} url=${message.url}`
      );
      return true;
    } catch (err) {
      console.error(
        `[MintReminderPresentation] ❌ Discord API error when sending message:`,
        err
      );
      return false;
    }
  }
}