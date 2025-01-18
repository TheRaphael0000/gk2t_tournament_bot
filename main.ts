import { Client, GatewayIntentBits, Message, Partials } from "npm:discord.js";
import GameState from "./src/gamestate.ts";
import Admin from "./src/admin.ts";
import Player from "./src/player.ts";

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
  console.log(`Logged in as ${client.user?.tag}`);
}

async function messageCreate(message: Message) {
  try {
    if (message.author.bot) return; // no bot to bot
    if (message.guildId != null) return; //dms onlyF

    if (admins.includes(message.author.username)) await adminHandler.onMessage(message);

    await playerHandler.onMessage(message);
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  await client.login();
}

Deno.addSignalListener("SIGINT", async () => {
  await client.destroy();
  Deno.exit();
});

main();
