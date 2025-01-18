import { User } from "discord.js";

export default class GameState {
  players: User[];
  themes: string[];

  constructor() {
    this.players = [];
    this.themes = [];
  }
}
