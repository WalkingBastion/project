
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return db.get(User, user_id)


def get_user_by_login(db: Session, login: str) -> User | None:
    return db.scalar(select(User).where(User.login == login))


def create_user(db: Session, user_in: UserCreate) -> User:
    user = User(
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        login=user_in.login,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_password(db: Session, user: User, new_password: str) -> User:
    user.hashed_password = hash_password(new_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
