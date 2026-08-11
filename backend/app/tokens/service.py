from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

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

    day_of_week = booking_date.weekday()
    working_hour = (
        db.query(QueueWorkingHour)
        .filter(
            QueueWorkingHour.queue_id == queue_id,
            QueueWorkingHour.day_of_week == day_of_week,
        )
        .first()
    )

    if working_hour:
        from datetime import time
        opening_datetime = datetime.combine(booking_date, working_hour.opening_time)
    else:
        from datetime import time
        opening_datetime = datetime.combine(booking_date, time(9, 0))

    service_time = get_effective_service_time(
        queue_id=queue_id,
        booking_date=booking_date,
        db=db,
    )

    active_tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.booking_date == booking_date,
            Token.status.in_([TokenStatus.WAITING, TokenStatus.SERVING]),
        )
        .order_by(Token.token_number.asc())
        .all()
    )

    for index, token in enumerate(active_tokens):
        token.estimated_time = (
            opening_datetime
            + timedelta(
                minutes=index * service_time
            )
        )

    db.flush()


def book_token(
    queue_id: int,
    user_id: int,
    booking_date,
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
        
        if booking_date is None:
            booking_date = current_date
            
        if booking_date < current_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot book a token for a past date.",
            )

        day_of_week = booking_date.weekday()

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
                detail="Queue is not available on this date.",
            )

        if booking_date == current_date:
            current_time_only = current_time.time()
            if current_time_only > working_hour.closing_time:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Today's operating hours have ended for this queue. Please book for tomorrow or a future date.",
                )

        active_token = (
            db.query(Token)
            .filter(
                Token.user_id == user_id,
                Token.queue_id == queue.id,
                Token.booking_date == booking_date,
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
                detail="You already have an active token for this queue on this date.",
            )

        today_count = (
            db.query(Token)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == booking_date,
            )
            .count()
        )

        if today_count >= queue.daily_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is full for this date.",
            )

        last_token = (
            db.query(Token.token_number)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == booking_date,
            )
            .order_by(Token.token_number.desc())
            .first()
        )

        token_number = (
            last_token[0] + 1
            if last_token
            else 1
        )

        day_of_week = booking_date.weekday()
        working_hour = (
            db.query(QueueWorkingHour)
            .filter(
                QueueWorkingHour.queue_id == queue.id,
                QueueWorkingHour.day_of_week == day_of_week,
            )
            .first()
        )
        if working_hour:
            from datetime import time
            opening_datetime = datetime.combine(booking_date, working_hour.opening_time)
        else:
            from datetime import time
            opening_datetime = datetime.combine(booking_date, time(9, 0))

        people_ahead = (
            db.query(Token)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == booking_date,
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
            opening_datetime
            + timedelta(
                minutes=(
                    people_ahead
                    * queue.avg_service_time
                )
            )
        )

        new_token = Token(
            queue_id=queue.id,
            user_id=user_id,
            token_number=token_number,
            booking_date=booking_date,
            estimated_time=estimated_time,
            status=TokenStatus.WAITING,
        )

        db.add(new_token)

        # Send INSERT to DB without committing.
        db.flush()

        update_waiting_token_estimates(
            queue_id=queue.id,
            booking_date=booking_date,
            db=db,
            start_time=current_time,
        )

        # Commit booking + estimate updates together.
        db.commit()

        db.refresh(new_token)

        # Re-fetch with queue loaded so queue_name @property works in Pydantic serialization
        new_token = (
            db.query(Token)
            .options(joinedload(Token.queue))
            .filter(Token.id == new_token.id)
            .first()
        )

        schedule_queue_updates(
            queue_id=queue.id,
            booking_date=booking_date,
            db=db,
        )

        schedule_notification(
            token_id=new_token.id,
            notification_type=NotificationType.TOKEN_BOOKED,
        )

        return new_token

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
            detail="Failed to book token.",
        )

def get_my_tokens(
    user_id: int,
    db: Session,
):
    return (
        db.query(Token)
        .options(joinedload(Token.queue))
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
        .options(joinedload(Token.queue))
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
            .options(joinedload(Token.queue))
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

        # Re-fetch with queue loaded so queue_name @property works in Pydantic serialization
        token = (
            db.query(Token)
            .options(joinedload(Token.queue))
            .filter(Token.id == token.id)
            .first()
        )

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

    if token.status not in [TokenStatus.WAITING, TokenStatus.SERVING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is not in waiting or serving state.",
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

    if token.status == TokenStatus.SERVING:
        return {
            "token_number": token.token_number,
            "waiting_position": 0,
            "estimated_waiting_time": 0,
            "estimated_service_time": token.estimated_time,
        }

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
                .first()
            )

            if not current_token or current_token.status != TokenStatus.SERVING:
                queue.current_serving_token_id = None
                current_token = None

        next_token = (
            db.query(Token)
            .filter(
                Token.queue_id == queue.id,
                Token.status == TokenStatus.WAITING,
            )
            .order_by(
                Token.booking_date.asc(),
                Token.token_number.asc(),
            )
            .first()
        )

        if not current_token and not next_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active or waiting tokens found for this queue.",
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
                current_token = (
                    db.query(Token)
                    .options(joinedload(Token.queue))
                    .filter(Token.id == current_token.id)
                    .first()
                )

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
            current_token = (
                db.query(Token)
                .options(joinedload(Token.queue))
                .filter(Token.id == current_token.id)
                .first()
            )

        db.refresh(next_token)
        next_token = (
            db.query(Token)
            .options(joinedload(Token.queue))
            .filter(Token.id == next_token.id)
            .first()
        )

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


def close_day(
    queue_id: int,
    db: Session,
):
    """Cancel all remaining WAITING tokens for today, notify users, reset serving state."""
    from datetime import date as date_type
    today = datetime.now().date()

    # Cancel currently serving token too if any
    queue = db.query(Queue).filter(Queue.id == queue_id).first()
    if not queue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue not found.",
        )

    waiting_tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.booking_date == today,
            Token.status == TokenStatus.WAITING,
        )
        .all()
    )

    cancelled_count = 0
    for token in waiting_tokens:
        token.status = TokenStatus.CANCELLED
        token.cancelled_at = datetime.now()
        db.flush()
        schedule_notification(
            token_id=token.id,
            notification_type=NotificationType.TOKEN_CANCELLED,
        )
        cancelled_count += 1

    # Reset the queue's current serving pointer
    queue.current_serving_token_id = None

    db.commit()

    return {
        "message": f"Day closed. {cancelled_count} waiting token(s) cancelled.",
        "cancelled_count": cancelled_count,
    }