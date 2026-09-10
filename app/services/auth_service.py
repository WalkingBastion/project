
import uuid

from jose import JWTError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    bad_request_exception,
    conflict_exception,
    credentials_exception,
)
from app.core.security import (
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.crud.user import create_user, get_user_by_id, get_user_by_login, update_password
from app.models.user import User
from app.schemas.user import Token, UserCreate


def register_user(db: Session, user_in: UserCreate) -> User:
    if get_user_by_login(db, user_in.login) is not None:
        raise conflict_exception("Пользователь с этим логином уже существует.")
    return create_user(db, user_in)


def authenticate_user(db: Session, login: str, password: str) -> User:
    user = get_user_by_login(db, login)
    if user is None or not verify_password(password, user.hashed_password):
        raise credentials_exception()
    return user


def issue_tokens(user: User) -> Token:
    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


def refresh_access_token(db: Session, refresh_token: str) -> Token:
    try:
        payload = decode_token(refresh_token)
    except JWTError:
        raise credentials_exception()

    if payload.get("type") != TokenType.REFRESH.value:
        raise credentials_exception()

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception()

    try:
        user = get_user_by_id(db, uuid.UUID(user_id))
    except ValueError:
        raise credentials_exception()

    if user is None:
        raise credentials_exception()

    return issue_tokens(user)


def change_password(db: Session, user: User, old_password: str, new_password: str) -> User:
    if not verify_password(old_password, user.hashed_password):
        raise bad_request_exception("Старый пароль неверен.")
    return update_password(db, user, new_password)
