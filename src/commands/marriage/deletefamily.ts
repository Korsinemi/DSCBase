import { CommandOptions, Components, Context } from '@thereallonewolf/amethystframework';

import Schema from '../../database/models/family.js';
import { AeonaBot } from '../../extras/index.js';

export default {
  name: 'deletefamily',
  description: 'Delete your family',
  commandType: ['application', 'message'],
  category: 'marriage',
  args: [],
  async execute(client: AeonaBot, ctx: Context) {
    if (!ctx.guild || !ctx.user || !ctx.channel) return;
    const row = new Components()
      .addButton('Yes', 'Success', 'family_delete', { emoji: '✅' })
      .addButton('No', 'Danger', 'family_stop', { emoji: '❌' });

    const message = await client.extras.embed(
      {
        title: `Reset family`,
        desc: `Are you sure you want to reset your family?`,
        components: row,
        type: 'reply',
      },
      ctx,
    );

    const filter = (bot, i: any) => i.user.id === ctx.user?.id;

    client.utils
      .awaitComponent(message.id, {
        filter,
        type: 'Button',
      })
      .then(async (i) => {
        if (i.data?.customId == 'family_delete') {
          await Schema.findOneAndDelete({
            User: `${ctx.author?.id}`,
          });
          const parent = await Schema.findOne({
            Parent: `${ctx.author?.id}`,
          });
          const partner = await Schema.findOne({
            Partner: `${ctx.author?.id}`,
          });

          if (parent) {
            parent.Parent = [];
            parent.save();
          }

          if (partner) {
            partner.Partner = '';
            partner.save();
          }

          client.extras.succNormal({ text: `Your family has been deleted!`, type: 'edit' }, ctx);
        }
        if (!ctx.channel?.id) return;
        client.helpers.deleteMessage(`${ctx.channel?.id}`, `${message.id}`);
      })
      .catch((_err) => {
        client.extras.errNormal({ error: "Time's up! Cancelled backup loading!", type: 'edit' }, ctx);
      });
  },
} as CommandOptions;
