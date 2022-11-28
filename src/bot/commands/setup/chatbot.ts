import Chatbot from '../../database/models/chatbot-channel.js';

import { AmethystBot, Context } from '@thereallonewolf/amethystframework';
export default {
	name: 'chatbot',
	description: 'Setup the chatbot for your server.',
	commandType: ['application', 'message'],
	category: 'setup',
	args: [
		{
			name: 'channel',
			description: 'The channel to setup',
			required: true,
			type: 'Channel',
		},
	],
	userGuildPermissions: ['MANAGE_CHANNELS'],
	async execute(client: AmethystBot, ctx: Context) {
		if (!ctx.guild || !ctx.user || !ctx.channel) return console.log(ctx.guild + ' ' + ctx.channel + ' ' + ctx.user);
		const channel = await ctx.options.getChannel('channel', true);

		client.extras.createChannelSetup(Chatbot, channel, ctx);
	},
};