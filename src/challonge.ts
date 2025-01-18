import { encodeBase64 } from "jsr:@std/encoding/base64";

const endpoint = "https://api.challonge.com/v1";
const token = encodeBase64(
  `${Deno.env.get("CHALLONGE_USER")}:${Deno.env.get("CHALLONGE_TOKEN")}`,
);

type AnyType = unknown;

export interface ParticipantAdd {
  name: string;
  misc: string;
  seed?: number;
}

export interface Participant extends ParticipantAdd {
  id: number;
}

export interface Tournament {
  id: number;
  game_name: string;
  full_challonge_url: string;
  live_image_url: string;
}

export interface Match {
  id: number;
  player1_id: number;
  player2_id: number;
  identifier: string;
  state: string;
  round: number;
  underway_at: string;
}

export class Challonge {
  tournamentId: string;
  constructor(tournamentId: string) {
    this.tournamentId = tournamentId;
  }

  async query(method: string, url: string, body?: AnyType) {
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

  async tournament() {
    return (
      await this.query("GET", `/tournaments/${this.tournamentId}.json`)
    ).tournament as Tournament;
  }

  async reset() {
    return await this.query("POST", `/tournaments/${this.tournamentId}/reset.json`);
  }

  async matches() {
    const output = await this.query("GET", `/tournaments/${this.tournamentId}/matches.json`);
    return output.map((p: { match: Match }) => p?.match) as Match[];
  }

  async start() {
    return await this.query("POST", `/tournaments/${this.tournamentId}/start.json`);
  }

  async clearParticipants() {
    return await this.query("DELETE", `/tournaments/${this.tournamentId}/participants/clear.json`);
  }

  async addParticipants(participants: ParticipantAdd[]) {
    return await this.query("POST", `/tournaments/${this.tournamentId}/participants/bulk_add.json`, {
      participants: participants,
    });
  }

  async randomizeParticipants() {
    return await this.query("POST", `/tournaments/${this.tournamentId}/participants/randomize.json`);
  }

  async participants() {
    const output = await this.query("GET", `/tournaments/${this.tournamentId}/participants.json`);
    return output.map(
      (p: { participant: Participant }) => p.participant as Participant,
    ) as Participant[];
  }

  async mark_as_underway(match_id: number) {
    return await this.query("POST", `/tournaments/${this.tournamentId}/matches/${match_id}/mark_as_underway.json`);
  }

  async matchAttachments(match_id: number, description: string) {
    return await this.query("POST", `/tournaments/${this.tournamentId}/matches/${match_id}/attachments.json`, {
      match_attachment: {
        description: description,
      },
    });
  }
}

export default new Challonge(Deno.env.get("CHALLONGE_TOURNAMENT") ?? "");
