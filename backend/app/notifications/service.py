from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.notifications.ws_manager import notification_manager
from backend.app.notifications.models import (
    Notification,
    NotificationType,
)
from backend.app.notifications.policy import (
    get_threshold_notification,
)
from backend.app.tokens.models import Token
from backend.app.notifications.models import Notification


def get_notifications(
    user_id: int,
    db: Session,
):
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )


def mark_notification_read(
    notification_id: int,
    user_id: int,
    db: Session,
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


def mark_all_notifications_read(
    user_id: int,
    db: Session,
):
    (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .update(
            {
                Notification.is_read: True,
            },
            synchronize_session=False,
        )
    )

    db.commit()

    return {
        "message": "All notifications marked as read."
    }


def get_unread_notification_count(
    user_id: int,
    db: Session,
):
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .count()
    )