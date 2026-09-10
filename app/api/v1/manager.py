
import math
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_manager
from app.core.exceptions import not_found_exception
from app.crud import booking as booking_crud
from app.database import get_db
from app.models.booking import ReservationStatus
from app.models.user import User
from app.schemas.booking import Page, ReservationRead, ReservationStatusUpdate

router = APIRouter(prefix="/manager", tags=["Manager"])


@router.get("/reservations", response_model=Page[ReservationRead])
def list_all_reservations(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    _manager: User = Depends(get_current_manager),
):
    items, total = booking_crud.list_all_reservations(db, page, page_size)
    pages = math.ceil(total / page_size) if total else 0
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.patch("/reservations/{reservation_id}/status", response_model=ReservationRead)
def update_reservation_status(
    reservation_id: uuid.UUID,
    payload: ReservationStatusUpdate,
    db: Session = Depends(get_db),
    _manager: User = Depends(get_current_manager),
):
    reservation = booking_crud.get_reservation(db, reservation_id)
    if reservation is None:
        raise not_found_exception("Reservation")
    return booking_crud.update_reservation_status(db, reservation, payload.status)


@router.get("/stats")
def manager_stats(
    db: Session = Depends(get_db),
    _manager: User = Depends(get_current_manager),
):
    _, total_reservations = booking_crud.list_all_reservations(db, page=1, page_size=1)
    _, total_bookings = booking_crud.list_bookings(db, page=1, page_size=1)

    all_reservations, _ = booking_crud.list_all_reservations(db, page=1, page_size=10_000)
    confirmed = sum(
        1 for reservation in all_reservations if reservation.status == ReservationStatus.CONFIRMED
    )

    return {
        "total_bookings": total_bookings,
        "total_reservations": total_reservations,
        "confirmed_reservations": confirmed,
    }
