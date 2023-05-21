import { CommandOptions, Components, Context } from '@thereallonewolf/amethystframework';
import { SelectOption } from '@discordeno/bot';

import { AeonaBot } from '../../extras/index.js';

export default {
  name: 'help',
  description: 'See the commands',
  commandType: ['application', 'message'],
  category: 'info',
  args: [],
  async execute(client: AeonaBot, ctx: Context) {
    if (!ctx.guild || !ctx.user || !ctx.channel) return;
    let options: SelectOption[] = [];
    const comp = new Components();
    try {
      client.category.forEach((c) => {
        options.push({
          label: `${client.extras.capitalizeFirstLetter(c.name)}`,
          value: `${c.name}`,
          description: `${c.description}`,
        });
      });
      const options2 = options.slice(0, options.length / 2);
      options = options.slice(options.length / 2);
      comp.addSelectComponent('Choose which commands to see. (1/2)', 'help_select', options2);
      comp.addSelectComponent('Choose which commands to see. (2/2)', 'help_select1', options);
      client.extras.embed(
        {
          title: `My Help menu!`,
          desc: `Oh, Hi there. <:kanna_wave:1053256324084928562>
Let me help you get your server going.

**Want to setup chatbot?**
Use \`+setup chatbot <channel>\` or
\`+autosetup chatbot\` to have me make a channel for you.

**Want to setup bump reminder?**
Well then run \`+bumpreminder setup <channel> <role>\`

**Want to generate some art?**
Use \`+imagine <prompt>\`

Our hosting partner and premium hosting provider.
__Datalix__ - Secure, fast and reliable
Use this [link](https://datalix.eu/a/aeona) to get VPS at cheap prices.

**[To learn how to use me read my documentation](https://docs.aeona.xyz/)**
Use the dropdown to see all my commands.
				`,
          components: comp,
          type: 'reply',
        },
        ctx,
      );
    } catch (e) {
      console.log(`Error Help: ${e}`);
    }
  },
} as CommandOptions;
