import { CommandOptions, Context } from '@thereallonewolf/amethystframework';

import { AeonaBot } from '../../extras/index.js';

export default {
  name: 'channelinfo',
  description: 'channelinfo',
  commandType: ['application', 'message'],
  category: 'info',
  args: [
    {
      name: 'channel',
      description: 'Channel to get details of',
      required: true,
      type: 'Channel',
    },
  ],
  async execute(client: AeonaBot, ctx: Context) {
    if (!ctx.guild || !ctx.user || !ctx.channel) return;
    const channel = await ctx.options.getChannel('channel', true);
    if (!channel) return;
    client.extras.embed(
      {
        title: `Channel information`,
        desc: `Channel information about: <#${channel.id}>`,
        fields: [
          {
            name: 'Type',
            value: `${channel.type}`,
            inline: true,
          },
          {
            name: 'ID',
            value: `${channel.id}`,
            inline: true,
          },
          {
            name: 'Type',
            value: `${channel.type}`,
            inline: true,
          },
          {
            name: 'Subject',
            value: `${channel.topic ? channel.topic : 'N/A'}`,
            inline: true,
          },
          {
            name: 'NSFW',
            value: `${channel.nsfw}`,
            inline: true,
          },
          {
            name: 'Parent',
            value: `${channel.parentId ? channel.parentId : 'N/A'}`,
            inline: true,
          },
        ],
        type: 'reply',
      },
      ctx,
    );
  },
} as CommandOptions;
