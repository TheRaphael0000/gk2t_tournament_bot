import { Message, User } from "npm:discord.js";
import GameState from "./gamestate.ts";
import challonge from "./challonge.ts";
import { messageBuilder } from "./utils.ts";

export default class Admin {
  state: GameState;
  constructor(state: GameState) {
    this.state = state;
  }

  async onMessage(message: Message<boolean>) {
    const author = message.author;
    const content = message.content;

    if (content == "reset") {
      await challonge.reset();
      await challonge.clearParticipants();
      author.send(`## Reset\nTournament reset!`);
      return;
    }

    if (content == "start") {
      const players = this.state.players;
      await challonge.addParticipants(players);
      await challonge.randomizeParticipants();
      await challonge.start();
      const participants = await challonge.participants();
      let output = `## Start\n`;
      output += `Tournament started with ${participants.length} players\n`;
      for (const participant of participants) {
        output += `1. <@${participant.misc}>\n`;
      }
      output += `Bracket link: <${this.state.tournament?.full_challonge_url ?? ""}>`;
      author.send(output);
      return;
    }

    if (content == "launch") {
      await this.launch(author, true);
      return;
    }

    if (content == "relaunch") {
      await this.launch(author, false);
      return;
    }

    if (content == "submissions") {
      const matches = await this.openMatches(false);
      const participants = await challonge.participants();

      const blocks = [];
      for (const match of matches) {
        const attachements = await challonge.getMatchAttachments(match.id);
        const theme = attachements.at(attachements.length - 1)?.description ?? "NO THEME";
        const participant1 = participants.filter((p) => p.id == match.player1_id)[0];
        const participant2 = participants.filter((p) => p.id == match.player2_id)[0];
        const submission1 = this.state.submissions.get(participant1.misc);
        const submission2 = this.state.submissions.get(participant2.misc);

        let block = "";
        block += `- ${match.identifier}: **${theme}**\n`;
        block += `  - <@${participant1.misc}>: ${submission1?.toString() ?? "NO SUBMISSION!"}\n`;
        block += `  - <@${participant2.misc}>: ${submission2?.toString() ?? "NO SUBMISSION!"}\n`;
        blocks.push(block);
      }

      const messages = messageBuilder(blocks, "## Submissions\n", "", 1500);
      for (const message of messages) {
        author.send(message);
      }
      return;
    }

    if (content.startsWith("set themes")) {
      this.state.setTheme(
        content
          .replace("set themes", "")
          .split("\n")
          .map((r) => r.trim()),
      );
      this.state.showThemes(author);
      return;
    }

    if (content == "help") {
      author.send(`## Commands (Administrators)
        - \`set themes <lines>\`: Pour chaque lines après cette commande (même message), ajoute un thème possible.
        - \`themes\`: Affiche la liste des thèmes possible actuel. Cette liste est mise à jour au fur et à mesure.
        - \`registrations\`: Affiche les joueurs inscrit.
        - \`start\`: Utilise la liste des \`inscriptions\` pour créer le tournoi.
        - \`launch\`: Démarre tous les matches avec 2 joueurs, sans score et non démarré. Envoye un thème aléatoire à chaque joueurs.
        - \`submissions\`: Affiche les soumissions des joueurs. Cette liste est effacé à chaque launch / relaunch
        - \`relaunch\`: Redémarre la manche, tous les matches avec 2 joueurs, sans score (uniquement en cas de problème).
        - \`bracket\`: Retourne le lien du bracket.
        - \`reset\`: Efface tous les résultats du tournoi.`);
      return;
    }

    if (content == "registrations") {
      this.state.showPlayers(author);
      return;
    }

    if (content == "themes") {
      this.state.showThemes(author);
      return;
    }

    if (content == "bracket") {
      const url = `${this.state.tournament?.full_challonge_url ?? ""}/module`;
      author.send(url);
      return;
    }

    /// debug commands
    if (content == "participants") {
      const participants = await challonge.participants();
      console.debug(participants);
      return;
    }

    if (content == "matches") {
      const matches = await challonge.matches();
      console.debug(matches);
      return;
    }
  }

  async openMatches(ignoreStarted: boolean) {
    let matches = await challonge.matches();
    matches = matches.filter((m) => m.state == "open");
    // const minRound = Math.min(...matches.map((m) => m.round));
    // matches = matches.filter((m) => m.round == minRound);
    if (ignoreStarted) matches = matches.filter((m) => m.underway_at == null);
    return matches;
  }

  async launch(author: User, ignoreStarted: boolean) {
    const client = author.client;

    const matches = await this.openMatches(ignoreStarted);

    let output = `## Matches started (${matches.length})\n`;

    if (matches.length > 0) {
      const participants = await challonge.participants();
      this.state.submissions.clear();

      for (const match of matches) {
        const theme = this.state.getRandomTheme();

        challonge.mark_as_underway(match.id);

        if (theme == undefined) {
          author.send("No themes found!");
          return;
        }

        await challonge.setMatchAttachments(match.id, theme);

        const participant1 = participants.filter((p) => p.id == match.player1_id)[0];
        const participant2 = participants.filter((p) => p.id == match.player2_id)[0];

        const discord1 = client.users.cache.get(participant1.misc);
        const discord2 = client.users.cache.get(participant2.misc);
        const VS_text = `<@${discord1?.id}> VS <@${discord2?.id}>`;

        let message = `## Match\n`;
        message += `\n`;
        message += `${VS_text}\n`;
        message += `Thème: **${theme}**\n`;
        message += `\n`;
        message += `> Pour soumettre une musique utilise la commande \`submit <lien>\`\n`;
        message += `> Example: \`submit https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8\``;

        discord1?.send(message);
        discord2?.send(message);

        output += `- **${theme}** : ${VS_text}\n`;
      }
    }

    this.state.startTime = Date.now();
    author.send(output);
  }
}
