# AGENTS.md — Deyar

## Stack & Layout
- **Monorepo, modular monolith**: `backend/` (Django 5 + DRF) + `frontend/` (Next.js 16 App Router, React 19, TypeScript, Tailwind 4) + PostgreSQL 16. No microservices.
- `backend/` domain apps: `users`, `teachers`, `students`, `subjects`, `availability`, `bookings`, `reviews`, `common`, `config`. Only `users`/`common` have real code; others are stubs (`apps.py`+`urls.py` only) — create models/serializers/services/selectors/views when implementing features. Follow `docs/database.md` for schema.
- API versioned at `/api/v1/` — See `backend/config/urls.py:1` for routing. Health check: `GET /api/v1/health/` (`backend/common/views.py:7`).
- DB is **PostgreSQL only** (`psycopg[binary]`). Never use SQLite — `config/settings/base.py:72` parses `DATABASE_URL` or falls back to `deyar_db`.

## Env & Settings
- `.env` lives at **repo root** (not `backend/`). Loaded via `BASE_DIR.parent / ".env"` in `backend/config/settings/base.py:7`. Copy `cp .env.example .env` before running anything.
- Key vars: `DATABASE_URL`, `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_URL`. See `.env.example`.
- Settings modules: `config.settings.development` (default in `backend/manage.py:5`, `DEBUG=True`, `ALLOWED_HOSTS=["*"]`), `config.settings.test` (used by pytest, `MD5PasswordHasher` for speed), `config.settings.production`. Override with `DJANGO_SETTINGS_MODULE` env var.
- Custom user model `users.User` (`backend/users/models.py:32`) — UUID PK, `email` unique/lowercased, `user_timezone` field with `db_column="timezone"` (query as `user_timezone`, DB column is `timezone`).

## Commands
```bash
# DB (required for backend/tests)
docker compose up -d db   # postgres:16-alpine, deyar_db/deyar_user/deyar_password, port 5432

# Backend — run from REPO ROOT (pytest.ini sets pythonpath=backend)
pip install -r backend/requirements.txt
python backend/manage.py migrate          # uses development settings by default
python backend/manage.py runserver        # http://localhost:8000/api/v1/
pytest                                    # uses config.settings.test via pytest.ini
pytest backend/tests/test_auth_and_health.py -v  # single file
pytest -k test_health_check_endpoint -v           # single test
black --check backend/
flake8 backend/ --max-line-length=120 --exclude=migrations,venv --extend-ignore=F403,F401  # CI flags at .github/workflows/ci.yml:44
black backend/                             # fix formatting

# Frontend — run from frontend/
cd frontend && npm install
npm run dev    # http://localhost:3000
npm run lint   # eslint with eslint-config-next (eslint.config.mjs)
npm run build  # Next.js production build — also runs in CI
```

## Testing
- `pytest.ini:2` sets `DJANGO_SETTINGS_MODULE=config.settings.test` and `pythonpath=backend` — always run `pytest` from repo root, not `backend/`.
- CI (`/.github/workflows/ci.yml`) needs `DATABASE_URL` + `SECRET_KEY` env vars for backend tests and a live Postgres service. Locally ensure Docker DB is up or `DATABASE_URL` points to a running Postgres.
- Only existing tests: `backend/tests/test_auth_and_health.py` (health + register/login/logout/me). Auth uses `SessionAuthentication` (`base.py:121`) — `APIClient` in tests relies on session cookies, not tokens.

## Frontend Notes
- Path alias `@/*` -> `./*` (`frontend/tsconfig.json:21`). Tailwind 4 via `@tailwindcss/postcss`.
- No frontend test setup yet (no jest/vitest/playwright). `package.json` scripts are only `dev`/`build`/`lint`/`start`.
- Currently stock `create-next-app` page (`frontend/app/page.tsx`) — not yet wired to backend. `NEXT_PUBLIC_API_URL` should point to `http://localhost:8000/api/v1`.

## Architecture Gotchas
- **Postgres is source of truth** for bookings. Availability = rules (`TeacherAvailability` weekly windows) + exceptions (`AvailabilityException`) + existing bookings — slots generated dynamically, never pre-materialized (`docs/booking.md`).
- Timezones: store UTC in DB, teacher availability in teacher's IANA timezone, display in user's timezone. All business logic must use aware datetimes.
- Booking: state machine `PENDING -> CONFIRMED/REJECTED/CANCELLED`, `CONFIRMED -> CANCELLED/COMPLETED/NO_SHOW`. Enforce server-side. Double-booking protection requires `transaction.atomic` + `select_for_update()` + exclusion constraints (`tstzrange`+`btree_gist`) — see `docs/booking.md:23`.
- DRF defaults: `SessionAuthentication` + `IsAuthenticatedOrReadOnly` (`base.py:121`). Health check explicitly `AllowAny`. New endpoints must set permissions explicitly.
- Admin/media: `MEDIA_ROOT=backend/media`, `STATIC_ROOT=backend/static_collected`. Don't commit `media/`/`static_collected/`/`venv/`/`node_modules/`.

## CI
- `/.github/workflows/ci.yml`: two parallel jobs. Backend job: `black --check` + `flake8` with `--extend-ignore=F403,F401` then `pytest`. Frontend job: `npm ci` then `npm run lint` + `npm run build` (typecheck via build). Replicate locally before pushing.

## Docs
- `docs/architecture.md` — system diagram & domain ownership
- `docs/database.md` — model fields & constraints
- `docs/booking.md` — slot generation & concurrency strategy
- `instructions.md` — full product spec (60 sections) — authoritative for booking modes, timezone rules, MVP scope
