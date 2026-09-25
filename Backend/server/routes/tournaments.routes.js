import { Router } from 'express';
import {
  createTournament,
  listTournaments,
} from '../services/tournaments.service.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(listTournaments());
});

router.post('/', async (req, res) => {
  try {
    const tournament = await createTournament(req.body ?? {});
    res.status(201).json(tournament);
  } catch (error) {
    const code = error.code;
    if (
      code === 'VALIDATION' ||
      code === 'INVALID_TAG' ||
      code === 'PLAYER_NOT_FOUND' ||
      code === 'FORBIDDEN' ||
      code === 'MISSING_TOKEN' ||
      code === 'API_ERROR'
    ) {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno al crear el torneo' });
  }
});

export default router;
