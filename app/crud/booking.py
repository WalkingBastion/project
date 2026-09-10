
import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.booking import Booking, Reservation, ViewHistory
from app.schemas.booking import BookingCreate, BookingUpdate


def get_booking(db: Session, booking_id: uuid.UUID) -> Booking | None:
    return db.get(Booking, booking_id)


def list_bookings(
    db: Session,
    page: int,
    page_size: int,
    location: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
) -> tuple[list[Booking], int]:
    query = select(Booking)

    if location:
        query = query.where(Booking.location.ilike(f"%{location}%"))
    if date_from:
        query = query.where(Booking.date >= date_from)
    if date_to:
        query = query.where(Booking.date <= date_to)
    if min_price is not None:
        query = query.where(Booking.price >= min_price)
    if max_price is not None:
        query = query.where(Booking.price <= max_price)

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    query = query.order_by(Booking.date.asc()).offset((page - 1) * page_size).limit(page_size)
    items = list(db.scalars(query).all())
    return items, total


def create_booking(db: Session, booking_in: BookingCreate) -> Booking:
    booking = Booking(**booking_in.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def update_booking(db: Session, booking: Booking, booking_in: BookingUpdate) -> Booking:
    update_data = booking_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def delete_booking(db: Session, booking: Booking) -> None:
    db.delete(booking)
    db.commit()


def record_view(db: Session, user_id: uuid.UUID, booking_id: uuid.UUID) -> None:
    db.add(ViewHistory(user_id=user_id, booking_id=booking_id))
    db.commit()


def get_user_view_history(db: Session, user_id: uuid.UUID, limit: int = 50) -> list[ViewHistory]:
    query = (
        select(ViewHistory)
        .where(ViewHistory.user_id == user_id)
        .order_by(ViewHistory.viewed_at.desc())
        .limit(limit)
    )
    return list(db.scalars(query).all())


def create_reservation(
    db: Session, user_id: uuid.UUID, booking: Booking, guests: int
) -> Reservation:
    reservation = Reservation(
        user_id=user_id,
        booking_id=booking.id,
        guests=guests,
        total_price=booking.price * guests,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def get_reservation(db: Session, reservation_id: uuid.UUID) -> Reservation | None:
    return db.get(Reservation, reservation_id)


def list_user_reservations(
    db: Session, user_id: uuid.UUID, page: int, page_size: int
) -> tuple[list[Reservation], int]:
    base = select(Reservation).where(Reservation.user_id == user_id)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    query = base.order_by(Reservation.created_at.desc()).offset((page - 1) * page_size).limit(
        page_size
    )
    items = list(db.scalars(query).all())
    return items, total


def list_all_reservations(
    db: Session, page: int, page_size: int
) -> tuple[list[Reservation], int]:
    base = select(Reservation)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    query = base.order_by(Reservation.created_at.desc()).offset((page - 1) * page_size).limit(
        page_size
    )
    items = list(db.scalars(query).all())
    return items, total


def update_reservation_status(db: Session, reservation: Reservation, status) -> Reservation:
    reservation.status = status
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def delete_reservation(db: Session, reservation: Reservation) -> None:
    db.delete(reservation)
    db.commit()
