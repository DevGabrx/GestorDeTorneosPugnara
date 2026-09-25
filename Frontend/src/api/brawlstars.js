export async function fetchPlayer(tag) {
  const encoded = encodeURIComponent(tag);
  const res = await fetch(`/api/brawlstars/players/${encoded}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? 'No se pudo consultar el jugador');
  }
  return data;
}
