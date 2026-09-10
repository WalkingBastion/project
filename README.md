# Booking Management System

A hotel room booking API built with **FastAPI** + **SQLAlchemy 2.0** + **PostgreSQL**,
featuring authentication (JWT access/refresh), searchable listings, a reservation
workflow, a content-based recommendation engine, and a manager back-office.

## Features

- **Search & filters** — list bookings with pagination, filtering by location, date
  range, and price range.
- **Booking detail page** — `GET /bookings/{id}` (also logs a view, feeding the
  recommender).
- **Auth** — registration, login (JWT access + refresh tokens), password change,
  token refresh.
- **Reservations** — create, confirm, cancel, and list "my reservations".
- **AI recommendations** — `GET /recommendations` suggests alternative bookings
  based on a user's viewing/booking history (see `app/services/recommendation_service.py`).
- **Manager back-office** — a `manager` role can create/edit/delete booking
  listings and moderate (approve/cancel) any user's reservation.

## Tech stack

Python 3.12, FastAPI, SQLAlchemy 2.0 (typed models), Alembic migrations,
PostgreSQL 16, JWT (`python-jose`), `passlib`/`bcrypt` password hashing,
Pytest + `httpx` for tests, Docker Compose for deployment.

## Data model

```
users            id, first_name, last_name, login (unique), hashed_password, role, created_at
bookings         id, name, date, location, price, description, confirmation_status, created_at, updated_at
reservations     id, user_id -> users, booking_id -> bookings, status, guests, total_price, created_at
view_history     id, user_id -> users, booking_id -> bookings, viewed_at
```

**Why `Booking` and `Reservation` are separate tables (normalization note):**
the spec's literal `Booking` table mixes the *listing* (name/location/price/
description) with the *status of one guest's booking of it*
(`confirmation_status`). Keeping both on one row would mean either duplicating
listing data per guest or making it impossible for two different users to book
the same listing — a 3NF violation, since `confirmation_status` would then
depend on "which user booked which date," not on the Booking's own primary
key. Splitting them keeps every column functionally dependent only on its own
table's key: `Booking` keeps the required fields (id, name, date, location,
price, description, confirmation_status — used here as the *listing's*
publish status), and `Reservation` tracks each guest's own booking and its
own confirmation status. `ViewHistory` is a third table purely to drive the
recommendation engine.

## Project layout

```
app/
  api/v1/        route handlers (auth, bookings, reservations, recommendations, manager)
  core/          security (JWT/hashing), dependencies (auth guards), exceptions
  crud/          database access functions (one module per model group)
  models/        SQLAlchemy ORM models
  schemas/       Pydantic request/response models
  services/       business logic (auth flows, recommendation engine)
  config.py, database.py, main.py
alembic/          migrations
tests/            pytest suite (one file per router)
scripts/          create_manager.py — CLI to bootstrap the first manager account
docker-compose.yml, Dockerfile, docker-entrypoint.sh
```

## Running with Docker Compose

```bash
cp .env.example .env        # adjust SECRET_KEY etc. for real deployments
docker compose up --build
```

This builds the API image, starts Postgres, waits for it to be healthy, runs
`alembic upgrade head` automatically (see `docker-entrypoint.sh`), then starts
Uvicorn. The API is then available at `http://localhost:8000`, interactive
docs at `http://localhost:8000/docs`.

Create the first manager account (registration only ever creates `user`
accounts, by design — nobody should be able to grant themselves manager
rights through the public API):

```bash
docker compose exec api python scripts/create_manager.py \
    --first-name Jane --last-name Doe --login jane.manager --password Str0ngPass1
```

## Running locally (without Docker)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg2://booking_user:booking_pass@localhost:5432/booking_db
alembic upgrade head
uvicorn app.main:app --reload
```

## Running tests

Tests use an isolated in-memory SQLite database per test (via fixtures in
`tests/conftest.py`), so no running Postgres/Docker is required:

```bash
pip install -r requirements.txt
pytest
```

## API overview

| Area | Endpoint | Auth |
|---|---|---|
| Auth | `POST /api/v1/auth/register` | — |
| Auth | `POST /api/v1/auth/login` | — |
| Auth | `POST /api/v1/auth/refresh` | — |
| Auth | `PUT /api/v1/auth/password` | user |
| Auth | `GET /api/v1/auth/me` | user |
| Bookings | `GET /api/v1/bookings` (filters: `location`, `date_from`, `date_to`, `min_price`, `max_price`, `page`, `page_size`) | — |
| Bookings | `GET /api/v1/bookings/{id}` | user |
| Bookings | `POST /api/v1/bookings` | manager |
| Bookings | `PUT /api/v1/bookings/{id}` | manager |
| Bookings | `DELETE /api/v1/bookings/{id}` | manager |
| Reservations | `POST /api/v1/reservations` | user |
| Reservations | `GET /api/v1/reservations` | user |
| Reservations | `GET /api/v1/reservations/{id}` | owner |
| Reservations | `POST /api/v1/reservations/{id}/confirm` | owner |
| Reservations | `DELETE /api/v1/reservations/{id}` (cancel) | owner |
| Recommendations | `GET /api/v1/recommendations?limit=5` | user |
| Manager | `GET /api/v1/manager/reservations` | manager |
| Manager | `PATCH /api/v1/manager/reservations/{id}/status` | manager |
| Manager | `GET /api/v1/manager/stats` | manager |

Invalid input (bad types, out-of-range values, missing fields) returns a
`422` with a structured `{"detail": ..., "errors": [...]}` body via the
custom validation-exception handler in `app/main.py`. Business-rule errors
(duplicate login, wrong password, unavailable booking, unauthorized access
to another user's reservation) return `400`/`401`/`403`/`404`/`409` as
appropriate.
