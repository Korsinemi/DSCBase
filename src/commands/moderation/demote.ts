import { CommandOptions, Context, calculateBasePermissions } from '@thereallonewolf/amethystframework';
import { Permissions } from '@discordeno/bot';
import { AeonaBot } from '../../extras/index.js';

export default {
  name: 'demote',
  description: 'Demote a user.',
  commandType: ['application', 'message'],
  category: 'moderation',
  args: [
    {
      name: 'user',
      description: 'The user to demote.',
      required: true,
      type: 'User',
    },
  ],
  userGuildPermissions: ['MANAGE_GUILD'],
  async execute(client: AeonaBot, ctx: Context) {
    if (!ctx.guild || !ctx.user || !ctx.channel) return;

    const member = await client.helpers.getMember(`${ctx.guild!.id}`, (await ctx.options.getUser('user', true)).id);
    member.permissions = new Permissions(calculateBasePermissions(ctx.guild!, ctx.member!));
    await client.helpers
      .removeRole(`${ctx.guild!.id}`, `${member.id}`, member.roles[member.roles.length - 1])
      .then(async (_r) => {
        const channel = await client.helpers.getDmChannel(member.id);
        client.extras
          .embed(
            {
              title: `Demote`,
              desc: `You've been demoted from **${ctx.guild?.name}**`,
              fields: [
                {
                  name: '<:members:1063116392762712116> Moderator',
                  value: `${ctx.user?.username}#${ctx.user?.discriminator}`,
                  inline: true,
                },
              ],
            },
            channel,
          )
          .catch();

        client.extras.succNormal(
          {
            text: `User successfully demoted`,
            fields: [
              {
                name: '<:members:1063116392762712116> User',
                value: `<@${member.id}>`,
                inline: true,
              },
            ],
            type: 'reply',
          },
          ctx,
        );
      })
      .catch(() => {
        client.extras.errNormal(
          {
            error: "I can't demote the user",
            type: 'reply',
          },
          ctx,
        );
      });
  },
} as CommandOptions;
