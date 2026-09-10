#!/usr/bin/env sh
set -e

echo "Waiting for the database to be ready..."
python - << 'PYEOF'
import time
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

from app.config import settings

engine = create_engine(settings.DATABASE_URL)

for attempt in range(30):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database is ready.")
        break
    except OperationalError:
        print(f"Database not ready yet (attempt {attempt + 1}/30), retrying...")
        time.sleep(2)
else:
    print("Database never became ready, exiting.")
    sys.exit(1)
PYEOF

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
exec "$@"
