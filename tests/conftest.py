
import uuid
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.database import Base, get_db
from app.main import app
from app.models.booking import Booking, ListingStatus
from app.models.user import User, UserRole

SQLALCHEMY_TEST_URL = "sqlite:///:memory:"


@pytest.fixture()
def db_engine():
    engine = create_engine(
        SQLALCHEMY_TEST_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(db_engine):
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _create_user(db_session, login: str, password: str, role: UserRole = UserRole.USER) -> User:
    user = User(
        id=uuid.uuid4(),
        first_name="Test",
        last_name="User",
        login=login,
        hashed_password=hash_password(password),
        role=role,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def regular_user(db_session):
    return _create_user(db_session, "guest_login", "SecurePass1")


@pytest.fixture()
def manager_user(db_session):
    return _create_user(db_session, "manager_login", "SecurePass1", role=UserRole.MANAGER)


def _auth_headers(client, login: str, password: str) -> dict:
    response = client.post("/api/v1/auth/login", json={"login": login, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def user_headers(client, regular_user):
    return _auth_headers(client, "guest_login", "SecurePass1")


@pytest.fixture()
def manager_headers(client, manager_user):
    return _auth_headers(client, "manager_login", "SecurePass1")


@pytest.fixture()
def sample_booking(db_session) -> Booking:
    booking = Booking(
        id=uuid.uuid4(),
        name="Дом в Горах",
        date=date.today() + timedelta(days=10),
        location="Тюменский округ",
        price=150.00,
        description="Приятное жильё с видом на горы.",
        confirmation_status=ListingStatus.CONFIRMED,
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    return booking


@pytest.fixture()
def another_booking(db_session) -> Booking:
    booking = Booking(
        id=uuid.uuid4(),
        name="Дом у Леса.",
        date=date.today() + timedelta(days=20),
        location="Тюмень",
        price=90.00,
        description="Уютный дом расположенный у леса.",
        confirmation_status=ListingStatus.CONFIRMED,
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    return booking
