
import uuid
from collections import Counter
from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.crud.booking import get_user_view_history
from app.models.booking import Booking, ListingStatus, Reservation, ViewHistory


def _fallback_popular_bookings(
    db: Session, exclude_ids: set[uuid.UUID], limit: int
) -> list[Booking]:
    query = (
        select(Booking, func.count(ViewHistory.id).label("views"))
        .outerjoin(ViewHistory, ViewHistory.booking_id == Booking.id)
        .where(Booking.confirmation_status == ListingStatus.CONFIRMED)
        .group_by(Booking.id)
        .order_by(func.count(ViewHistory.id).desc(), Booking.date.asc())
        .limit(limit + len(exclude_ids))
    )
    results = [row[0] for row in db.execute(query).all() if row[0].id not in exclude_ids]
    return results[:limit]


def get_recommendations_for_user(db: Session, user_id: uuid.UUID, limit: int = 5) -> list[Booking]:
    history = get_user_view_history(db, user_id, limit=100)

    reservations = list(
        db.scalars(select(Reservation).where(Reservation.user_id == user_id)).all()
    )

    seen_booking_ids = {h.booking_id for h in history} | {r.booking_id for r in reservations}

    if not seen_booking_ids:
        return _fallback_popular_bookings(db, exclude_ids=set(), limit=limit)

    seen_bookings = list(
        db.scalars(select(Booking).where(Booking.id.in_(seen_booking_ids))).all()
    )
    if not seen_bookings:
        return _fallback_popular_bookings(db, exclude_ids=set(), limit=limit)

    location_counts = Counter(b.location for b in seen_bookings)
    avg_price: Decimal = sum((b.price for b in seen_bookings), Decimal("0")) / len(seen_bookings)

    candidates = list(
        db.scalars(
            select(Booking).where(
                Booking.confirmation_status == ListingStatus.CONFIRMED,
                Booking.id.notin_(seen_booking_ids),
            )
        ).all()
    )

    def score(booking: Booking) -> float:
        location_score = location_counts.get(booking.location, 0) * 10
        price_diff = abs(float(booking.price) - float(avg_price))
        price_score = max(0.0, 5 - (price_diff / max(float(avg_price), 1) * 5))
        return location_score + price_score

    scored = sorted(candidates, key=score, reverse=True)
    top = [b for b in scored if score(b) > 0][:limit]

    if len(top) < limit:
        fallback = _fallback_popular_bookings(
            db, exclude_ids=seen_booking_ids | {b.id for b in top}, limit=limit - len(top)
        )
        top.extend(fallback)

    return top
