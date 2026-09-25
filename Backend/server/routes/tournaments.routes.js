import { Router } from 'express';
import {
  addPlayerToTournament,
  createTournament,
  listModes,
  listTournaments,
} from '../services/tournaments.service.js';

const router = Router();

const CLIENT_ERROR_CODES = new Set([
  'VALIDATION',
  'INVALID_TAG',
  'PLAYER_NOT_FOUND',
  'FORBIDDEN',
  'MISSING_TOKEN',
  'API_ERROR',
]);

function sendServiceError(res, error, fallbackMessage) {
  if (error.code === 'NOT_FOUND') {
    return res.status(404).json({ error: error.message });
  }
  if (CLIENT_ERROR_CODES.has(error.code)) {
    return res.status(400).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: fallbackMessage });
}

router.get('/modes', (_req, res) => {
  res.json(listModes());
});

router.get('/', (_req, res) => {
  res.json(listTournaments());
});

router.post('/', async (req, res) => {
  try {
    const tournament = await createTournament(req.body ?? {});
    res.status(201).json(tournament);
  } catch (error) {
    sendServiceError(res, error, 'Error interno al crear el torneo');
  }
});

router.post('/:id/players', async (req, res) => {
  try {
    const tournament = await addPlayerToTournament(
      req.params.id,
      req.body?.tag ?? req.body?.playerTag,
    );
    res.json(tournament);
  } catch (error) {
    sendServiceError(res, error, 'Error interno al agregar el jugador');
  }
});

export default router;
