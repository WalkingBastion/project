
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

from app.models.booking import ListingStatus, ReservationStatus

T = TypeVar("T")


class BookingBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    date: date
    location: str = Field(min_length=1, max_length=200)
    price: Decimal = Field(gt=0, decimal_places=2)
    description: str | None = Field(default="", max_length=5000)


class BookingCreate(BookingBase):
    confirmation_status: ListingStatus = ListingStatus.CONFIRMED


class BookingUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    date: date | None = None
    location: str | None = Field(default=None, min_length=1, max_length=200)
    price: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    description: str | None = Field(default=None, max_length=5000)
    confirmation_status: ListingStatus | None = None


class BookingRead(BookingBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    confirmation_status: ListingStatus
    created_at: datetime
    updated_at: datetime


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


class ReservationCreate(BaseModel):
    booking_id: uuid.UUID
    guests: int = Field(default=1, ge=1, le=20)


class ReservationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    booking_id: uuid.UUID
    status: ReservationStatus
    guests: int
    total_price: Decimal
    created_at: datetime
    booking: BookingRead


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatus
