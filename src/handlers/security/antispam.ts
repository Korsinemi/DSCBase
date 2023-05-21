import { Message } from '@discordeno/bot';

import Schema from '../../database/models/guild.js';
import { AeonaBot } from '../../extras/index.js';

const usersMap = new Map();
const LIMIT = 5;
const TIME = 10000;
const DIFF = 3000;

export default async (client: AeonaBot) => {
  client.on('messageCreateNoBots', async (bot: AeonaBot, message: Message) => {
    if (!message.content || message.content.length < 1) return;
    Schema.findOne({ Guild: message.guildId }, async (err: any, data: { AntiSpam: boolean }) => {
      if (data) {
        if (data.AntiSpam == true) {
          if (usersMap.has(message.author.id)) {
            const userData = usersMap.get(message.author.id);
            const { lastMessage, timer } = userData;
            const difference = message.timestamp - lastMessage.timestamp;
            let { msgCount } = userData;

            if (difference > DIFF) {
              clearTimeout(timer);
              userData.msgCount = 1;
              userData.lastMessage = message;
              userData.timer = setTimeout(() => {
                usersMap.delete(message.author.id);
              }, TIME);
              usersMap.set(message.author.id, userData);
            } else {
              ++msgCount;
              if (parseInt(msgCount) === LIMIT) {
                client.helpers.deleteMessage(message.channelId, message.id);
                client.extras.sendEmbedMessage(
                  {
                    title: `${client.extras.emotes.normal.error} Moderator`,
                    desc: `It is not allowed to spam in this server!`,
                    color: client.extras.config.colors.error,
                    content: `<@${message.author.id}>`,
                  },
                  message,
                );
              } else {
                userData.msgCount = msgCount;
                usersMap.set(message.author.id, userData);
              }
            }
          } else {
            const fn = setTimeout(() => {
              usersMap.delete(message.author.id);
            }, TIME);
            usersMap.set(message.author.id, {
              msgCount: 1,
              lastMessage: message,
              timer: fn,
            });
          }
        }
      }
    });
  });
};
