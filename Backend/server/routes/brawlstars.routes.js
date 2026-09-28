import { Router } from 'express';
import { fetchPlayerSnapshot } from '../services/brawlstars.service.js';

const router = Router();

router.get('/players/:tag', async (req, res) => {
  try {
    const snapshot = await fetchPlayerSnapshot(req.params.tag);
    res.json(snapshot);
  } catch (error) {
    const code = error.code;
    if (
      code === 'INVALID_TAG' ||
      code === 'PLAYER_NOT_FOUND' ||
      code === 'FORBIDDEN' ||
      code === 'MISSING_TOKEN' ||
      code === 'API_ERROR'
    ) {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al consultar Brawl Stars' });
  }
});

export default router;
