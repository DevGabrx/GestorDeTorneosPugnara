import { randomUUID } from 'node:crypto';
import { fetchPlayerSnapshot, normalizePlayerTag } from './brawlstars.service.js';

const tournaments = [];

export function listTournaments() {
  return [...tournaments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export async function createTournament({ name, mode, matchCapacity, playerTags = [] }) {
  const trimmedName = String(name ?? '').trim();
  if (!trimmedName) {
    const err = new Error('El nombre del torneo es obligatorio');
    err.code = 'VALIDATION';
    throw err;
  }

  const capacity = Number(matchCapacity);
  const resolvedCapacity = Number.isFinite(capacity) && capacity > 0 ? capacity : 10;

  // Consultar información real de Brawl Stars para cada playerTag enviado
  const players = [];
  for (const rawTag of playerTags) {
    const normalized = normalizePlayerTag(rawTag);
    if (normalized) {
      try {
        const snapshot = await fetchPlayerSnapshot(normalized);
        players.push(snapshot);
      } catch (err) {
        console.error(`Error obteniendo tag ${normalized}:`, err.message);
      }
    }
  }

  const tournament = {
    id: randomUUID(),
    name: trimmedName,
    game: 'Brawl Stars',
    mode: mode || 'soloShowdown',
    matchCapacity: resolvedCapacity,
    players: players, // Lista de objetos { tag, name, trophies, ... }
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  tournaments.push(tournament);
  return tournament;
}

export async function addPlayerToTournament(tournamentId, rawTag) {
  const tournament = tournaments.find((t) => t.id === tournamentId);
  if (!tournament) {
    const err = new Error('Torneo no encontrado');
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (tournament.players.length >= tournament.matchCapacity) {
    const err = new Error('El torneo ya alcanzó su cupo máximo');
    err.code = 'FULL_CAPACITY';
    throw err;
  }

  const normalized = normalizePlayerTag(rawTag);
  const alreadyIn = tournament.players.some((p) => p.tag === normalized);
  if (alreadyIn) {
    const err = new Error(`El jugador con tag ${normalized} ya está en este torneo`);
    err.code = 'DUPLICATE_PLAYER';
    throw err;
  }

  // Se obtiene el snapshot actualizado desde Brawl Stars
  const snapshot = await fetchPlayerSnapshot(normalized);
  tournament.players.push(snapshot);

  return tournament;
}