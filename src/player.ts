import { Message } from "npm:discord.js";
import GameState from "./gamestate.ts";
import { sendHelp } from "./utils.ts";

export default class Player {
  state: GameState;
  constructor(state: GameState) {
    this.state = state;
  }

  async onMessage(message: Message<boolean>) {
    const author = message.author;
    const content = message.content;

    console.log(author.globalName, content);

    if (content.startsWith("rejoindre")) {
      if (!this.state.addPlayer(author)) author.send("Tu as déjà rejoint!");
      else author.send(`Tu as rejoint le tournoi GK2T! Tu vas bientôt reçevoir plus d'informations`);
    }

    if (content.startsWith("aide")) {
      sendHelp(author);
    }
  }
}
