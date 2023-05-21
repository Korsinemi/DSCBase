import { Message } from '@discordeno/bot';

import bumpreminder from '../../database/models/bumpreminder.js';
import { AeonaBot } from '../../extras/index.js';

export default async (client: AeonaBot, message: Message) => {
  client.extras.messageCount++;

  if (!message.author.bot) return client.emit('messageCreateNoBots', client, message);

  if (
    message.embeds.length &&
    message.embeds[0].description &&
    message.embeds[0].description.indexOf('Bump done') > -1
  ) {
    const schema = await bumpreminder.findOne({ Guild: message.guildId });
    if (schema) {
      client.helpers.sendMessage(message.channelId, {
        content: 'Thank you for bumping us! <:AH_LoveCat:1013087175555948544> \n I shall remind you in 2 hours.',
      });
      schema.LastBump = Date.now();
      schema.save();
    }
  }
};
