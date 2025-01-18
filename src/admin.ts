import { Message, User } from "npm:discord.js";
import GameState from "./gamestate.ts";
import { Tournament, Participant } from "./challonge.ts";

const tournamentId = Deno.env.get("CHALLONGE_TOURNAMENT") ?? "";
const tournament = new Tournament(tournamentId);

export default class Admin {
  state: GameState;
  constructor(state: GameState) {
    this.state = state;
  }

  async onMessage(message: Message<boolean>) {
    const author = message.author;
    const content = message.content;

    if (content.startsWith("reset")) {
      await tournament.reset();
      await tournament.clearParticipants();
    }

    if (content.startsWith("start")) {
      let players = this.state.players.map((p) => ({ name: p.globalName ?? "", misc: p.username } as Participant));
      players.push({ name: "Test1", misc: "A" });
      players.push({ name: "Test2", misc: "B" });
      players.push({ name: "Test3", misc: "C" });
      players.push({ name: "Test4", misc: "D" });
      console.log(players);
      await tournament.addParticipants(players);
      await tournament.randomizeParticipants();
      await tournament.start();
    }

    if (content.startsWith("matches")) {
      const output = await tournament.matches();
      console.log(output);
      author.send("Matches");
    }

    if (content.startsWith("themes clear")) {
      this.state.themes = [];
      return;
    }

    if (content.startsWith("+themes")) {
      this.state.addTheme(
        content
          .replace("+themes", "")
          .split("\n")
          .map((r) => r.trim())
      );
      this.state.showThemes(author);
      return;
    }

    if (content.startsWith("-themes")) {
      this.state.removeTheme(
        content
          .replace("-themes", "")
          .split(/[\s\\n]/g)
          .map((r) => r.trim())
          .map((r) => parseInt(r))
      );
      this.state.showThemes(author);
      return;
    }

    if (content.startsWith("themes")) {
      this.state.showThemes(author);
      return;
    }

    if (content.startsWith("joueurs")) {
      this.state.showPlayers(author);
      return;
    }
  }
}
