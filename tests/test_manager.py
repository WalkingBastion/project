

def test_manager_list_all_reservations_requires_manager(client, user_headers):
    response = client.get("/api/v1/manager/reservations", headers=user_headers)
    assert response.status_code == 403


def test_manager_list_all_reservations(client, user_headers, manager_headers, sample_booking):
    client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 1},
    )
    response = client.get("/api/v1/manager/reservations", headers=manager_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_manager_update_reservation_status(client, user_headers, manager_headers, sample_booking):
    create_resp = client.post(
        "/api/v1/reservations",
        headers=user_headers,
        json={"booking_id": str(sample_booking.id), "guests": 1},
    )
    reservation_id = create_resp.json()["id"]

    response = client.patch(
        f"/api/v1/manager/reservations/{reservation_id}/status",
        headers=manager_headers,
        json={"status": "confirmed"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"


def test_manager_update_reservation_status_not_found(client, manager_headers):
    response = client.patch(
        "/api/v1/manager/reservations/00000000-0000-0000-0000-000000000000/status",
        headers=manager_headers,
        json={"status": "confirmed"},
    )
    assert response.status_code == 404


def test_manager_stats(client, manager_headers, sample_booking):
    response = client.get("/api/v1/manager/stats", headers=manager_headers)
    assert response.status_code == 200
    body = response.json()
    assert "total_bookings" in body
    assert "total_reservations" in body
