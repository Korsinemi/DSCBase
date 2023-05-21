import { CommandOptions, Context } from '@thereallonewolf/amethystframework';
import { execSync } from 'child_process';
import { AeonaBot } from '../../extras/index.js';

export default {
  name: 'shell',
  description: 'Remove all the excess databases.',
  commandType: ['application', 'message'],
  category: 'owner',
  args: [
    {
      name: 'code',
      type: 'String',
      required: true,
    },
  ],
  ownerOnly: true,
  async execute(client: AeonaBot, ctx: Context) {
    if (!ctx.guild || !ctx.user || !ctx.channel) return;

    ctx.reply({ content: `Succesfully executed. \n ${execSync(ctx.options.getLongString('code')).toString('ascii')}` });
  },
} as CommandOptions;