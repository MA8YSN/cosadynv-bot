import {
  
  TextChannel,
  ChannelType,
  type Guild,
  type Role,
} from "discord.js";
import { buildMintReminderEmbed, type ReminderInterval } from "../embeds/mintReminderEmbed";
import { type MintProject } from "../database/mintProjects.repository";
import { MINT_REMINDER_CONFIG } from "../config/mintReminder.config";

export class MintReminderPresentation {
  constructor() {}

  private async getReminderChannel(guild: Guild): Promise<TextChannel | null> {
    const channel = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        c.name === MINT_REMINDER_CONFIG.channelName
    ) as TextChannel | undefined;

    return channel ?? null;
  }

  private async getPingRole(guild: Guild): Promise<Role | null> {
    if (!MINT_REMINDER_CONFIG.pingRoleName) return null;

    const role = guild.roles.cache.find(
      (r) => r.name === MINT_REMINDER_CONFIG.pingRoleName
    );

    return role ?? null;
  }

  async sendReminder(
    guild: Guild,
    project: MintProject,
    interval: ReminderInterval
  ): Promise<boolean> {
    const channel = await this.getReminderChannel(guild);

    if (!channel) {
      console.warn(
        `[MintReminderPresentation] Channel "${MINT_REMINDER_CONFIG.channelName}" not found in guild ${guild.name}`
      );
      return false;
    }

    const { embed, row } = buildMintReminderEmbed(project, interval);

    const pingRole = await this.getPingRole(guild);
    const content = pingRole ? `<@&${pingRole.id}>` : undefined;

    await channel.send({
      content,
      embeds: [embed],
      components: [row],
    });

    console.log(
      `[MintReminderPresentation] Sent ${interval.key} reminder for "${project.name}" in ${guild.name}`
    );

    return true;
  }
}