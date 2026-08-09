from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.tokens.models import Token, TokenStatus
from backend.app.queues.models import (
    Queue,
    QueueStatus,
    QueueWorkingHour,
)

from backend.app.tracking.events import (
    schedule_token_update,
    schedule_queue_updates,
)

from backend.app.notifications.scheduler import (
    schedule_notification,
    schedule_threshold_notification,
    schedule_queue_threshold_notifications,
)

from backend.app.notifications.models import NotificationType


def get_effective_service_time(
    queue_id: int,
    booking_date,
    db: Session,
):
    completed_tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.booking_date == booking_date,
            Token.status == TokenStatus.COMPLETED,
            Token.started_at.isnot(None),
            Token.completed_at.isnot(None),
        )
        .all()
    )

    if not completed_tokens:
        queue = (
            db.query(Queue)
            .filter(Queue.id == queue_id)
            .first()
        )

        return queue.avg_service_time if queue else 10

    total_seconds = sum(
        (
            token.completed_at - token.started_at
        ).total_seconds()
        for token in completed_tokens
    )

    average_minutes = (
        total_seconds / 60 / len(completed_tokens)
    )

    return max(1, round(average_minutes))


def update_waiting_token_estimates(
    queue_id: int,
    booking_date,
    db: Session,
    start_time: datetime | None = None,
):
    queue = (
        db.query(Queue)
        .filter(Queue.id == queue_id)
        .first()
    )

    if not queue:
        return

    if start_time is None:
        start_time = datetime.now()

    service_time = get_effective_service_time(
        queue_id=queue_id,
        booking_date=booking_date,
        db=db,
    )

    waiting_tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.booking_date == booking_date,
            Token.status == TokenStatus.WAITING,
        )
        .order_by(Token.token_number.asc())
        .all()
    )

    current_serving_token = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.booking_date == booking_date,
            Token.status == TokenStatus.SERVING,
        )
        .first()
    )

    waiting_offset = 1 if current_serving_token else 0

    for index, token in enumerate(waiting_tokens):
        position = index + waiting_offset

        token.estimated_time = (
            start_time
            + timedelta(
                minutes=position * service_time
            )
        )

    db.flush()


