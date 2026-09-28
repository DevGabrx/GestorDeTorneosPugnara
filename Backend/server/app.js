import cors from 'cors';
import express from 'express';
import brawlstarsRoutes from './routes/brawlstars.routes.js';
import healthRoutes from './routes/health.routes.js';
import tournamentsRoutes from './routes/tournaments.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/brawlstars', brawlstarsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

import axios from 'axios';

app.get('/mi-ip', async (req, res) => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    res.json({ ip_publica_render: response.data.ip });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;

