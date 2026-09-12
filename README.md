# Deyar — Two-Sided Teaching Marketplace

Deyar connects students with qualified, verified teachers for 1-on-1 and recurring lessons with dynamic scheduling and timezone support.

## Architecture

- **Backend**: Django 5 + Django REST Framework modular monolith (`backend/`)
- **Database**: PostgreSQL with row-level transaction isolation (`psycopg3`)
- **Frontend**: Next.js (App Router, TypeScript, Tailwind CSS, TanStack Query) (`frontend/`)
- **API**: Versioned REST API at `/api/v1/`

## Quickstart (Local Development)

### 1. Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL (running locally or via Docker Compose)

### 2. Database Setup
Start PostgreSQL with Docker:
```bash
docker compose up -d db
```
Or use a local PostgreSQL instance and set `DATABASE_URL` in `.env`.

### 3. Backend Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env

# Run migrations
python backend/manage.py migrate

# Run tests
pytest

# Start backend server
python backend/manage.py runserver
```

Backend API will be accessible at: `http://localhost:8000/api/v1/`
Health check endpoint: `http://localhost:8000/api/v1/health/`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

## Testing & Code Quality

### Backend
```bash
pytest
flake8 backend/ --max-line-length=120 --exclude=migrations,venv
black --check backend/
```

### Frontend
```bash
cd frontend
npm run lint
npm run build
```

## Documentation
Detailed specifications can be found in `docs/`:
- [docs/architecture.md](docs/architecture.md) — System architecture & scaling principles
- [docs/database.md](docs/database.md) — Schema models & relationships
- [docs/booking.md](docs/booking.md) — Scheduling engine, rules & concurrency strategy
