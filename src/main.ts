import { Client, GatewayIntentBits, Message, Partials } from "discord.js";
import dotenv from "dotenv";
import GameState from "./gamestate.js";
import Admin from "./admin.js";
import Player from "./player.js";

dotenv.config();

const admins = (process?.env?.ADMINS ?? "").split(",");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const state = new GameState();
const adminHandler = new Admin(state);
const playerHandler = new Player(state);

client.on("messageCreate", messageCreate);
client.once("ready", ready);

function ready(client: Client<true>): void {
  console.log(`Logged in as ${client.user?.tag}`);
}

async function messageCreate(message: Message) {
  if (message.author.bot) return; // no bot to bot
  if (message.guildId != null) return; //dms onlyF

  if (admins.includes(message.author.username)) adminHandler.onMessage(message);

  playerHandler.onMessage(message);
}

async function main() {
  await client.login(process.env.KEY);
}

process.on("SIGINT", async () => {
  await client.destroy();
  process.exit();
});
main();
