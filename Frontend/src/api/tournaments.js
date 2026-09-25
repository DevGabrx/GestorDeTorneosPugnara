export async function fetchTournaments() {
  const res = await fetch('/api/tournaments');
  if (!res.ok) {
    throw new Error('No se pudo cargar la lista de torneos');
  }
  return res.json();
}

export async function createTournament(payload) {
  const res = await fetch('/api/tournaments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? 'Error al crear el torneo');
  }
  return data;
}

export async function addPlayerToTournament(tournamentId, tag) {
  const res = await fetch(`/api/tournaments/${tournamentId}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? 'Error al agregar el jugador');
  }
  return data;
}
