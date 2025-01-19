import { Message } from "npm:discord.js";
import GameState from "./gamestate.ts";

export default class Player {
  state: GameState;
  constructor(state: GameState) {
    this.state = state;
  }

  onMessage(message: Message<boolean>) {
    const author = message.author;
    const content = message.content;

    if (content.startsWith("soumettre ")) {
      const data = message.content.replace(/^soumettre /g, "");
      this.state.submit(author, data);
      const soumissionStr = this.state.submissions.get(author.id)?.toString() ?? "PAS DE SOUMISSION!";
      author.send(`Soumissions enregistrée: ${soumissionStr}`);
      return;
    }

    if (content == "rejoindre") {
      if (!this.state.addPlayer(author)) {
        author.send("Tu as déjà rejoint!");
      } else {
        author.send(
          `Tu as rejoint le tournoi ${
            Deno.env.get("TOURNAMENT_NAME") ?? ""
          }! Tu vas bientôt reçevoir plus d'informations`,
        );
      }
    }

    if (content == "soumission") {
      const submission = this.state.submissions.get(author.id);
      author.send(`Ta dernière soumission est: ${submission?.toString() ?? "PAS DE SOUMISSION!"}`);
      return;
    }

    if (content == "inscriptions") {
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

    if (content == "aide") {
      author.send(
        `## Commandes (Joueur)
            - \`rejoindre\` Rejoindre le tournoi ${Deno.env.get("TOURNAMENT_NAME")}.
            - \`soumettre <lien>\`: Envoyer une musique.
            - \`soumission\`: Affiche la dernière musique envoyé (celle qui va être jugé).
            - \`inscriptions\`: Affiche les joueurs inscrit.
            - \`themes\`: Affiche la liste des thèmes possible actuel. Cette liste est mise à jour au fur et à mesure.
            - \`bracket\`: Retourne le lien du bracket.
            - \`aide\`: Affiche cette aide.
            > Sources: github.com/TheRaphael0000/gk2t_tournament_bot
            `,
      );
      return;
    }
  }
}
