from sqlalchemy.exc import IntegrityError

from backend.app.utils.database import LocalSession

from backend.app.notifications.ws_manager import (
    notification_manager,
)
from backend.app.notifications.models import (
    Notification,
    NotificationType,
)


async def create_and_send_notification(
    *,
    user_id: int,
    queue_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
    token_id: int | None = None,
    action: str | None = None,
    threshold: int | None = None,
    db,
):
    notification = Notification(
        user_id=user_id,
        queue_id=queue_id,
        token_id=token_id,
        type=notification_type,
        title=title,
        message=message,
        is_read=False,
        action=action,
        threshold=threshold,
    )

    db.add(notification)

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        # A duplicate threshold notification
        # should not be created.
        if (
            notification_type
            == NotificationType.PEOPLE_AHEAD_THRESHOLD
        ):
            return None

        raise

    db.refresh(notification)

    payload = {
        "id": notification.id,
        "user_id": notification.user_id,
        "queue_id": notification.queue_id,
        "token_id": notification.token_id,
        "type": notification.type.value if hasattr(notification.type, "value") else str(notification.type),
        "title": notification.title,
        "message": notification.message,
        "is_read": notification.is_read,
        "action": notification.action,
        "threshold": notification.threshold,
        "created_at": (
            notification.created_at.isoformat()
            if notification.created_at
            else None
        ),
    }

    await notification_manager.broadcast(
        user_id=user_id,
        data=payload,
    )

    return notification