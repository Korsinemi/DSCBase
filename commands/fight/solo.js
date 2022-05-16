const Discord = require("discord.js");
const Command = require("../../structures/Command");
const game = require("discord-fight-game");
let fight;

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "solo",
      aliases: [],
      usage: "",
      description: "Fight against Aeona!",
      category: "fight",
      cooldown: 3,
    });
  }

    async run(message, args) {

        let client = message.client;

        if(!fight)  fight = new game(client);
        fight.solo(message);
    }
};
