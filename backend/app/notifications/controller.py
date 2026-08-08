from sqlalchemy.orm import Session

from backend.app.notifications import service


def get_notifications_controller(
    user_id: int,
    db: Session,
):
    return service.get_notifications(
        user_id=user_id,
        db=db,
    )


def mark_notification_read_controller(
    notification_id: int,
    user_id: int,
    db: Session,
):
    return service.mark_notification_read(
        notification_id=notification_id,
        user_id=user_id,
        db=db,
    )


def mark_all_notifications_read_controller(
    user_id: int,
    db: Session,
):
    return service.mark_all_notifications_read(
        user_id=user_id,
        db=db,
    )