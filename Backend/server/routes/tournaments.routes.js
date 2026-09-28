import { Router } from 'express';
import {
  listTournaments,
  createTournament,
  addPlayerToTournament,
  addMatchResult,
} from '../services/tournaments.service.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(listTournaments());
});

router.post('/', async (req, res, next) => {
  try {
    const tournament = await createTournament(req.body);
    res.status(201).json(tournament);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/players', async (req, res, next) => {
  try {
    const { tag } = req.body;
    const updated = await addPlayerToTournament(req.params.id, tag);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/matches', (req, res, next) => {
  try {
    const updated = addMatchResult(req.params.id, req.body.results);
    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;