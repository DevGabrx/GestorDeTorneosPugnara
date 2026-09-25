import { randomUUID } from 'node:crypto';
import { fetchPlayerSnapshot } from './brawlstars.service.js';

const tournaments = [];

export function listTournaments() {
  return [...tournaments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export async function createTournament({ name, maxTeams, captainTag }) {
  const trimmedName = String(name ?? '').trim();
  if (!trimmedName) {
    const err = new Error('El nombre del torneo es obligatorio');
    err.code = 'VALIDATION';
    throw err;
  }

  const teams = Number(maxTeams);
  const resolvedMaxTeams =
    Number.isFinite(teams) && teams > 0 ? Math.floor(teams) : 8;

  let captainSnapshot = null;
  let resolvedCaptainTag = null;

  const tagInput = String(captainTag ?? '').trim();
  if (tagInput) {
    resolvedCaptainTag = tagInput.startsWith('#')
      ? tagInput.toUpperCase()
      : `#${tagInput.toUpperCase()}`;
    captainSnapshot = await fetchPlayerSnapshot(resolvedCaptainTag);
    resolvedCaptainTag = captainSnapshot.tag ?? resolvedCaptainTag;
  }

  const tournament = {
    id: randomUUID(),
    name: trimmedName,
    game: 'Brawl Stars',
    maxTeams: resolvedMaxTeams,
    status: 'open',
    createdAt: new Date().toISOString(),
    captainTag: resolvedCaptainTag,
    captainSnapshot,
  };

  tournaments.push(tournament);
  return tournament;
}
