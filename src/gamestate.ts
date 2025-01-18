import { User } from "npm:discord.js";
import { ParticipantAdd, Tournament } from "./challonge.ts";

export class Soumission {
  message: string;
  delta: number;
  date: number;

  constructor(message: string, delta: number, date: number) {
    this.message = message;
    this.delta = delta;
    this.date = date;
  }

  toString() {
    return `${this.message} (${this.delta / 1000} seconds après le début du round)`;
  }
}

export default class GameState {
  players: ParticipantAdd[];
  themes: string[];
  submissions: Map<string, Soumission>;
  startTime: number;
  tournament?: Tournament;

  constructor() {
    this.players = [
      // { name: "Test1", misc: "239330945826684929" },
      // { name: "Test2", misc: "239330945826684929" },
      // { name: "Test3", misc: "239330945826684929" },
      // { name: "Test4", misc: "239330945826684929" },
      // { name: "Test5", misc: "239330945826684929" },
      // { name: "Test6", misc: "239330945826684929" },
      // { name: "Test7", misc: "239330945826684929" },
      // { name: "Test8", misc: "239330945826684929" },
      // { name: "Test9", misc: "239330945826684929" },
      // { name: "Test10", misc: "239330945826684929" },
    ];
    this.themes = [
      // "Theme 1",
      // "Theme 2",
      // "Theme 3",
      // "Theme 4",
      // "Theme 5",
      // "Theme 6",
      // "Theme 7",
      // "Theme 8",
      // "Theme 9",
      // "Theme 10",
    ];
    this.submissions = new Map<string, Soumission>(); // key: discord id
    this.startTime = Date.now();
  }

  submit(user: User, message: string) {
    const now = Date.now();
    this.submissions.set(user.id, new Soumission(message, now - this.startTime, now));
  }

  setTheme(themes: string[]) {
    console.log(themes);
    this.themes = [];
    for (let i = 0; i < themes.length; i++) {
      const theme = themes[i];
      if (theme.replace("s+", "").length <= 0) continue;
      this.themes.push(theme);
    }
  }

  addPlayer(user: User): boolean {
    const playersId = this.players.map((p) => p.misc);
    const id = `${user.id}`;
    if (playersId.includes(id)) {
      return false;
    }
    this.players.push({ name: user.globalName ?? "", misc: id });
    return true;
  }

  showThemes(author: User) {
    let output = "## Thèmes\n";
    const themes = this.themes;

    for (let i = 0; i < themes.length; i++) {
      output += `${i}. ${themes[i]}\n`;
    }

    author.send(output);
  }

  showPlayers(author: User) {
    let output = "## Inscriptions\n";
    const players = this.players;

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      output += `${i}. <@${player.misc}> (${player.name})\n`;
    }

    author.send(output);
  }

  getRandomTheme() {
    return this.themes[Math.floor(Math.random() * this.themes.length)];
  }
}
