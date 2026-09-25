import { randomUUID } from 'node:crypto';
import { fetchPlayerSnapshot, normalizePlayerTag } from './brawlstars.service.js';
import {
  getTournamentMode,
  listTournamentModes,
  resolveMatchCapacity,
} from '../lib/tournament-modes.js';

const tournaments = [];

export function listModes() {
  return listTournamentModes();
}

export function listTournaments() {
  return [...tournaments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

function getTournamentOrThrow(id) {
  const tournament = tournaments.find((item) => item.id === id);
  if (!tournament) {
    const err = new Error('Torneo no encontrado');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return tournament;
}

async function snapshotFromTag(rawTag) {
  const normalized = normalizePlayerTag(rawTag);
  if (!normalized || normalized === '#') {
    const err = new Error('Tag de jugador inválido');
    err.code = 'INVALID_TAG';
    throw err;
  }
  return fetchPlayerSnapshot(normalized);
}

function assertUniquePlayer(tournament, tag) {
  const exists = tournament.players.some(
    (player) => player.tag.toUpperCase() === tag.toUpperCase(),
  );
  if (exists) {
    const err = new Error(`El jugador ${tag} ya está en este torneo`);
    err.code = 'VALIDATION';
    throw err;
  }
}

function assertCapacity(tournament, extra = 1) {
  if (tournament.players.length + extra > tournament.matchCapacity) {
    const err = new Error(
      `El torneo ya alcanzó el cupo de ${tournament.matchCapacity} jugadores`,
    );
    err.code = 'VALIDATION';
    throw err;
  }
}

export async function createTournament({
  name,
  mode,
  matchCapacity,
  playerTags,
}) {
  const trimmedName = String(name ?? '').trim();
  if (!trimmedName) {
    const err = new Error('El nombre del torneo es obligatorio');
    err.code = 'VALIDATION';
    throw err;
  }

  const modeConfig = getTournamentMode(mode);
  if (!modeConfig) {
    const err = new Error(
      'La modalidad debe ser Balón Brawl, Atrapa Gemas o Supervivencia',
    );
    err.code = 'VALIDATION';
    throw err;
  }

  const resolvedCapacity = resolveMatchCapacity(modeConfig, matchCapacity);
  const tags = Array.isArray(playerTags)
    ? playerTags
    : playerTags
      ? [playerTags]
      : [];

  if (tags.length > resolvedCapacity) {
    const err = new Error(
      `No puedes agregar más de ${resolvedCapacity} jugadores (cupo de la partida)`,
    );
    err.code = 'VALIDATION';
    throw err;
  }

  const players = [];
  const seen = new Set();
  for (const rawTag of tags) {
    const snapshot = await snapshotFromTag(rawTag);
    const key = snapshot.tag.toUpperCase();
    if (seen.has(key)) {
      const err = new Error(`El tag ${snapshot.tag} está duplicado`);
      err.code = 'VALIDATION';
      throw err;
    }
    seen.add(key);
    players.push(snapshot);
  }

  const tournament = {
    id: randomUUID(),
    name: trimmedName,
    game: 'Brawl Stars',
    mode: modeConfig.id,
    modeLabel: modeConfig.label,
    matchCapacity: resolvedCapacity,
    status: 'open',
    createdAt: new Date().toISOString(),
    players,
  };

  tournaments.push(tournament);
  return tournament;
}

export async function addPlayerToTournament(tournamentId, tag) {
  const tournament = getTournamentOrThrow(tournamentId);
  if (tournament.status !== 'open') {
    const err = new Error('Este torneo ya no admite jugadores');
    err.code = 'VALIDATION';
    throw err;
  }
  assertCapacity(tournament, 1);
  const snapshot = await snapshotFromTag(tag);
  assertUniquePlayer(tournament, snapshot.tag);
  tournament.players.push(snapshot);
  return tournament;
}
