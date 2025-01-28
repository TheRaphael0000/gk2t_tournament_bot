import { Message } from "npm:discord.js";
import GameState from "./gamestate.ts";
import { commandParser } from "./utils.ts";

export default class Player {
  state: GameState;
  constructor(state: GameState) {
    this.state = state;
  }

  onMessage(message: Message<boolean>) {
    const author = message.author;
    const content = message.content;

    if (commandParser(content, "join")) {
      if (!this.state.addPlayer(author)) {
        author.send("Tu as déjà rejoint le tournoi!");
      } else {
        author.send(
          `Tu as rejoint le tournoi ${
            Deno.env.get("TOURNAMENT_NAME") ?? ""
          }! Tu vas bientôt reçevoir plus d'informations`,
        );
      }
    }

    if (commandParser(content, "submit")) {
      const data = message.content.replace(/^submit /g, "");
      if (data.length > 100) {
        author.send("Trop long!");
        return;
      }
      this.state.submit(author, data);
      const submissionStr = this.state.submissions.get(author.id)?.toString() ?? "PAS DE SOUMISSION!";
      author.send(`Soumission enregistrée: ${submissionStr}`);
      return;
    }

    if (commandParser(content, "help")) {
      author.send(
        `## Commandes (Joueur)
            - \`join\` Rejoindre le tournoi ${Deno.env.get("TOURNAMENT_NAME")}.
            - \`submit <lien>\`: Envoyer une musique.
            - \`submit\`: Affiche la dernière musique envoyé (celle qui va être jugé).
            - \`help\`: Affiche cette aide.
            > Code source: github.com/TheRaphael0000/gk2t_tournament_bot
            `,
      );
      return;
    }
  }
}
