# BIOABONO System

Sistema web de gestión comercial BIOABONO.

## Estructura

- `frontend/`: React + TypeScript + Vite.
- `backend/`: Node.js + Elysia + TypeScript + Drizzle ORM.
- `backend/src/db/schema`: modelo relacional PostgreSQL.
- `backend/src/modules`: módulos del monolito modular.

## Base de datos

La base PostgreSQL debe existir previamente. Configure `DATABASE_URL` en `backend/.env` o en el entorno antes de ejecutar migraciones.

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:check
```

No hay seed inicial en esta etapa.
