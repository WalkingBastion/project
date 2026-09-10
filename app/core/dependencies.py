
import uuid

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.exceptions import credentials_exception, forbidden_exception
from app.core.security import TokenType, decode_token
from app.crud.user import get_user_by_id
from app.database import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    try:
        payload = decode_token(token)
    except JWTError:
        raise credentials_exception()

    if payload.get("type") != TokenType.ACCESS.value:
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
    return user


def get_current_manager(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.MANAGER:
        raise forbidden_exception("Требуются права администратора")
    return current_user
