import asyncio
from datetime import date

from backend.app.utils.database import LocalSession

from backend.app.notifications.models import (
    NotificationType,
)
from backend.app.notifications.policy import (
    get_threshold_notification,
)
from backend.app.notifications.sender import (
    create_and_send_notification,
)

from backend.app.tokens.models import (
    Token,
    TokenStatus,
)


# ---------------------------------------------------------
# Single-token notifications
# ---------------------------------------------------------


def schedule_notification(
    token_id: int,
    notification_type: NotificationType,
):
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(
            process_notification(
                token_id=token_id,
                notification_type=notification_type,
            )
        )
    except RuntimeError:
        return


async def process_notification(
    token_id: int,
    notification_type: NotificationType,
):
    db = LocalSession()

    try:
        token = (
            db.query(Token)
            .filter(
                Token.id == token_id
            )
            .first()
        )

        if not token:
            return

        queue = token.queue

        if not queue:
            return

        if notification_type == NotificationType.YOUR_TURN:

            await create_and_send_notification(
                user_id=token.user_id,
                queue_id=token.queue_id,
                token_id=token.id,
                notification_type=notification_type,
                title="Your turn",
                message=(
                    f"It is now your turn at "
                    f"{queue.name}."
                ),
                db=db,
            )

        elif (
            notification_type
            == NotificationType.TOKEN_COMPLETED
        ):

            await create_and_send_notification(
                user_id=token.user_id,
                queue_id=token.queue_id,
                token_id=token.id,
                notification_type=notification_type,
                title="Token completed",
                message=(
                    f"Your token at "
                    f"{queue.name} has been completed."
                ),
                db=db,
            )

        elif (
            notification_type
            == NotificationType.TOKEN_MISSED
        ):

            await create_and_send_notification(
                user_id=token.user_id,
                queue_id=token.queue_id,
                token_id=token.id,
                notification_type=notification_type,
                title="Token missed",
                message=(
                    f"Your token at "
                    f"{queue.name} was missed."
                ),
                action="REAPPLY",
                db=db,
            )

        elif (
            notification_type
            == NotificationType.TOKEN_CANCELLED
        ):

            await create_and_send_notification(
                user_id=token.user_id,
                queue_id=token.queue_id,
                token_id=token.id,
                notification_type=notification_type,
                title="Token cancelled",
                message=(
                    f"Your token at "
                    f"{queue.name} has been cancelled."
                ),
                db=db,
            )

        elif (
            notification_type
            == NotificationType.QUEUE_PAUSED
        ):

            reason = queue.pause_reason or (
                "No reason provided."
            )

            await create_and_send_notification(
                user_id=token.user_id,
                queue_id=token.queue_id,
                token_id=token.id,
                notification_type=notification_type,
                title="Queue paused",
                message=(
                    f"{queue.name} has been paused. "
                    f"Reason: {reason}"
                ),
                db=db,
            )

        elif (
            notification_type
            == NotificationType.QUEUE_RESUMED
        ):

            await create_and_send_notification(
                user_id=token.user_id,
                queue_id=token.queue_id,
                token_id=token.id,
                notification_type=notification_type,
                title="Queue resumed",
                message=(
                    f"{queue.name} has resumed."
                ),
                db=db,
            )

    finally:
        db.close()


# ---------------------------------------------------------
# Queue-wide notifications
# ---------------------------------------------------------


def schedule_queue_notification(
    queue_id: int,
    booking_date: date,
    notification_type: NotificationType,
    db,
):
    tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.booking_date == booking_date,
            Token.status.in_(
                [
                    TokenStatus.WAITING,
                    TokenStatus.SERVING,
                ]
            ),
        )
        .all()
    )

    for token in tokens:
        schedule_notification(
            token_id=token.id,
            notification_type=notification_type,
        )


# ---------------------------------------------------------
# Threshold notifications
# ---------------------------------------------------------


def schedule_threshold_notification(
    token_id: int,
    threshold: int,
):
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(
            process_threshold_notification(
                token_id=token_id,
                threshold=threshold,
            )
        )
    except RuntimeError:
        return


async def process_threshold_notification(
    token_id: int,
    threshold: int,
):
    db = LocalSession()

    try:
        token = (
            db.query(Token)
            .filter(
                Token.id == token_id,
                Token.status == TokenStatus.WAITING,
            )
            .first()
        )

        if not token:
            return

        from app.tracking.service import (
            get_token_tracking,
        )

        tracking = get_token_tracking(
            token_id=token.id,
            user_id=token.user_id,
            db=db,
        )

        people_ahead = tracking["people_ahead"]

        if people_ahead != threshold:
            return

        notification_data = (
            get_threshold_notification(
                people_ahead
            )
        )

        if not notification_data:
            return

        queue = token.queue

        if not queue:
            return

        await create_and_send_notification(
            user_id=token.user_id,
            queue_id=token.queue_id,
            token_id=token.id,
            notification_type=(
                notification_data["type"]
            ),
            title=notification_data["title"],
            message=(
                f"{notification_data['message']} "
                f"Queue: {queue.name}."
            ),
            threshold=(
                notification_data["threshold"]
            ),
            db=db,
        )

    finally:
        db.close()


def schedule_queue_threshold_notifications(
    queue_id: int,
    booking_date: date,
    db,
):
    tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.booking_date == booking_date,
            Token.status == TokenStatus.WAITING,
        )
        .all()
    )

    from app.tracking.service import (
        get_token_tracking,
    )

    for token in tokens:

        tracking = get_token_tracking(
            token_id=token.id,
            user_id=token.user_id,
            db=db,
        )

        people_ahead = tracking["people_ahead"]

        notification_data = (
            get_threshold_notification(
                people_ahead
            )
        )

        if not notification_data:
            continue

        schedule_threshold_notification(
            token_id=token.id,
            threshold=people_ahead,
        )