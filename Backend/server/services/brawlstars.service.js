import dotenv from 'dotenv'


dotenv.config()


const API_BASE = 'https://api.brawlstars.com/v1';



function getToken() {
  const token = process.env.BRAWL_STARS_TOKEN?.trim();
  if (!token) {
    const err = new Error(
      'BRAWL_STARS_TOKEN no está configurado en Backend/.env',
    );
    err.code = 'MISSING_TOKEN';
    throw err;
  }
  return token;
}

export function normalizePlayerTag(raw) {
  const trimmed = String(raw ?? '').trim().replace(/\s/g, '');
  if (!trimmed) return '';
  return trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`;
}

export function tagForApiPath(tag) {
  return encodeURIComponent(normalizePlayerTag(tag));
}

export function mapPlayerSnapshot(data) {
  const favorite = data?.brawlers?.find(
    (b) => b.id === data.favoriteBrawler?.id,
  );
  return {
    tag: data.tag,
    name: data.name,
    trophies: data.trophies,
    highestTrophies: data.highestTrophies,
    favoriteBrawler: favorite
      ? { name: favorite.name, trophies: favorite.trophies }
      : data.favoriteBrawler
        ? { name: data.favoriteBrawler.name, id: data.favoriteBrawler.id }
        : null,
  };
}

export async function fetchPlayerSnapshot(tag) {
  const normalized = normalizePlayerTag(tag);
  if (!normalized || normalized === '#') {
    const err = new Error('Tag de jugador inválido');
    err.code = 'INVALID_TAG';
    throw err;
  }

  const token = getToken();
  const url = `${API_BASE}/players/${tagForApiPath(normalized)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) {
    const err = new Error(`No se encontró un jugador con el tag ${normalized}`);
    err.code = 'PLAYER_NOT_FOUND';
    throw err;
  }

  if (response.status === 403) {
    const err = new Error(
      'Acceso denegado a la API de Brawl Stars (revisa token o IP allowlist)',
    );
    err.code = 'FORBIDDEN';
    throw err;
  }

  if (!response.ok) {
    const err = new Error(
      `Error de Brawl Stars API (${response.status})`,
    );
    err.code = 'API_ERROR';
    throw err;
  }

  const data = await response.json();
  return mapPlayerSnapshot(data);
}
