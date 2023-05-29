import { AmethystBot, AmethystCollection, Components, Context } from '@thereallonewolf/amethystframework';
import { Channel, Role, VoiceState, FileContent, decode } from '@discordeno/bot';
import { BigString } from '@discordeno/types';

import config from '../botconfig/bot.js';
import GuildDB from '../database/models/guild.js';
import levels from '../database/models/levels.js';
import Schema from '../database/models/logChannels.js';
import Stats from '../database/models/stats.js';
import ticketChannels from '../database/models/ticketChannels.js';
import ticketSchema from '../database/models/tickets.js';
import { createTranscript } from '../transcripts/index.js';
import embeds from './embed.js';
import { Config } from '../config.js';
import { InfluxDB } from '@influxdata/influxdb-client';

const INFLUX_ORG = process.env.INFLUX_ORG as string;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET as string;
const INFLUX_TOKEN = process.env.INFLUX_TOKEN as string;
const INFLUX_URL = process.env.INFLUX_URL as string;
const influxDB = INFLUX_URL && INFLUX_TOKEN ? new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN }) : undefined;

export interface AeonaBot extends AmethystBot {
  extras: ReturnType<typeof additionalProps>;
}

const parts = process.env.WEBHOOKURL!.split('/');
const token = parts.pop() || '';
const id = parts.pop();
export function additionalProps(botConfig: Config, client: AeonaBot) {
  return {
    ...embeds(client),
    influxQuery: influxDB?.getQueryApi(INFLUX_ORG),
    influx: influxDB?.getWriteApi(INFLUX_ORG, INFLUX_BUCKET),
    version: 'v0.2.0',
    botConfig: botConfig,
    webhook: async (content: any) => {
      return await client.helpers.executeWebhook(id as BigString, token, content);
    },
    startTime: new Date().getTime(),
    config: config,
    colors: config.colors,
    emotes: config.emotes,
    messageCount: 0,
    guildcount: 0,
    guildIds: [] as bigint[],
    requestMembersGuilds: [] as bigint[],
    ready: false,
    playerManager: new Map(),
    triviaManager: new Map(),
    queue: new Map(),
    voiceStates: new AmethystCollection<string, VoiceState>(),
    findFiles(file: unknown): FileContent[] {
      if (!file) {
        return [];
      }

      const files: unknown[] = Array.isArray(file) ? file : [file];
      return files.filter(client.extras.coerceToFileContent);
    },

    coerceToFileContent(value: unknown): value is FileContent {
      if (!value || typeof value !== 'object') {
        return false;
      }

      const file = value as Record<string, unknown>;
      if (typeof file.name !== 'string') {
        return false;
      }

      switch (typeof file.blob) {
        case 'string': {
          const match = file.blob.match(/^data:(?<mimeType>[a-zA-Z0-9/]*);base64,(?<content>.*)$/);
          if (match?.groups === undefined) {
            return false;
          }
          const { mimeType, content } = match.groups;
          file.blob = new Blob([decode(content)], { type: mimeType });
          return true;
        }
        case 'object':
          return file.blob instanceof Blob;
        default:
          return false;
      }
    },
    capitalizeFirstLetter: (string: string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    buttonReactions(id: any, reactions: any[]) {
      const comp = new Components();
      for (const reaction of reactions) {
        comp.addButton('', 'Secondary', `reaction_button-${reaction}`, {
          emoji: `${reaction}`,
        });
      }

      return comp;
    },
    async getLogs(guildId: any) {
      const data = await Schema.findOne({ Guild: guildId });
      if (data && data.Channel) {
        const channel = await client.cache.channels.get(BigInt(data.Channel));
        return channel;
      }
      return false;
    },
    async isPremium(guildId: bigint) {
      let guildDB = await GuildDB.findOne({ Guild: `${guildId}` });
      if (!guildDB)
        guildDB = new GuildDB({
          Guild: `${guildId}`,
        });
      return guildDB.isPremium === 'true';
    },
    async createChannelSetup(Schema: any, channel: Channel, interaction: Context) {
      Schema.findOne({ Guild: interaction.guildId }, async (err: any, data: { Channel: bigint; save: () => void }) => {
        if (data) {
          data.Channel = channel.id;
          data.save();
        } else {
          new Schema({
            Guild: interaction.guildId,
            Channel: `${channel.id}`,
          }).save();
        }
      });

      client.extras.embed(
        {
          title: 'Successful!',
          desc: `Channel has been set up successfully! \n **[To learn how to use me read my documentation](https://docs.aeona.xyz/)**`,
          fields: [
            {
              name: `<:channel:1049292166343688192> Channel`,
              value: `<#${channel.id}> (${channel.id})`,
            },
          ],
          type: 'reply',
        },
        interaction,
      );
    },
    async createRoleSetup(Schema: any, role: Role, interaction: Context) {
      Schema.findOne({ Guild: interaction.guildId }, async (err: any, data: { Role: bigint; save: () => void }) => {
        if (data) {
          data.Role = role.id;
          data.save();
        } else {
          new Schema({
            Guild: interaction.guildId,
            Role: `${role.id}`,
          }).save();
        }
      });

      client.extras.embed(
        {
          title: `Successful`,
          desc: `Role has been set up successfully!`,
          fields: [
            {
              name: `<:role:1062978537436491776> Role`,
              value: `<@&${role.id}> (${role.id})`,
            },
          ],
          type: 'reply',
        },
        interaction,
      );
    },
    async generateEmbed(start: any, end: number, lb: any[], title: any) {
      const current = lb.slice(start, end + 10);
      const result = current.join('\n');

      const embed = client.extras.templateEmbed().setTitle(`${title}`).setDescription(`${result.toString()}`);

      return embed;
    },

    async createLeaderboard(title: any, lb: any[], interaction: Context, currentIndex?: number) {
      if (!currentIndex) currentIndex = 0;
      let btn1 = true;
      let btn2 = true;

      if (currentIndex !== 0) btn1 = false;
      if (currentIndex + 10 < lb.length) btn2 = false;
      const comp = new Components()
        .addButton('Previous', 'Secondary', 'back_button', {
          emoji: '1049292169535561819',
          disabled: btn1,
        })
        .addButton('Next', 'Secondary', 'forward_button', {
          emoji: '1049292172479955024',
          disabled: btn2,
        });
      const msg = await client.helpers.sendMessage(interaction.channel!.id, {
        embeds: [await client.extras.generateEmbed(currentIndex, currentIndex, lb, title)],
        components: comp,
      });

      if (lb.length <= 10) return;
      client.utils

        .awaitComponent(msg.id, {
          timeout: 60_000,
          type: 'Button',
        })
        .then(async (btn) => {
          if (!currentIndex) return;

          btn.data?.customId === 'back_button' ? (currentIndex -= 10) : (currentIndex += 10);
          client.extras.createLeaderboard(title, lb, interaction, currentIndex);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    getTemplate: async (guild: bigint) => {
      try {
        const data = await Stats.findOne({ Guild: `${guild}` });

        if (data && data.ChannelTemplate) {
          return data.ChannelTemplate;
        }
        return `{emoji} {name}`;
      } catch {
        return `{emoji} {name}`;
      }
    },
    async getTicketData(interaction: Context) {
      const ticketData = await ticketSchema.findOne({
        Guild: interaction.guildId,
      });
      if (!ticketData) return false;

      return ticketData;
    },

    async getChannelTicket(interaction: Context) {
      const ticketChannelData = await ticketChannels.findOne({
        Guild: interaction.guildId,
        channelID: `${interaction.channel?.id}`,
      });
      return ticketChannelData;
    },

    async isTicket(interaction: Context) {
      const ticketChannelData = await ticketChannels.findOne({
        Guild: `${interaction.guild!.id}`,
        channelID: `${interaction.channel!.id}`,
      });

      if (ticketChannelData) {
        return true;
      }
      return false;
    },

    async transcript(client: AeonaBot, channel: Channel) {
      const file = await createTranscript(client, channel);

      client.helpers.sendMessage(`${channel.id}`, {
        files: [file],
      });
    },
    async setXP(userId: bigint, guildId: bigint, xp: number) {
      const user = await levels.findOne({ userID: userId, guildID: guildId });
      if (!user) return false;

      user.xp = xp;
      user.level = Math.floor(0.1 * Math.sqrt(user.xp));
      user.lastUpdated = new Date();

      user.save();

      return user;
    },

    async setLevel(userId: bigint, guildId: bigint, level: number) {
      const user = await levels.findOne({ userID: userId, guildID: guildId });
      if (!user) return false;

      user.level = level;
      user.xp = level * level * 100;
      user.lastUpdated = new Date();

      user.save();

      return user;
    },
    async addXP(userId: bigint, guildId: bigint, xp: number) {
      const user = await levels.findOne({ userID: userId, guildID: guildId });

      if (!user) {
        new levels({
          userID: userId,
          guildID: guildId,
          xp,
          level: Math.floor(0.1 * Math.sqrt(xp)),
        }).save();

        return Math.floor(0.1 * Math.sqrt(xp)) > 0;
      }

      user.xp += xp;
      user.level = Math.floor(0.1 * Math.sqrt(user.xp));
      user.lastUpdated = new Date();

      await user.save();

      return Math.floor(0.1 * Math.sqrt((user.xp -= xp))) < user.level;
    },

    async addLevel(userId: bigint, guildId: bigint, level: string) {
      const user = await levels.findOne({ userID: userId, guildID: guildId });
      if (!user) return false;

      user.level += parseInt(level, 10);
      user.xp = user.level * user.level * 100;
      user.lastUpdated = new Date();

      user.save();

      return user;
    },

    async fetchLevels(userId: bigint, guildId: bigint, fetchPosition = true) {
      const user = await levels.findOne({
        userID: userId,
        guildID: guildId,
      });

      if (!user) return false;
      const userReturn = {
        // @ts-ignore
        ...user!._doc,
        position: 0,
        cleanXp: 0,
        cleanNextLevelXp: 0,
      };
      if (fetchPosition === true) {
        const leaderboard = await levels
          .find({
            guildID: guildId,
          })
          .sort([['xp', -1]])
          .exec();

        userReturn.position = leaderboard.findIndex((i) => i.userID === `${userId}`) + 1;
      }

      userReturn.cleanXp = user.xp - client.extras.xpFor(user.level);
      userReturn.cleanNextLevelXp = client.extras.xpFor(user.level + 1) - client.extras.xpFor(user.level);
      return userReturn;
    },

    xpFor(targetLevel: number) {
      return targetLevel * targetLevel * 100;
    },
  };
}