def book_token(
    queue_id: int,
    user_id: int,
    db: Session,
):
    try:
        queue = (
            db.query(Queue)
            .filter(
                Queue.id == queue_id,
                Queue.is_active.is_(True),
            )
            .with_for_update()
            .first()
        )

        if not queue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Queue not found.",
            )

        if queue.status == QueueStatus.PAUSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Queue is currently paused. "
                    f"Reason: "
                    f"{queue.pause_reason or 'No reason provided.'}"
                ),
            )

        if queue.status != QueueStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is currently closed.",
            )

        current_time = datetime.now()
        current_date = current_time.date()
        day_of_week = current_date.weekday()

        working_hour = (
            db.query(QueueWorkingHour)
            .filter(
                QueueWorkingHour.queue_id == queue.id,
                QueueWorkingHour.day_of_week == day_of_week,
            )
            .first()
        )

        if not working_hour:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is not available today.",
            )

        current_time_only = current_time.time()

        if not (
            working_hour.opening_time
            <= current_time_only
            <= working_hour.closing_time
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is currently outside its working hours.",
            )

        active_token = (
            db.query(Token)
            .filter(
                Token.user_id == user_id,
                Token.queue_id == queue.id,
                Token.booking_date == current_date,
                Token.status.in_(
                    [
                        TokenStatus.WAITING,
                        TokenStatus.SERVING,
                    ]
                ),
            )
            .first()
        )

        if active_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active token for this queue.",
            )

        today_count = (
            db.query(Token)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == current_date,
            )
            .count()
        )

        if today_count >= queue.daily_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is full for today.",
            )

        last_token = (
            db.query(Token.token_number)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == current_date,
            )
            .order_by(Token.token_number.desc())
            .first()
        )

        token_number = (
            last_token[0] + 1
            if last_token
            else 1
        )

        people_ahead = (
            db.query(Token)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == current_date,
                Token.status.in_(
                    [
                        TokenStatus.WAITING,
                        TokenStatus.SERVING,
                    ]
                ),
            )
            .count()
        )

        estimated_time = (
            current_time
            + timedelta(
                minutes=(
                    people_ahead
                    * queue.avg_service_time
                )
            )
        )

        token = Token(
            user_id=user_id,
            queue_id=queue.id,
            token_number=token_number,
            status=TokenStatus.WAITING,
            booking_date=current_date,
            estimated_time=estimated_time,
        )

        db.add(token)

        db.commit()

        db.refresh(token)

        update_waiting_token_estimates(
            queue_id=queue.id,
            booking_date=current_date,
            db=db,
            start_time=current_time,
        )

        db.commit()

        schedule_queue_updates(
            queue_id=queue.id,
            booking_date=current_date,
            db=db,
        )

        db.refresh(token)

        return token

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        print(
            "BOOK TOKEN ERROR:",
            repr(e),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


def get_my_tokens(
    user_id: int,
    db: Session,
):
    return (
        db.query(Token)
        .filter(
            Token.user_id == user_id,
        )
        .order_by(
            Token.created_at.desc(),
        )
        .all()
    )


def get_token_by_id(
    token_id: int,
    user_id: int,
    db: Session,
):
    token = (
        db.query(Token)
        .filter(
            Token.id == token_id,
            Token.user_id == user_id,
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found.",
        )

    return token


def cancel_token(
    queue_id: int,
    token_id: int,
    user_id: int,
    db: Session,
):
    try:
        token = (
            db.query(Token)
            .filter(
                Token.id == token_id,
                Token.user_id == user_id,
                Token.queue_id == queue_id,
            )
            .first()
        )

        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token not found.",
            )

        if token.status != TokenStatus.WAITING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only waiting tokens can be cancelled.",
            )

        queue = (
            db.query(Queue)
            .filter(
                Queue.id == queue_id,
                Queue.is_active.is_(True),
            )
            .with_for_update()
            .first()
        )

        if not queue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Queue not found.",
            )

        current_date = token.booking_date

        token.status = TokenStatus.CANCELLED
        token.cancelled_at = datetime.now()

        update_waiting_token_estimates(
            queue_id=queue_id,
            booking_date=current_date,
            db=db,
            start_time=datetime.now(),
        )

        db.commit()

        schedule_token_update(token.id)

        schedule_notification(
            token_id=token.id,
            notification_type=NotificationType.TOKEN_CANCELLED,
        )

        schedule_queue_updates(
            queue_id=queue_id,
            booking_date=current_date,
            db=db,
        )

        db.refresh(token)

        return token

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        print(
            "CANCEL TOKEN ERROR:",
            repr(e),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


def get_waiting_position(
    token_id: int,
    user_id: int,
    db: Session,
):
    token = (
        db.query(Token)
        .filter(
            Token.id == token_id,
            Token.user_id == user_id,
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found.",
        )

    if token.status != TokenStatus.WAITING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is not in waiting state.",
        )

    queue = (
        db.query(Queue)
        .filter(
            Queue.id == token.queue_id,
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue not found.",
        )

    waiting_count = (
        db.query(Token)
        .filter(
            Token.queue_id == token.queue_id,
            Token.booking_date == token.booking_date,
            Token.status == TokenStatus.WAITING,
            Token.token_number < token.token_number,
        )
        .count()
    )

    serving_token = (
        db.query(Token)
        .filter(
            Token.queue_id == token.queue_id,
            Token.booking_date == token.booking_date,
            Token.status == TokenStatus.SERVING,
        )
        .first()
    )

    waiting_position = waiting_count + 1

    estimated_waiting_time = (
        waiting_count
        + (1 if serving_token else 0)
    ) * queue.avg_service_time

    return {
        "token_number": token.token_number,
        "waiting_position": waiting_position,
        "estimated_waiting_time": estimated_waiting_time,
        "estimated_service_time": token.estimated_time,
    }


def advance_queue(
    queue_id: int,
    result: TokenStatus,
    db: Session,
):
    if result not in (
        TokenStatus.COMPLETED,
        TokenStatus.MISSED,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Result must be COMPLETED or MISSED.",
        )

    try:
        queue = (
            db.query(Queue)
            .filter(
                Queue.id == queue_id,
                Queue.is_active.is_(True),
            )
            .with_for_update()
            .first()
        )

        if not queue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Queue not found.",
            )

        if queue.status == QueueStatus.PAUSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Queue is currently paused. "
                    f"Reason: "
                    f"{queue.pause_reason or 'No reason provided.'}"
                ),
            )

        if queue.status != QueueStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is currently closed.",
            )

        current_time = datetime.now()
        current_date = current_time.date()

        current_token = None

        if queue.current_serving_token_id is not None:
            current_token = (
                db.query(Token)
                .filter(
                    Token.id == queue.current_serving_token_id,
                    Token.queue_id == queue.id,
                )
                .with_for_update()
                .first()
            )

            if not current_token:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Queue state is inconsistent.",
                )

            if current_token.status != TokenStatus.SERVING:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Current serving token is not in SERVING state.",
                )

        next_token = (
            db.query(Token)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == current_date,
                Token.status == TokenStatus.WAITING,
            )
            .order_by(
                Token.token_number.asc(),
            )
            .with_for_update()
            .first()
        )

        if current_token:
            current_token.status = result

            if result == TokenStatus.COMPLETED:
                current_token.completed_at = current_time

            elif result == TokenStatus.MISSED:
                current_token.missed_at = current_time

        if not next_token:
            queue.current_serving_token_id = None

            db.commit()

            if current_token:
                schedule_token_update(
                    current_token.id
                )

                if result == TokenStatus.COMPLETED:
                    schedule_notification(
                        token_id=current_token.id,
                        notification_type=NotificationType.TOKEN_COMPLETED,
                    )

                elif result == TokenStatus.MISSED:
                    schedule_notification(
                        token_id=current_token.id,
                        notification_type=NotificationType.TOKEN_MISSED,
                    )

                db.refresh(current_token)

            return {
                "message": (
                    "Current token completed. "
                    "No waiting tokens remain."
                ),
                "completed_token": current_token,
                "serving_token": None,
            }

        next_token.status = TokenStatus.SERVING
        next_token.started_at = current_time
        next_token.estimated_time = current_time

        queue.current_serving_token_id = next_token.id

        update_waiting_token_estimates(
            queue_id=queue.id,
            booking_date=current_date,
            db=db,
            start_time=current_time,
        )

        db.commit()

        schedule_queue_updates(
            queue_id=queue.id,
            booking_date=current_date,
            db=db,
        )

        if current_token:
            schedule_token_update(
                current_token.id
            )

            if result == TokenStatus.COMPLETED:
                schedule_notification(
                    token_id=current_token.id,
                    notification_type=NotificationType.TOKEN_COMPLETED,
                )

            elif result == TokenStatus.MISSED:
                schedule_notification(
                    token_id=current_token.id,
                    notification_type=NotificationType.TOKEN_MISSED,
                )

        schedule_notification(
            token_id=next_token.id,
            notification_type=NotificationType.YOUR_TURN,
        )

        # Queue ko waiting tokens ko threshold notification
        # schedule गर्ने सही function
        schedule_queue_threshold_notifications(
            queue_id=queue.id,
            booking_date=current_date,
            db=db,
        )

        if current_token:
            db.refresh(current_token)

        db.refresh(next_token)

        return {
            "message": "Queue advanced successfully.",
            "completed_token": current_token,
            "serving_token": next_token,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        print(
            "ADVANCE QUEUE ERROR:",
            repr(e),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to advance queue: {str(e)}",
        )


def get_current_token(
    queue_id: int,
    db: Session,
):
    token = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.status == TokenStatus.SERVING,
        )
        .order_by(
            Token.token_number.asc(),
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No current token found.",
        )

    return token


def get_waiting_tokens(
    queue_id: int,
    db: Session,
):
    tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.status == TokenStatus.WAITING,
        )
        .order_by(
            Token.token_number.asc(),
        )
        .all()
    )

    return tokens