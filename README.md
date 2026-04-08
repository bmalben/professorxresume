# Professor X

AI-powered interview practice: job-role intelligence, resume-aware mock interviews, and English coaching. The **backend** talks to **Google Gemini**; the API key never ships to the browser.

For deeper design notes, see [architecture.md](architecture.md).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with [Compose](https://docs.docker.com/compose/) (v2: `docker compose`)

## Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set at least:

   | Variable | Purpose |
   |----------|---------|
   | `JWT_SECRET` | Long random string for signing auth tokens |
   | `GEMINI_API_KEY` | [Google AI](https://aistudio.google.com/apikey) key (server-side only) |

Optional: `GEMINI_MODEL` (default `gemini-2.5-flash-lite`), `MONGO_IMAGE` if the default Mongo image pull fails.

**Do not commit `.env`.** It is listed in `.gitignore`.

## Run with Docker (recommended)

### Development (hot reload)

Mounts source into containers so API and Vite pick up edits.

```bash
docker compose up --build
```

When healthy:

- **Web (Vite):** [http://localhost:5173](http://localhost:5173)
- **API:** [http://localhost:4000](http://localhost:4000) (health: `/health`)

The dev stack uses `CORS_ORIGIN=http://localhost:5173` and `VITE_API_URL=http://localhost:4000` as in `.env.example`.

### Production-like stack (static UI + nginx)

Builds immutable images; the SPA is served by nginx and API routes are proxied on the same host (no separate API URL in the browser).

```bash
# Use a strong JWT_SECRET and real GEMINI_API_KEY in .env.
# For local prod compose, CORS_ORIGIN should match the UI origin, e.g.:
#   CORS_ORIGIN=http://localhost:8080

docker compose -f docker-compose.prod.yml up --build -d
```

- **App:** [http://localhost:8080](http://localhost:8080)

Stop and remove containers:

```bash
docker compose down
docker compose -f docker-compose.prod.yml down
```

## Run without Docker (optional)

You need **MongoDB** reachable at the URI in `MONGODB_URI` (default `mongodb://localhost:27017/professorx` if you run Mongo locally).

**API** (from `api/`):

```bash
npm ci
npm run dev
```

**Web** (from `web/`):

```bash
npm ci
npm run dev
```

Vite’s dev server proxies API paths to `localhost:4000` when `VITE_API_URL` is unset; if you set `VITE_API_URL`, the browser calls that base URL directly.

## Troubleshooting

- **Mongo image pull errors / TLS timeouts:** In `.env`, set `MONGO_IMAGE=mongo:7` (or another registry you can reach). The default Compose file uses a Google mirror for reliability.
- **Prod compose fails on startup:** Ensure `JWT_SECRET` and `GEMINI_API_KEY` are set; Compose treats them as required for `docker-compose.prod.yml`.
