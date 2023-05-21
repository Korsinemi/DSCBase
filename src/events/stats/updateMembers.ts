import { Guild } from '@discordeno/bot';

import Schema from '../../database/models/stats.js';
import { AeonaBot } from '../../extras/index.js';

export default async (client: AeonaBot, guild: Guild) => {
  try {
    const data = await Schema.findOne({ Guild: guild.id });
    if (!data || !data.Members) return;

    let channelName = await client.extras.getTemplate(guild.id);
    channelName = channelName.replace(`{emoji}`, '👤');
    channelName = channelName.replace(
      `{name}`,
      `Members: ${(guild.approximateMemberCount ?? guild.memberCount ?? 1)?.toLocaleString()}`,
    );

    client.helpers.editChannel(data.Members, {
      name: channelName,
    });
  } catch {
    //Fix lint error
  }
};
