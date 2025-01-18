import { User } from "npm:discord.js";

export default class GameState {
  players: User[];
  themes: string[];

  constructor() {
    this.players = [];
    this.themes = [];
  }

  addTheme(themes: string[]) {
    console.log(themes);
    for (let i = 0; i < themes.length; i++) {
      const theme = themes[i];
      if (theme.replace("s+", "").length <= 0) continue;
      this.themes.push(theme);
    }
  }

  removeTheme(themesId: number[]) {
    const ids = themesId.sort().reverse();
    console.log(ids);
    for (const id of ids) {
      this.themes.splice(id, 1);
    }
  }

  addPlayer(player: User): boolean {
    const playersId = this.players.map((p) => p.id);
    if (playersId.includes(player.id)) {
      return false;
    }
    this.players.push(player);
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
    let output = "## Joueurs\n";
    const players = this.players;

    for (let i = 0; i < players.length; i++) {
      output += `${i}. ${players[i].globalName}\n`;
    }

    author.send(output);
  }
}
