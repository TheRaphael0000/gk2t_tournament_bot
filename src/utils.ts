import { User } from "discord.js";

export function sendHelp(author: User) {
  author.send(
    `## Commands
        - join: Rejoindre le tournoi GK2T
        - submit <lien>: Envoyer une musique
        - current: Affiche la dernière musique envoyé  
        `
  );
}
