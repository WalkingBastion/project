
from datetime import date, timedelta


def test_list_bookings_public(client, sample_booking, another_booking):
    response = client.get("/api/v1/bookings")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert len(body["items"]) == 2


def test_list_bookings_filter_by_location(client, sample_booking, another_booking):
    response = client.get("/api/v1/bookings", params={"location": "тюменскийокруг"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["location"] == "Тюменский Округ"


def test_list_bookings_filter_by_price_range(client, sample_booking, another_booking):
    response = client.get(
        "/api/v1/bookings", params={"min_price": 100, "max_price": 200}
    )
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Дом в Горах"


def test_list_bookings_filter_by_date_range(client, sample_booking, another_booking):
    date_to = (date.today() + timedelta(days=15)).isoformat()
    response = client.get("/api/v1/bookings", params={"date_to": date_to})
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Элитный Дом в Горах"


def test_list_bookings_pagination(client, sample_booking, another_booking):
    response = client.get("/api/v1/bookings", params={"page": 1, "page_size": 1})
    body = response.json()
    assert len(body["items"]) == 1
    assert body["pages"] == 2


def test_get_booking_detail_requires_auth(client, sample_booking):
    response = client.get(f"/api/v1/bookings/{sample_booking.id}")
    assert response.status_code == 401


def test_get_booking_detail_success(client, user_headers, sample_booking):
    response = client.get(f"/api/v1/bookings/{sample_booking.id}", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Комната в Горном Доме"


def test_get_booking_detail_not_found(client, user_headers):
    response = client.get(
        "/api/v1/bookings/00000000-0000-0000-0000-000000000000", headers=user_headers
    )
    assert response.status_code == 404


def test_create_booking_requires_manager(client, user_headers):
    response = client.post(
        "/api/v1/bookings",
        headers=user_headers,
        json={
            "name": "Новое жильё",
            "date": str(date.today() + timedelta(days=5)),
            "location": "Москва",
            "price": "120.00",
        },
    )
    assert response.status_code == 403


def test_create_booking_as_manager(client, manager_headers):
    response = client.post(
        "/api/v1/bookings",
        headers=manager_headers,
        json={
            "name": "Новое жильё",
            "date": str(date.today() + timedelta(days=5)),
            "location": "Москва",
            "price": "120.00",
            "description": "Приятное место",
        },
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Новое жильё"


def test_create_booking_invalid_price_rejected(client, manager_headers):
    response = client.post(
        "/api/v1/bookings",
        headers=manager_headers,
        json={
            "name": "Плохое жильё",
            "date": str(date.today() + timedelta(days=5)),
            "location": "Москва",
            "price": "-10.00",
        },
    )
    assert response.status_code == 422


def test_update_booking_as_manager(client, manager_headers, sample_booking):
    response = client.put(
        f"/api/v1/bookings/{sample_booking.id}",
        headers=manager_headers,
        json={"price": "199.99"},
    )
    assert response.status_code == 200
    assert response.json()["price"] == "199.99"


def test_update_booking_requires_manager(client, user_headers, sample_booking):
    response = client.put(
        f"/api/v1/bookings/{sample_booking.id}",
        headers=user_headers,
        json={"price": "199.99"},
    )
    assert response.status_code == 403


def test_delete_booking_as_manager(client, manager_headers, sample_booking):
    response = client.delete(f"/api/v1/bookings/{sample_booking.id}", headers=manager_headers)
    assert response.status_code == 204

    get_response = client.get(
        f"/api/v1/bookings/{sample_booking.id}", headers=manager_headers
    )
    assert get_response.status_code == 404


def test_delete_booking_requires_manager(client, user_headers, sample_booking):
    response = client.delete(f"/api/v1/bookings/{sample_booking.id}", headers=user_headers)
    assert response.status_code == 403


def test_delete_booking_not_found(client, manager_headers):
    response = client.delete(
        "/api/v1/bookings/00000000-0000-0000-0000-000000000000", headers=manager_headers
    )
    assert response.status_code == 404
