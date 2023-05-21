import { AmethystEmbed } from '@thereallonewolf/amethystframework';
import { Guild } from '@discordeno/bot';

import { AeonaBot } from '../../extras/index.js';

export default async (client: AeonaBot, guild: Guild) => {
  if (guild == undefined) return;
  if (client.extras.guildIds.includes(guild.id)) return;

  client.extras.guildcount++;
  client.extras.guildIds.push(guild.id);
  client.extras.requestMembersGuilds.push(guild.id);

  if (Date.now() > client.extras.startTime + 10 * 60 * 1000) {
    const embed = new AmethystEmbed()
      .setTitle('Added to a new server!')
      .addField('Total servers:', `${client.extras.guildcount}`, true)
      .addField('Server name', `${guild.name}`, true)
      .addField('Server ID', `${guild.id}`, true)
      .addField('Server members', `${guild.approximateMemberCount ?? guild.memberCount ?? 1}`, true)
      .addField('Server owner', `<@${guild.ownerId}> (${guild.ownerId})`, true);

    client.extras.webhook({
      embeds: [embed],
    });
    if (guild.publicUpdatesChannelId) {
      const channel = guild.channels.get(guild.publicUpdatesChannelId);
      if (channel) {
        client.helpers.followAnnouncement('1057248837238009946', `${channel.id}`);
      }
    }
  }
};
