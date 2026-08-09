from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException,
)
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_current_user, require_role
from backend.app.utils.database import get_db
from backend.app.auth.models import UserModel, UserRole

from backend.app.notifications import controller
from backend.app.notifications.schemas import (
    NotificationMessageResponse,
    NotificationResponse,
)

notification_routes = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)

@notification_routes.get(
    "",
    response_model=list[NotificationResponse],
    status_code=status.HTTP_200_OK,
)
def get_notifications(
    current_user: UserModel = Depends(require_role(UserRole.USER)),
    db: Session = Depends(get_db),
):
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile not found for this account."
        )
    return controller.get_notifications_controller(
        user_id=current_user.profile.id,
        db=db,
    )

@notification_routes.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    status_code=status.HTTP_200_OK,
)
def mark_notification_read(
    notification_id: int,
    current_user: UserModel = Depends(require_role(UserRole.USER)),
    db: Session = Depends(get_db),
):
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile not found for this account."
        )
    return (
        controller
        .mark_notification_read_controller(
            notification_id=notification_id,
            user_id=current_user.profile.id,
            db=db,
        )
    )

@notification_routes.patch(
    "/read-all",
    response_model=NotificationMessageResponse,
    status_code=status.HTTP_200_OK,
)
def mark_all_notifications_read(
    current_user: UserModel = Depends(require_role(UserRole.USER)),
    db: Session = Depends(get_db),
):
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile not found for this account."
        )
    return (
        controller
        .mark_all_notifications_read_controller(
            user_id=current_user.profile.id,
            db=db,
        )
    )