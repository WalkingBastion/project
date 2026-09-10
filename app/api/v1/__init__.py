
from fastapi import APIRouter

from app.api.v1 import auth, bookings, manager, recommendations, reservations

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(bookings.router)
api_router.include_router(reservations.router)
api_router.include_router(recommendations.router)
api_router.include_router(manager.router)
