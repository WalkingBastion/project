
import uuid


def test_create_reservation_success(client, user_headers, sample_booking):
    response = client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 2},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending"
    assert body["guests"] == 2
    assert body["total_price"] == "300.00"


def test_create_reservation_requires_auth(client, sample_booking):
    response = client.post(
        "/api/v1/reservations", json={"booking_id": str(sample_booking.id), "guests": 1}
    )
    assert response.status_code == 401


def test_create_reservation_booking_not_found(client, user_headers):
    response = client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(uuid.uuid4()), "guests": 1},
    )
    assert response.status_code == 404


def test_create_reservation_invalid_guests_rejected(client, user_headers, sample_booking):
    response = client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 0},
    )
    assert response.status_code == 422


def test_list_my_reservations(client, user_headers, sample_booking, another_booking):
    client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 1},
    )
    client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(another_booking.id), "guests": 1},
    )
    response = client.get("/api/v1/reservations", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 2


def test_get_reservation_detail_owner_only(client, user_headers, manager_headers, sample_booking):
    create_resp = client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 1},
    )
    reservation_id = create_resp.json()["id"]

    own_view = client.get(f"/api/v1/reservations/{reservation_id}", headers=user_headers)
    assert own_view.status_code == 200

    other_view = client.get(f"/api/v1/reservations/{reservation_id}", headers=manager_headers)
    assert other_view.status_code == 403


def test_confirm_reservation(client, user_headers, sample_booking):
    create_resp = client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 1},
    )
    reservation_id = create_resp.json()["id"]

    confirm_resp = client.post(
        f"/api/v1/reservations/{reservation_id}/confirm", headers=user_headers
    )
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["status"] == "confirmed"


def test_confirm_reservation_twice_fails(client, user_headers, sample_booking):
    create_resp = client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 1},
    )
    reservation_id = create_resp.json()["id"]
    client.post(f"/api/v1/reservations/{reservation_id}/confirm", headers=user_headers)

    second_confirm = client.post(
        f"/api/v1/reservations/{reservation_id}/confirm", headers=user_headers
    )
    assert second_confirm.status_code == 400


def test_cancel_reservation(client, user_headers, sample_booking):
    create_resp = client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 1},
    )
    reservation_id = create_resp.json()["id"]

    cancel_resp = client.delete(f"/api/v1/reservations/{reservation_id}", headers=user_headers)
    assert cancel_resp.status_code == 204

    detail = client.get(f"/api/v1/reservations/{reservation_id}", headers=user_headers)
    assert detail.json()["status"] == "cancelled"


def test_cancel_reservation_not_owner(client, user_headers, manager_headers, sample_booking):
    create_resp = client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 1},
    )
    reservation_id = create_resp.json()["id"]

    response = client.delete(f"/api/v1/reservations/{reservation_id}", headers=manager_headers)
    assert response.status_code == 403
