import { encodeBase64 } from "jsr:@std/encoding/base64";

const endpoint = "https://api.challonge.com/v1";
const token = encodeBase64(`${Deno.env.get("CHALLONGE_USER")}:${Deno.env.get("CHALLONGE_TOKEN")}`);

async function challonge(method: string, url: string, body?: any) {
  console.log(method, url);
  if (body == undefined) body = {};

  const response = await fetch(`${endpoint}${url}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: method == "GET" ? undefined : JSON.stringify(body),
  });
  const data = await (await response.blob()).text();

  try {
    const json = JSON.parse(data);
    return json;
  } catch (error) {
    console.error(response.status, data);
    throw error;
  }
}

export interface Participant {
  name: string;
  misc?: string;
  seed?: number;
  invite_name_or_email?: string;
}

export class Tournament {
  tournamentId: string;
  constructor(tournamentId: string) {
    this.tournamentId = tournamentId;
  }

  async reset() {
    return await challonge("POST", `/tournaments/${this.tournamentId}/reset.json`);
  }

  async matches() {
    return await challonge("GET", `/tournaments/${this.tournamentId}/matches.json`);
  }

  async start() {
    return await challonge("POST", `/tournaments/${this.tournamentId}/start.json`);
  }

  async clearParticipants() {
    return await challonge("DELETE", `/tournaments/${this.tournamentId}/participants/clear.json`);
  }

  async addParticipants(participants: Participant[]) {
    return await challonge("POST", `/tournaments/${this.tournamentId}/participants/bulk_add.json`, {
      participants: participants,
    });
  }

  async randomizeParticipants() {
    return await challonge("POST", `/tournaments/${this.tournamentId}/participants/randomize.json`);
  }
}
