import { Router } from 'express';
import { fetchPlayerSnapshot } from '../services/brawlstars.service.js';

const router = Router();

router.get('/players/:tag', async (req, res) => {
  try {
    const snapshot = await fetchPlayerSnapshot(req.params.tag);
    res.json(snapshot);
  } catch (error) {
    const statusMap = {
      INVALID_TAG: 400,
      PLAYER_NOT_FOUND: 404,
      FORBIDDEN: 403,
      MISSING_TOKEN: 500,
      API_ERROR: 502,
    };

    const statusCode = statusMap[error.code];
    if (statusCode) {
      return res.status(statusCode).json({ error: error.message });
    }

    console.error(error);
    res.status(500).json({ error: 'Error al consultar Brawl Stars' });
  }
});

export default router;
