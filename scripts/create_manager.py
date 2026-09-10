"""Вспомогательная утилита командной строки для создания (или повышения прав) учетной записи менеджера.

По замыслу разработчиков, при регистрации через публичный API всегда создается обычная учетная запись пользователя  например:
(`user`) — это сделано для того, чтобы никто не мог самостоятельно получить права менеджера через API.
апустите этот скрипт один раз, чтобы создать первую учетную запись менеджера, например:
    docker compose exec api python scripts/create_manager.py \\
        --first-name Yakov --last-name Krilov --login jane.manager --password Str0ngPass
"""
import argparse
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.security import hash_password  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or promote a manager account")
    parser.add_argument("--first-name", required=True)
    parser.add_argument("--last-name", required=True)
    parser.add_argument("--login", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.login == args.login).first()
        if existing:
            existing.role = UserRole.MANAGER
            db.add(existing)
            db.commit()
            print(f"Promoted existing user '{args.login}' to manager.")
            return

        user = User(
            first_name=args.first_name,
            last_name=args.last_name,
            login=args.login,
            hashed_password=hash_password(args.password),
            role=UserRole.MANAGER,
        )
        db.add(user)
        db.commit()
        print(f"Manager account '{args.login}' created.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
