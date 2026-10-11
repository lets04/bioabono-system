# BIOABONO System

Sistema web de gestión comercial BIOABONO.

## Estructura

- `frontend/`: React + TypeScript + Vite + TanStack Query.
- `backend/`: Node.js + Elysia + TypeScript + Drizzle ORM.
- `backend/src/db/schema`: modelo relacional PostgreSQL.
- `backend/src/modules`: módulos del monolito modular.
- `backend/src/lib`: utilidades compartidas (stock atómico, precios, errores HTTP, rate limit, JWT, correo).
- `docs/reference/`: prototipo visual original (no forma parte de la app).

## Configuración

Copie `backend/.env.example` a `backend/.env` y complete los valores. Los más importantes:

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL. La base debe existir previamente. |
| `JWT_SECRET` | Secreto de firma de sesiones. En producción se exigen ≥ 32 caracteres aleatorios (`openssl rand -base64 48`). |
| `FRONTEND_URL` | URL pública del frontend, usada en los enlaces de los correos. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales del administrador inicial (`db:seed-admin`). |
| `SMTP_*` | Servidor de correo. Sin `SMTP_HOST` los correos no se envían; fuera de producción su contenido se muestra en consola. |
| `BUSINESS_UTC_OFFSET` | Zona horaria del negocio para filtros de reportes (por defecto `-04:00`, Bolivia). |
| `CORS_ORIGINS` | Solo si el frontend se sirve desde otro dominio (lista separada por comas). |

## Puesta en marcha

```bash
npm install
npm run db:migrate       # aplica las migraciones
npm run db:seed-admin    # crea o actualiza el administrador
npm run db:seed          # (opcional) categorías y productos de ejemplo
npm run dev:backend      # API en http://localhost:3000
npm run dev              # frontend en http://localhost:5173 (proxy /api -> backend)
```

`db:seed` ya no toca al administrador; para cambiar su contraseña use `db:seed-admin`.

## Migraciones

Después de modificar `backend/src/db/schema`:

```bash
npm run db:generate   # genera la migración SQL y el snapshot en backend/drizzle
npm run db:migrate
```

Confirme siempre el SQL generado y el snapshot en `backend/drizzle/meta` juntos.

## Calidad

```bash
npm run typecheck   # TypeScript en backend y frontend
npm test            # tests unitarios (Vitest)
```

## Producción

```bash
npm run build                          # frontend/dist y backend/dist
NODE_ENV=production npm start --workspace backend
```

- Sirva `frontend/dist` con un servidor web que redirija `/api` al backend y que devuelva `index.html` para cualquier otra ruta (la app usa URLs como `/ventas` o `/reportes`).
- El rate limiting de autenticación es en memoria: con varias instancias del API, muévalo a un almacenamiento compartido.
