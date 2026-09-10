
import math
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import bad_request_exception, forbidden_exception, not_found_exception
from app.crud import booking as booking_crud
from app.database import get_db
from app.models.booking import ListingStatus, ReservationStatus
from app.models.user import User
from app.schemas.booking import Page, ReservationCreate, ReservationRead

router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.post("", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
def create_reservation(
    payload: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = booking_crud.get_booking(db, payload.booking_id)
    if booking is None:
        raise not_found_exception("Booking")
    if booking.confirmation_status != ListingStatus.CONFIRMED:
        raise bad_request_exception("Это бронирование в данный момент недоступно.")

    return booking_crud.create_reservation(db, current_user.id, booking, payload.guests)


@router.get("", response_model=Page[ReservationRead])
def list_my_reservations(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = booking_crud.list_user_reservations(db, current_user.id, page, page_size)
    pages = math.ceil(total / page_size) if total else 0
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{reservation_id}", response_model=ReservationRead)
def get_reservation_detail(
    reservation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = booking_crud.get_reservation(db, reservation_id)
    if reservation is None:
        raise not_found_exception("Reservation")
    if reservation.user_id != current_user.id:
        raise forbidden_exception()
    return reservation


@router.post("/{reservation_id}/confirm", response_model=ReservationRead)
def confirm_reservation(
    reservation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = booking_crud.get_reservation(db, reservation_id)
    if reservation is None:
        raise not_found_exception("Reservation")
    if reservation.user_id != current_user.id:
        raise forbidden_exception()
    if reservation.status != ReservationStatus.PENDING:
        raise bad_request_exception("Подтвердить можно только ожидающие подтверждения бронирования.")

    return booking_crud.update_reservation_status(db, reservation, ReservationStatus.CONFIRMED)


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_reservation(
    reservation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = booking_crud.get_reservation(db, reservation_id)
    if reservation is None:
        raise not_found_exception("Reservation")
    if reservation.user_id != current_user.id:
        raise forbidden_exception()

    booking_crud.update_reservation_status(db, reservation, ReservationStatus.CANCELLED)
