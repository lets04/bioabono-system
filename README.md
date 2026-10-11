# BIOABONO System

Sistema web de gestión comercial BIOABONO.

## Estructura

- `frontend/`: React + TypeScript + Vite + TanStack Query.
- `backend/`: Node.js + Elysia + TypeScript + Drizzle ORM.
- `backend/src/db/schema`: modelo relacional PostgreSQL.
- `backend/src/modules`: módulos del monolito modular.
- `backend/src/lib`: utilidades compartidas (stock atómico, precios, errores HTTP, rate limit, correo).
- `docs/reference/`: prototipo visual original (no forma parte de la app).

## Configuración

Copie `backend/.env.example` a `backend/.env` y complete los valores. Los más importantes:

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL. La base debe existir previamente. |
| `SESSION_MAX_HOURS` | Duración de una sesión normal (cookie `httpOnly` que se borra al cerrar el navegador; en la base solo se guarda el hash del token). 5 minutos antes de vencer, la app pregunta si se quiere mantener y la alarga otras tantas horas. Por defecto 8. |
| `SESSION_REMEMBER_DAYS` | Con la casilla "Mantener sesión iniciada" del login: días sin uso tras los que vence la sesión, que sobrevive a cerrar el navegador. Por defecto 30. |
| `FRONTEND_URL` | URL pública del frontend, usada en los enlaces de los correos. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales del administrador inicial (`db:seed-admin`). |
| `SMTP_*` | Servidor de correo. Sin `SMTP_HOST` los correos no se envían; fuera de producción su contenido se muestra en consola. |
| `BUSINESS_UTC_OFFSET` | Zona horaria del negocio para filtros de reportes (por defecto `-04:00`, Bolivia). |
| `CORS_ORIGINS` | Solo si el frontend se sirve desde otro origen (lista separada por comas). La cookie es `SameSite=Strict`: frontend y API deben compartir dominio base. |
| `TRUST_PROXY` | `true` solo detrás de un proxy propio; si no, el rate limit ignora `X-Forwarded-For`. |

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
npm run db:migrate                     # antes de arrancar la versión nueva
NODE_ENV=production npm start --workspace backend
```

- Sirva la app por HTTPS: con `NODE_ENV=production` la cookie de sesión es `Secure` (se puede forzar con `COOKIE_SECURE`).
- Detrás de nginx, Cloudflare u otro proxy propio, configure `TRUST_PROXY=true`; si no, todos los clientes comparten la IP del proxy en el rate limit.
- Las sesiones se guardan en PostgreSQL (`auth_sessions`): sobreviven a reinicios y deploys. `JWT_SECRET` y `JWT_EXPIRES_IN` ya no se usan; puede quitarlos del `.env`.

- Sirva `frontend/dist` con un servidor web que redirija `/api` al backend y que devuelva `index.html` para cualquier otra ruta (la app usa URLs como `/ventas` o `/reportes`).
- El rate limiting de autenticación es en memoria: con varias instancias del API, muévalo a un almacenamiento compartido.
