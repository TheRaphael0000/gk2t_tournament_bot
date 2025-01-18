import { Message } from "discord.js";
import GameState from "./gamestate.js";

export default class Player {
  state: GameState;
  constructor(state: GameState) {
    this.state = state;
  }

  onMessage(message: Message<boolean>) {
    const user = message.author;

    if (message.content.startsWith("!join")) {
      this.state.players.push(user);
    }

    if (message.content.startsWith("!players")) {
      const players = this.state.players.map((p) => p.globalName).join("\n");
      user.send(players);
    }
  }
}
