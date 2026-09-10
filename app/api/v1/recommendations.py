
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.booking import BookingRead
from app.services.recommendation_service import get_recommendations_for_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", response_model=list[BookingRead])
def recommend_bookings(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_recommendations_for_user(db, current_user.id, limit=limit)
