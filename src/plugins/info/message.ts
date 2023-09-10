import { Category, ICategory, RateLimit, TIME_UNIT } from '@discordx/utilities';
import { Bot, DSimpleCommand, Guard, MetadataStorage, SimpleCommandMessage } from 'discordx';
import { Discord, SimpleCommand, SimpleCommandOption, SimpleCommandOptionType } from 'discordx';
import { bot } from '../../bot.js';
import { getPluginsBot } from '../../utils/config.js';
import { ChannelType, Collection, GuildCacheMessage, GuildMember, ThreadMemberManager, User } from 'discord.js';
import { Pagination, PaginationResolver, PaginationType } from '@discordx/pagination';
@Discord()
@Bot(...getPluginsBot('info'))
@Category('info')
@Guard(
  RateLimit(TIME_UNIT.seconds, 30, {
    rateValue: 3,
  }),
)
export class Fun {
  @SimpleCommand({
    name: 'botinfo',
    description: 'Get information about the bot 🤖',
  })
  async botinfo(command: SimpleCommandMessage) {
    let ctx = command.message;
    bot.extras.embed(
      {
        thumbnail: bot.user?.displayAvatarURL(),
        title: 'Some information about me!',
        desc: `____________________________`,
        fields: [
          {
            name: 'Information ℹ️',
            value: `I am  a bot with which you can run your entire server! With plenty of commands and features, you can create the perfect discord experience.`,
            inline: false,
          },
          {
            name: 'Servers 🌐',
            value: `\`${bot.guilds.cache.size}\` servers`,
            inline: true,
          },
          {
            name: 'Members 👥 ',
            value: `\`${bot.guilds.cache.reduce((a, b) => a + b.memberCount - 1, 0)}\` members`,
            inline: true,
          },
          {
            name: 'Channels 📺',
            value: `\`${bot.channels.cache.size}\` channels`,
            inline: true,
          },
          {
            name: 'Node.js Version 🏷',
            value: `\`${process.version}\``,
            inline: true,
          },
          {
            name: 'Bot memory 💾',
            value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}\` MB`,
            inline: true,
          },
        ],
        image:
          'https://media.discordapp.net/attachments/1090310002901778542/1118915842520907807/Server_Banner_Info_Aeona-1.jpg',
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'channelinfo',
    description: 'Get information about a channel 📺',
  })
  async channelinfo(command: SimpleCommandMessage) {
    let ctx: GuildCacheMessage<'cached'> = command.message as GuildCacheMessage<'cached'>;
    bot.extras.embed(
      {
        thumbnail: ctx.guild.iconURL() ?? undefined,
        title: `${ctx.channel.name} information ℹ️`,
        desc: `____________________________`,
        fields: [
          {
            name: 'Name',
            value: ctx.channel.name,
            inline: true,
          },
          {
            name: 'ID',
            value: ctx.channel.id,
            inline: true,
          },
          {
            name: 'Type',
            value: ChannelType[ctx.channel.type],
            inline: true,
          },
          {
            name: 'Mention',
            value: `<#${ctx.channel.id}>`,
            inline: true,
          },
          {
            name: 'Parent',
            value: `${ctx.channel.parentId ? `<#${ctx.channel.parentId}>` : 'None'}`,
            inline: true,
          },
          {
            name: 'Last Message',
            value: `${ctx.channel.lastMessage?.url ?? 'None'}`,
            inline: true,
          },
          {
            name: 'Members',
            value: `\`${
              ctx.channel.members instanceof ThreadMemberManager
                ? ctx.channel.members.cache.size
                : ctx.channel.members.size
            }\` members`,
            inline: true,
          },
          {
            name: 'Created At',
            value: `<t:${Math.floor(ctx.channel.createdTimestamp ?? 0 / 1000)}:F>`,
          },
        ],
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'userinfo',
    description: 'Get information about a user 👤',
  })
  async userinfo(command: SimpleCommandMessage) {
    let ctx = command.message;
    bot.extras.embed(
      {
        thumbnail: ctx.author.displayAvatarURL(),
        title: `${ctx.author.username} information ℹ️`,
        desc: `____________________________`,
        fields: [
          {
            name: 'ID',
            value: ctx.author.id,
            inline: true,
          },
          {
            name: 'Username',
            value: ctx.author.username,
            inline: true,
          },
          {
            name: 'Discriminator',
            value: ctx.author.discriminator,
            inline: true,
          },
          {
            name: 'Avatar',
            value: ctx.author.displayAvatarURL(),
            inline: true,
          },
        ],
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'emojis',
    description: 'Get information about the emojis of this server 🎉',
  })
  async emojis(command: SimpleCommandMessage) {
    let ctx = command.message;
    let Emojis = '';
    let EmojisAnimated = '';
    let EmojiCount = 0;
    let Animated = 0;
    let OverallEmojis = 0;

    ctx.guild!.emojis.cache.forEach((emoji) => {
      OverallEmojis++;
      if (emoji.animated) {
        Animated++;
        EmojisAnimated += `<a:${emoji.name}:${emoji.id}>`;
      } else {
        EmojiCount++;
        Emojis += `<:${emoji.name}:${emoji.id}>`;
      }
    });

    bot.extras.embed(
      {
        thumbnail: ctx.guild!.iconURL() ?? undefined,
        title: 'Emojis ℹ️',
        desc: `____________________________`,
        fields: [
          {
            name: `Animated [${Animated}]`,
            value: `${EmojisAnimated.substr(0, 1021)}...`,
            inline: false,
          },
          {
            name: `Standard [${EmojiCount}]`,
            value: `${Emojis.substr(0, 1021)}...`,
            inline: false,
          },
        ],
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'invite',
    description: 'Get the invite link of this bot! 🎉',
  })
  async invite(command: SimpleCommandMessage) {
    bot.extras.embed(
      {
        thumbnail: bot.user?.displayAvatarURL(),
        title: 'Invite',
        desc: `____________________________`,
        fields: [
          {
            name: 'Invite',
            value: `https://discord.com/oauth2/authorize?client_id=${bot.user?.id}&permissions=8&scope=bot`,
            inline: true,
          },
        ],
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'ping',
    description: 'Get the ping of this bot! 🏓',
  })
  async ping(command: SimpleCommandMessage) {
    bot.extras.embed(
      {
        thumbnail: bot.user?.displayAvatarURL(),
        title: 'Ping',
        desc: `____________________________`,
        fields: [
          {
            name: 'Ping',
            value: `${bot.ws.ping}ms`,
            inline: true,
          },
        ],
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'uptime',
    description: 'Get the uptime of this bot! 🕛',
  })
  async uptime(command: SimpleCommandMessage) {
    let totalSeconds = bot.uptime! / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    bot.extras.embed(
      {
        thumbnail: bot.user?.displayAvatarURL(),
        title: 'Uptime',
        desc: `____________________________`,
        fields: [
          {
            name: 'Uptime',
            value: `${days}d ${hours}h ${minutes}m ${seconds}s`,
            inline: true,
          },
        ],
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'perks',
    description: 'Get information about the perks of this Aeona Premium 🎉',
  })
  async perks(command: SimpleCommandMessage) {
    bot.extras.embed(
      {
        title: `Aeona Premium`,
        desc: `
With this you get:
• Removes all Aeonic Development Branding
• Access to beta features & news
• Premium Support
• **Hoisted Role**
• **No upvote needed**
• You no longer have to vote to use \`+imagine\`
• Disable A.I NSFW filter
• **Unlocks A.I Auto Mod (Coming Soon)**
• Ability to setup **chatbot** in up to \`8\` channels.
• Ability to setup **starboard** in up to \`8\` channels.
• Ability to setup **boosting and unboosting messages** in up to \`8\` channels.
• Ability to setup up to \`8\` **welcome systems**.
• Ability to setup up to \`8\` **leave systems**.
• Ability to setup up to \`8\` **level messaging systems**.
• Ability to setup **counting** in up to \`8\` channels.
• Ability to setup **guess the number** in up to \`8\` channels.
• Ability to setup **guess the word** in up to \`8\` channels.

You can get premium for just **$2.99** at [here](https://patreon.com/aeonapatreon) \n **or** \n *boost our [support server](https://www.aeona.xyz/support)*. \n Use \`+perks\` to see all the perks of premium.
`,
        image:
          'https://media.discordapp.net/attachments/1090310002901778542/1118915821356470392/Server_Banner_Aeona_Premium_Aeona-1.jpg',
        type: 'reply',
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'support',
    description: 'Get the support server link! 🔗',
  })
  async support(command: SimpleCommandMessage) {
    bot.extras.embed(
      {
        thumbnail: bot.user?.displayAvatarURL(),
        title: 'Support',
        desc: `____________________________`,
        fields: [
          {
            name: 'Support Server',
            value: `https://aeonabot.xyz/support`,
            inline: true,
          },
        ],
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'vote',
    description: 'Get the topp.gg link! 🔗',
  })
  async vote(command: SimpleCommandMessage) {
    bot.extras.embed(
      {
        thumbnail: bot.user?.displayAvatarURL(),
        title: 'Vote',
        desc: `____________________________`,
        fields: [
          {
            name: 'Vote',
            value: `https://top.gg/bot/${bot.user?.id}/vote`,
            inline: true,
          },
        ],
      },
      command,
    );
  }

  @SimpleCommand({
    name: 'help',
    description: 'Get the help menu! 📖',
  })
  async help(command: SimpleCommandMessage) {
    const embeds = [
      bot.extras.createEmbed({
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

**[To learn how to use me read my documentation](https://docs.aeonabot.xyz/)**
### Use the dropdown to see all my commands.`,
      }),
    ];

    const commands = MetadataStorage.instance.simpleCommands as unknown as (DSimpleCommand & ICategory)[];

    const categories = new Collection<string, (DSimpleCommand & ICategory)[]>();
    for (const command of commands) {
      if (!categories.has(command.category ?? 'General')) {
        categories.set(command.category ?? 'General', [command]);
      } else {
        const c = categories.get(command.category ?? 'General')!;
        if (c.length < 25) categories.get(command.category ?? 'General')?.push(command);
        else if (!categories.has(command.category + '-2')) {
          categories.set(command.category + '-2', [command]);
        } else categories.get(command.category + '-2')?.push(command);
      }
    }

    for (const [category, commands] of categories) {
      embeds.push(
        bot.extras.createEmbed({
          desc: `# **${bot.extras.capitalizeFirstLetter(category)}**
### Total commands: ${commands.length}`,
          fields: commands.map((command) => ({
            name: '<:F_Arrow:1049291677359153202>' + command.description,
            value:
              '`+' +
              command.name +
              command.options.map((o) => ' <' + o.name + '>').join('') +
              '`' +
              `${command.options.length > 0 ? '\n' : ''}${
                command.options
                  .map((o) => '<:F_Arrow:1049291677359153202> **' + o.name + '**: ' + o.description)
                  .join('\n') + '\n\n _ _'
              }`,
          })),
        }),
      );
    }

    const pagination = new Pagination(
      command.message,
      embeds.map((e) => {
        return { embeds: [e] };
      }),
      {
        type: PaginationType.SelectMenu,
        showStartEnd: false,
        idle: 1000 * 60 * 20,
        placeholder: 'Choose a category to explore....',
        labels: {
          end: 'Last',
          start: 'First',
        },
        pageText: ['Home', ...categories.map((c, key) => bot.extras.capitalizeFirstLetter(key))],
      },
    );

    await pagination.send();
  }
}
