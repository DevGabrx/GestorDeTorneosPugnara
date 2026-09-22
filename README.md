# Pugnara — prototipo mínimo

Gestor de torneos eSports (proyecto de grado). Este prototipo demuestra:

- API REST en Node/Express con torneos **en memoria** (sin persistencia).
- Integración con la [API oficial de Brawl Stars](https://developer.brawlstars.com).
- Frontend React (Vite) con formulario y listado.

## Requisitos

- Node.js 20+
- Token de desarrollador en [developer.brawlstars.com](https://developer.brawlstars.com)

## Configuración

1. Copia `Backend/.env.example` a `Backend/.env`.
2. Asigna `BRAWL_STARS_TOKEN` y opcionalmente `PORT` (default `3000`).

**No subas `.env` a git** (ya está en `.gitignore`).

## Ejecutar en local

Terminal 1 — backend:

```bash
cd Backend
npm install
npm run dev
```

Terminal 2 — frontend:

```bash
cd Frontend
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

## Probar la API

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/tournaments
curl -X POST http://localhost:3000/api/tournaments -H "Content-Type: application/json" -d "{\"name\":\"Copa Uni\",\"maxTeams\":8}"
```

Consulta de jugador (proxy backend):

```bash
curl http://localhost:3000/api/brawlstars/players/%232PP
```

## Notas del prototipo

- Al reiniciar el backend, los torneos desaparecen (almacenamiento en memoria).
- La API de Supercell puede devolver 403 si la IP no está en la allowlist del token.
- El endpoint `/health/ready` comprueba PostgreSQL vía Prisma; no es necesario para este prototipo.
