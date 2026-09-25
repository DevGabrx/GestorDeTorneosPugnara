export const TOURNAMENT_MODES = {
  balon_brawl: {
    id: 'balon_brawl',
    label: 'Balón Brawl',
    defaultMatchCapacity: 6,
    minMatchCapacity: 2,
    maxMatchCapacity: 64,
    typicalMatchSize: 6,
    description: 'Partida típica 3v3 (6 jugadores). El administrador define el cupo.',
  },
  atrapa_gemas: {
    id: 'atrapa_gemas',
    label: 'Atrapa Gemas',
    defaultMatchCapacity: 6,
    minMatchCapacity: 2,
    maxMatchCapacity: 64,
    typicalMatchSize: 6,
    description: 'Partida típica 3v3 (6 jugadores). El administrador define el cupo.',
  },
  supervivencia: {
    id: 'supervivencia',
    label: 'Supervivencia',
    defaultMatchCapacity: 10,
    minMatchCapacity: 2,
    maxMatchCapacity: 10,
    typicalMatchSize: 10,
    description: 'Showdown: hasta 10 jugadores por partida.',
  },
};

export function listTournamentModes() {
  return Object.values(TOURNAMENT_MODES);
}

export function getTournamentMode(modeId) {
  return TOURNAMENT_MODES[modeId] ?? null;
}

export function resolveMatchCapacity(mode, rawCapacity) {
  const parsed = Number(rawCapacity);
  if (rawCapacity === undefined || rawCapacity === null || rawCapacity === '') {
    return mode.defaultMatchCapacity;
  }
  if (!Number.isFinite(parsed) || parsed < mode.minMatchCapacity) {
    const err = new Error(
      `El cupo debe ser un número entre ${mode.minMatchCapacity} y ${mode.maxMatchCapacity} para ${mode.label}`,
    );
    err.code = 'VALIDATION';
    throw err;
  }
  const capacity = Math.floor(parsed);
  if (capacity > mode.maxMatchCapacity) {
    const err = new Error(
      `El cupo máximo para ${mode.label} es ${mode.maxMatchCapacity}`,
    );
    err.code = 'VALIDATION';
    throw err;
  }
  return capacity;
}
