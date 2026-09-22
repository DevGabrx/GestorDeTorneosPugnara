import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, status: 'ok', service: 'pugnara-api' });
});

router.get('/ready', async (_req, res) => {
  try {
    const { prisma } = await import('../lib/prisma.js');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected' });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
      message: error.message,
    });
  }
});

export default router;
