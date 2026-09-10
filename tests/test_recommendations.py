
import uuid
from datetime import date, timedelta

from app.models.booking import Booking, ListingStatus


def _make_booking(db_session, name, location, price, days_ahead=5) -> Booking:
    booking = Booking(
        id=uuid.uuid4(),
        name=name,
        date=date.today() + timedelta(days=days_ahead),
        location=location,
        price=price,
        description="",
        confirmation_status=ListingStatus.CONFIRMED,
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    return booking


def test_recommendations_requires_auth(client, sample_booking):
    response = client.get("/api/v1/recommendations")
    assert response.status_code == 401


def test_recommendations_cold_start_returns_popular(
    client, user_headers, sample_booking, another_booking
):
    response = client.get("/api/v1/recommendations", headers=user_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_recommendations_based_on_view_history(client, user_headers, db_session, sample_booking):
    similar = _make_booking(db_session, "Люкс", "тюменскаяобласть", 160)
    _make_booking(db_session, "Озёроный Дом", "Санкт-Питербург", 500)

    view_resp = client.get(f"/api/v1/bookings/{sample_booking.id}", headers=user_headers)
    assert view_resp.status_code == 200

    response = client.get("/api/v1/recommendations", headers=user_headers)
    assert response.status_code == 200
    results = response.json()
    result_names = [r["name"] for r in results]

    assert similar.name in result_names
    assert sample_booking.name not in result_names


def test_recommendations_respect_limit(client, user_headers, db_session, sample_booking):
    for i in range(10):
        _make_booking(db_session, f"Room {i}", "тюмеескаяобласть", 100 + i)

    response = client.get("/api/v1/recommendations", headers=user_headers, params={"limit": 3})
    assert response.status_code == 200
    assert len(response.json()) <= 3
