import { Message } from "discord.js";
import GameState from "./gamestate.js";

export default class Admin {
  state: GameState;
  constructor(state: GameState) {
    this.state = state;
  }

  onMessage(message: Message<boolean>) {
    if (message.content.startsWith("!add")) {
      this.state.themes.push(message.content.replace("!add", ""));
    }
  }
}
