
import math
import uuid
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_manager, get_current_user
from app.core.exceptions import not_found_exception
from app.crud import booking as booking_crud
from app.database import get_db
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingRead, BookingUpdate, Page

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def _get_booking_or_404(db: Session, booking_id: uuid.UUID):
    booking = booking_crud.get_booking(db, booking_id)
    if booking is None:
        raise not_found_exception("Booking")
    return booking


@router.get("", response_model=Page[BookingRead])
def list_bookings(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    location: str | None = Query(default=None, description="Фильтр по местоположению (частичное совпадение)"),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    items, total = booking_crud.list_bookings(
        db,
        page=page,
        page_size=page_size,
        location=location,
        date_from=date_from,
        date_to=date_to,
        min_price=min_price,
        max_price=max_price,
    )
    pages = math.ceil(total / page_size) if total else 0
    return Page(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{booking_id}", response_model=BookingRead)
def get_booking_detail(
    booking_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = _get_booking_or_404(db, booking_id)
    booking_crud.record_view(db, current_user.id, booking.id)
    return booking


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    _manager: User = Depends(get_current_manager),
):
    return booking_crud.create_booking(db, booking_in)


@router.put("/{booking_id}", response_model=BookingRead)
def update_booking(
    booking_id: uuid.UUID,
    booking_in: BookingUpdate,
    db: Session = Depends(get_db),
    _manager: User = Depends(get_current_manager),
):
    booking = _get_booking_or_404(db, booking_id)
    return booking_crud.update_booking(db, booking, booking_in)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: uuid.UUID,
    db: Session = Depends(get_db),
    _manager: User = Depends(get_current_manager),
):
    booking = _get_booking_or_404(db, booking_id)
    booking_crud.delete_booking(db, booking)
