import { Client, GatewayIntentBits, Message, Partials } from "npm:discord.js";
import GameState from "./gamestate.ts";
import Admin from "./admin.ts";
import Player from "./player.ts";
import challonge from "./challonge.ts";
import { logger } from "./utils.ts";

const admins = (Deno.env.get("ADMINS") ?? "").split(",");

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
  logger(`Logged in as ${client.user?.tag}`);
}

async function messageCreate(message: Message) {
  try {
    if (message.author.bot) return; // no bot to bot
    if (message.guildId != null) return; //dms onlyF

    logger(`${message.author.globalName}: ${message.content}`);
    if (admins.includes(message.author.id)) {
      await adminHandler.onMessage(message);
    }
    playerHandler.onMessage(message);
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  await client.login();
  state.tournament = await challonge.tournament();
}

Deno.addSignalListener("SIGINT", async () => {
  await client.destroy();
  Deno.exit();
});

main();
