from fastapi import (
    APIRouter,
    Depends,
    status,
)
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_current_user
from backend.app.utils.database import get_db
from backend.app.auth.models import UserModel

from app.notifications import controller
from app.notifications.schemas import (
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
    current_user: UserModel = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
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
    current_user: UserModel = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
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
    current_user: UserModel = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    return (
        controller
        .mark_all_notifications_read_controller(
            user_id=current_user.profile.id,
            db=db,
        )
    )