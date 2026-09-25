export const TOURNAMENT_MODES = [
  {
    id: 'balon_brawl',
    label: 'Balón Brawl',
    defaultMatchCapacity: 6,
    minMatchCapacity: 2,
    maxMatchCapacity: 64,
    typicalMatchSize: 6,
    description: 'Partida típica 3v3 (6 jugadores). Tú defines el cupo.',
  },
  {
    id: 'atrapa_gemas',
    label: 'Atrapa Gemas',
    defaultMatchCapacity: 6,
    minMatchCapacity: 2,
    maxMatchCapacity: 64,
    typicalMatchSize: 6,
    description: 'Partida típica 3v3 (6 jugadores). Tú defines el cupo.',
  },
  {
    id: 'supervivencia',
    label: 'Supervivencia',
    defaultMatchCapacity: 10,
    minMatchCapacity: 2,
    maxMatchCapacity: 10,
    typicalMatchSize: 10,
    description: 'Showdown: hasta 10 jugadores por partida.',
  },
];

export function modeById(id) {
  return TOURNAMENT_MODES.find((mode) => mode.id === id) ?? TOURNAMENT_MODES[0];
}
