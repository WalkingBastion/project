# Система управления бронированием

# API для бронирования гостиничных номеров, разработанный с использованием **FastAPI**, **SQLAlchemy 2.0** и **PostgreSQL**.
Система включает функции аутентификации (JWT access/refresh), поиск и просмотр списка номеров, процесс оформления бронирования, механизм рекомендаций на основе характеристик контента, а также панель управления для администратора.

## Функции

- **Поиск и фильтры** — список бронирований с пагинацией и фильтрацией по местоположению, диапазону дат и цене.
- **Страница с детальной информацией о бронировании** — `GET /bookings/{id}` (также фиксирует факт просмотра, данные которого используются системой рекомендаций).
- **Аутентификация** — регистрация, вход (JWT-токены доступа и обновления), смена пароля, обновление токена.
- **Бронирования** — создание, подтверждение, отмена и просмотр списка «моих бронирований».
- **AI-рекомендации** — `GET /recommendations` предлагает альтернативные варианты бронирования на основе истории просмотров и заказов пользователя (см. `app/services/recommendation_service.py`).
- **Бэк-офис менеджера** — роль `manager` позволяет создавать, редактировать и удалять предложения по бронированию, а также модерировать (подтверждать или отменять) любые бронирования пользователей.

## Технологический стек

Python 3.12, FastAPI, SQLAlchemy 2.0 (typed models), Alembic migrations,
PostgreSQL 16, JWT (`python-jose`), `passlib`/`bcrypt` хеширование паролей,
Pytest + `httpx` для тестов, Docker Compose для развертывания.

## Модель данных

```
users            id, first_name, last_name, login (unique), hashed_password, role, created_at
bookings         id, name, date, location, price, description, confirmation_status, created_at, updated_at
reservations     id, user_id -> users, booking_id -> bookings, status, guests, total_price, created_at
view_history     id, user_id -> users, booking_id -> bookings, viewed_at
```

## Компоновка проекта

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

## Запуск с помощью Docker Compose

```bash
cp .env.example .env        # скорректировать SECRET_KEY etc. для реального запуска.
docker compose up --build
```

Эта команда собирает образ API, запускает Postgres, дожидается его готовности к работе, автоматически выполняет `alembic upgrade head` (см. `docker-entrypoint.sh`), 
а затем запускает Uvicorn. После этого API становится доступен по адресу `http://localhost:8000`, а интерактивная документация — по адресу `http://localhost:8000/docs`.

Создайте первую учетную запись менеджера (по замыслу, при регистрации создаются только учетные записи типа `user` — никто не должен иметь 
возможности самостоятельно присвоить себе права менеджера через публичный API):

```bash
docker compose exec api python scripts/create_manager.py \
    --first-name Yakov --last-name Krilov --login yakov.manager --password Str0ngPass1
```

## Локальный запуск.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg2://booking_user:booking_pass@localhost:5432/booking_db
alembic upgrade head
uvicorn app.main:app --reload
```

## Запуск тестов

Для каждого теста используется изолированная база данных SQLite, работающая в оперативной памяти (через фикстуры в файле `tests/conftest.py`), 
поэтому запуск Postgres или Docker не требуется:

```bash
pip install -r requirements.txt
pytest
```

## Обзор API 

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

При получении некорректных входных данных (неверные типы, значения вне допустимого диапазона, отсутствие обязательных полей) 
возвращается ответ со статусом `422` и структурированным телом `{"detail": ..., "errors": [...]}`; 
обработка осуществляется с помощью специального обработчика исключений валидации, определенного в `app/main.py`. 
Ошибки, связанные с бизнес-логикой (дублирование логина, неверный пароль, недоступность бронирования, попытка доступа к чужому бронированию), 
приводят к возврату соответствующих кодов состояния: `400`, `401`, `403`, `404` или `409`.

## Фронт-Энд. 

Добавлен README для Фронт-Энд части проекта в репозитории frontend. 
12 Тест-Файлов и 45 тестов успешно проходят проверку.
