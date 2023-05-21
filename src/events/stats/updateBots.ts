import { Guild } from '@discordeno/bot';

import Schema from '../../database/models/stats.js';
import { AeonaBot } from '../../extras/index.js';

export default async (client: AeonaBot, guild: Guild) => {
  try {
    const data = await Schema.findOne({ Guild: guild.id });
    if (!data || !data.Bots) return;
    const members = await client.helpers.getMembers(`${guild.id}`, {});

    let channelName = await client.extras.getTemplate(guild.id);
    channelName = channelName.replace(`{emoji}`, '🤖');
    channelName = channelName.replace(
      `{name}`,
      `Bots: ${members.filter((member) => (member.user?.toggles.bot ? true : false)).length || 0}`,
    );

    client.helpers.editChannel(data.Bots, {
      name: channelName,
    });
  } catch {
    //Fix lint error
  }
};
