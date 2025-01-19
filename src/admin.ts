import { Message, User } from "npm:discord.js";
import GameState from "./gamestate.ts";
import challonge from "./challonge.ts";

export default class Admin {
  state: GameState;
  constructor(state: GameState) {
    this.state = state;
  }

  async onMessage(message: Message<boolean>) {
    const author = message.author;
    const content = message.content;

    if (content.startsWith("reset")) {
      await challonge.reset();
      await challonge.clearParticipants();
      author.send(`Tournoi reseté!`);
      return;
    }

    if (content.startsWith("start")) {
      const players = this.state.players;
      await challonge.addParticipants(players);
      await challonge.randomizeParticipants();
      await challonge.start();
      const participants = await challonge.participants();
      author.send(`Tournoi démarré avec ${participants.length} joueurs`);
      return;
    }

    if (content.startsWith("launch")) {
      await this.launch(author, false);
      return;
    }

    if (content.startsWith("relaunch")) {
      await this.launch(author, true);
      return;
    }

    if (content.startsWith("soumissions")) {
      const matches = await this.openMatches(true);
      const participants = await challonge.participants();

      let output = "## Soumissions\n";
      for (const match of matches) {
        const attachements = await challonge.getMatchAttachments(match.id);
        const theme = attachements.at(attachements.length - 1)?.description ?? "NO THEME";
        const participant1 = participants.filter((p) => p.id == match.player1_id)[0];
        const participant2 = participants.filter((p) => p.id == match.player2_id)[0];
        const submission1 = this.state.submissions.get(participant1.misc);
        const submission2 = this.state.submissions.get(participant2.misc);

        output += `- Match: ${match.identifier}: **${theme}**\n`;
        output += `  - <@${participant1.misc}>: ${submission1?.toString() ?? "PAS DE SOUMISSION!"}\n`;
        output += `  - <@${participant2.misc}>: ${submission2?.toString() ?? "PAS DE SOUMISSION!"}\n`;
      }
      author.send(output);
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

    if (content == "aide") {
      author.send(`## Commandes (Administrateur)
        - \`set themes <lines>\`: Pour chaque lines après cette commande (même message), ajoute un thème possible.
        - \`start\`: Utilise la liste des \`inscriptions\` pour créer le tournoi.
        - \`launch\`: Démarre tous les matches avec 2 joueurs, sans score et non démarré. Envoye un thème aléatoire à chaque joueurs.
        - \`soumissions\`: Affiche les soumissions des joueurs. Cette liste est effacé à chaque launch / relaunch
        - \`relaunch\`: Redémarre la manche, tous les matches avec 2 joueurs, sans score (uniquement en cas de problème).
        - \`reset\`: Efface tous les résultats du tournoi.`);
      return;
    }
  }

  async openMatches(includeStarted: boolean) {
    let matches = await challonge.matches();
    matches = matches.filter((m) => m.state == "open");
    // const minRound = Math.min(...matches.map((m) => m.round));
    // matches = matches.filter((m) => m.round == minRound);
    if (!includeStarted) matches = matches.filter((m) => m.underway_at == null);
    return matches;
  }

  async launch(author: User, includeStarted: boolean) {
    const client = author.client;

    const matches = await this.openMatches(includeStarted);

    let output = `## Matches démarrés (${matches.length})\n`;

    if (matches.length > 0) {
      const participants = await challonge.participants();

      for (const match of matches) {
        const theme = this.state.getRandomTheme();

        challonge.mark_as_underway(match.id);

        if (theme == undefined) {
          author.send("Not themes found!");
          return;
        }

        await challonge.setMatchAttachments(match.id, theme);

        const participant1 = participants.filter((p) => p.id == match.player1_id)[0];
        const participant2 = participants.filter((p) => p.id == match.player2_id)[0];

        const discord1 = client.users.cache.get(participant1.misc);
        const discord2 = client.users.cache.get(participant2.misc);
        const VS_text = `<@${discord1?.id}> VS <@${discord2?.id}>`;

        const message = `## Match
          ${VS_text}
          Thème: **${theme}**.
          Bonne chance!`;

        discord1?.send(message);
        discord2?.send(message);

        output += `- **${theme}** : ${VS_text}\n`;
      }
    }

    this.state.startTime = Date.now();
    author.send(output);
  }
}
