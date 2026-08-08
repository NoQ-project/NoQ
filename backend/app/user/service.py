from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.notifications.models import Notification
from backend.app.tokens.models import Token, TokenStatus
from backend.app.queues.models import Queue
from backend.app.user.models import User


def get_dashboard(
    db: Session,
    current_user,
):
    user_id = current_user.profile.id

    active_tokens = (
        db.query(Token)
        .join(Queue, Token.queue_id == Queue.id)
        .filter(
            Token.user_id == user_id,
            Token.status.in_([
                TokenStatus.WAITING,
                TokenStatus.SERVING,
            ]),
        )
        .order_by(
            Token.booking_date.desc(),
            Token.token_number.asc(),
        )
        .all()
    )

    booking_history = (
        db.query(Token)
        .join(Queue, Token.queue_id == Queue.id)
        .filter(
            Token.user_id == user_id,
            Token.status.in_([
                TokenStatus.COMPLETED,
                TokenStatus.MISSED,
                TokenStatus.CANCELLED,
            ]),
        )
        .order_by(
            Token.booking_date.desc(),
            Token.token_number.desc(),
        )
        .all()
    )

    unread_notifications = (
        db.query(func.count(Notification.id))
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .scalar()
    )

    return {
        "active_tokens": [
            {
                "token_id": token.id,
                "token_number": token.token_number,
                "status": token.status.value,
                "queue_id": token.queue.id,
                "queue_name": token.queue.name,
                "booking_date": token.booking_date,
            }
            for token in active_tokens
        ],
        "booking_history": [
            {
                "token_id": token.id,
                "token_number": token.token_number,
                "status": token.status.value,
                "queue_id": token.queue.id,
                "queue_name": token.queue.name,
                "booking_date": token.booking_date,
            }
            for token in booking_history
        ],
        "unread_notifications": unread_notifications or 0,
    }