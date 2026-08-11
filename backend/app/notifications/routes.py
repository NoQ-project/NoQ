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

from backend.app.user.models import User as UserProfile

def get_profile_id(user: UserModel, db: Session) -> int:
    if user.profile:
        return user.profile.id
    profile = UserProfile(auth_user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile.id

@notification_routes.get(
    "",
    response_model=list[NotificationResponse],
    status_code=status.HTTP_200_OK,
)
def get_notifications(
    current_user: UserModel = Depends(require_role(UserRole.USER)),
    db: Session = Depends(get_db),
):
    profile_id = get_profile_id(current_user, db)
    return controller.get_notifications_controller(
        user_id=profile_id,
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
    profile_id = get_profile_id(current_user, db)
    return (
        controller
        .mark_notification_read_controller(
            notification_id=notification_id,
            user_id=profile_id,
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
    profile_id = get_profile_id(current_user, db)
    return (
        controller
        .mark_all_notifications_read_controller(
            user_id=profile_id,
            db=db,
        )
    )