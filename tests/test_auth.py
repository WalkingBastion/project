
import pytest


def test_register_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Yakov",
            "last_name": "Krilov",
            "login": "yakov_1",
            "password": "StrongPass1",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["login"] == "yakov_1"
    assert body["role"] == "user"
    assert "password" not in body
    assert "hashed_password" not in body


def test_register_duplicate_login_conflicts(client):
    payload = {
        "first_name": "Yakov",
        "last_name": "Krilov",
        "login": "dup_login",
        "password": "StrongPass1",
    }
    first = client.post("/api/v1/auth/register", json=payload)
    second = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201
    assert second.status_code == 409


@pytest.mark.parametrize(
    "payload,field",
    [
        (
            {"first_name": "", "last_name": "L", "login": "abcde", "password": "StrongPass1"},
            "first_name",
        ),
        (
            {"first_name": "A", "last_name": "L", "login": "ab", "password": "StrongPass1"},
            "login",
        ),
        (
            {"first_name": "A", "last_name": "L", "login": "abcde", "password": "short1"},
            "password",
        ),
        (
            {
                "first_name": "A",
                "last_name": "L",
                "login": "abcde",
                "password": "alllettersnodigits",
            },
            "password",
        ),
    ],
)
def test_register_validation_errors(client, payload, field):
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_login_success(client, regular_user):
    response = client.post(
        "/api/v1/auth/login", json={"login": "guest_login", "password": "SecurePass1"}
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password(client, regular_user):
    response = client.post(
        "/api/v1/auth/login", json={"login": "guest_login", "password": "WrongPass1"}
    )
    assert response.status_code == 401


def test_login_unknown_user(client):
    response = client.post(
        "/api/v1/auth/login", json={"login": "ghost", "password": "SecurePass1"}
    )
    assert response.status_code == 401


def test_refresh_token_success(client, regular_user):
    login_resp = client.post(
        "/api/v1/auth/login", json={"login": "guest_login", "password": "SecurePass1"}
    )
    refresh_token = login_resp.json()["refresh_token"]
    response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_refresh_token_rejects_access_token(client, user_headers):
    access_token = user_headers["Authorization"].split(" ")[1]
    response = client.post("/api/v1/auth/refresh", json={"refresh_token": access_token})
    assert response.status_code == 401


def test_refresh_token_invalid(client):
    response = client.post("/api/v1/auth/refresh", json={"refresh_token": "not-a-real-token"})
    assert response.status_code == 401


def test_get_current_user_requires_auth(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_current_user(client, user_headers):
    response = client.get("/api/v1/auth/me", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["login"] == "guest_login"


def test_change_password_success(client, user_headers):
    response = client.put(
        "/api/v1/auth/password",
        headers=user_headers,
        json={"old_password": "SecurePass1", "new_password": "NewSecurePass2"},
    )
    assert response.status_code == 200

    relogin = client.post(
        "/api/v1/auth/login", json={"login": "guest_login", "password": "NewSecurePass2"}
    )
    assert relogin.status_code == 200


def test_change_password_wrong_old_password(client, user_headers):
    response = client.put(
        "/api/v1/auth/password",
        headers=user_headers,
        json={"old_password": "WrongOldPass1", "new_password": "NewSecurePass2"},
    )
    assert response.status_code == 400
