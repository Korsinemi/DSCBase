import { CommandOptions, Context } from '@thereallonewolf/amethystframework';
import { Blob } from 'buffer';
import Canvacord from 'canvacord';
import { avatarUrl } from '@discordeno/bot';
import GuildDB from '../../database/models/guild.js';
import { AeonaBot } from '../../extras/index.js';

export default {
  name: 'rank',
  description: 'See your rank.',
  commandType: ['application', 'message'],
  category: 'levels',
  args: [
    {
      name: 'user',
      description: 'The user you want to see the rank of.',
      required: false,
      type: 'User',
    },
  ],
  async execute(client: AeonaBot, ctx: Context) {
    if (!ctx.guild || !ctx.user || !ctx.channel) return;
    const data = await GuildDB.findOne({ Guild: ctx.guild!.id });

    if (data && data.Levels == true) {
      const target = (await ctx.options.getUser('user')) || ctx.user;
      const user = await client.extras.fetchLevels(target.id, ctx.guild!.id);
      if (!user) return;
      const xpRequired = client.extras.xpFor(user.level! + 1);

      const rankCard = new Canvacord.Rank()
        .setAvatar(
          avatarUrl(`${target.id}`, target.discriminator, {
            avatar: target.avatar,
            format: 'png',
          }),
        )
        .setRequiredXP(xpRequired)
        .setCurrentXP(user.cleanXp)
        .setLevel(user.level!)
        .setProgressBar('#FFFFFF', 'COLOR')
        .setUsername(target.username)
        .setDiscriminator(target.discriminator)
        .setStatus('dnd', true)
        .setRank(user.position);

      const data = await rankCard.build({});
      ctx.reply({
        files: client.extras.findFiles([
          {
            name: 'image.png',
            blob: new Blob([data], {
              type: 'image/png',
            }),
          },
        ]),
      });
    } else {
      client.extras.errNormal(
        {
          error: 'Levels are disabled in this guild!',
          type: 'reply',
        },
        ctx,
      );
    }
  },
} as CommandOptions;
