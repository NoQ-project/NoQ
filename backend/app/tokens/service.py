from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.tokens.models import (
    Token,
    TokenStatus
)
from backend.app.queues.models import Queue, QueueStatus, QueueWorkingHour
from backend.app.tracking.events import schedule_token_update, schedule_queue_updates
from backend.app.notifications.scheduler import (
    schedule_notification,
    schedule_threshold_notification,
)
from backend.app.notifications.models import (
    NotificationType,
)

def book_token(
    queue_id: int,
    user_id: int,
    db: Session
):
    try:
        queue = (
            db.query(Queue)
            .filter(
                Queue.id == queue_id,
                Queue.is_active.is_(True)
            )
            .with_for_update()
            .first()
        )
        if not queue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Queue not found."
            )
        if queue.status == QueueStatus.PAUSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Queue is currently paused. "
                    f"Reason: "
                    f"{queue.pause_reason or 'No reason provided.'}"
                )
            )
        if queue.status != QueueStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is currently closed."
            )
        current_time = datetime.now()
        current_date = current_time.date()
        day_of_week = current_date.weekday()
        working_hour = (
            db.query(QueueWorkingHour)
            .filter(
                QueueWorkingHour.queue_id == queue.id,
                QueueWorkingHour.day_of_week == day_of_week
            )
            .first()
        )
        if not working_hour:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is not available today."
            )
        current_time_only = current_time.time()
        if not (
            working_hour.opening_time
            <= current_time_only
            <= working_hour.closing_time
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is currently outside its working hours."
            )
        active_token = (
            db.query(Token)
            .filter(
                Token.user_id == user_id,
                Token.queue_id == queue.id,
                Token.booking_date == current_date,
                Token.status.in_([
                    TokenStatus.WAITING,
                    TokenStatus.SERVING
                ])
            )
            .first()
        )
        if active_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active token for this queue."
            )
        today_count = (
            db.query(Token)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == current_date
            )
            .count()
        )
        if today_count >= queue.daily_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is full for today."
            )
        last_token = (
            db.query(Token.token_number)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == current_date
            )
            .order_by(
                Token.token_number.desc()
            )
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
                Token.status.in_([
                    TokenStatus.WAITING,
                    TokenStatus.SERVING
                ])
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
            estimated_time=estimated_time
        )
        db.add(token)
        db.commit()
        schedule_queue_updates(
            queue_id=queue.id,
            booking_date=current_date,
            db=db
        )
        db.refresh(token)
        return token
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to book token."
        )
    
def get_my_tokens(
    user_id: int,
    db: Session
):

    return (
        db.query(Token)
        .filter(
            Token.user_id == user_id
        )
        .order_by(
            Token.created_at.desc()
        )
        .all()
    )


def get_token_by_id(
    token_id: int,
    user_id: int,
    db: Session
):

    token = (
        db.query(Token)
        .filter(
            Token.id == token_id,
            Token.user_id == user_id
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found."
        )

    return token


def cancel_token(
    queue_id: int,
    token_id: int,
    user_id: int,
    db: Session
):

    token = (
        db.query(Token)
        .filter(
            Token.id == token_id,
            Token.user_id == user_id
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found."
        )

    if token.status != TokenStatus.WAITING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only waiting tokens can be cancelled."
        )
    queue = (
            db.query(Queue)
            .filter(
                Queue.id == queue_id,
                Queue.is_active.is_(True)
            )
            .with_for_update()
            .first()
            )
    token.status = TokenStatus.CANCELLED
    token.cancelled_at = datetime.now()
    current_date = datetime.now().date()
    db.commit()
    schedule_queue_updates(
        queue_id=queue.id,
        booking_date=current_date,
        db=db
    )
    db.refresh(token)

    return token


def get_waiting_position(
    token_id: int,
    user_id: int,
    db: Session
):

    token = (
        db.query(Token)
        .filter(
            Token.id == token_id,
            Token.user_id == user_id
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found."
        )

    if token.status != TokenStatus.WAITING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is not in waiting state."
        )

    queue = (
        db.query(Queue)
        .filter(
            Queue.id == token.queue_id
        )
        .first()
    )

    waiting_count = (
        db.query(Token)
        .filter(
            Token.queue_id == token.queue_id,
            Token.status == TokenStatus.WAITING,
            Token.token_number < token.token_number
        )
        .count()
    )

    waiting_position = waiting_count + 1

    estimated_waiting_time = (
        waiting_count *
        queue.avg_service_time
    )

    return {
        "token_number": token.token_number,
        "waiting_position": waiting_position,
        "estimated_waiting_time": estimated_waiting_time,
        "estimated_service_time": token.estimated_time
    }


def advance_queue(
    queue_id: int,
    result: TokenStatus,
    db: Session
):
 
    if result not in (
        TokenStatus.COMPLETED,
        TokenStatus.MISSED
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Result must be COMPLETED or MISSED."
        )

    try:
        queue = (
            db.query(Queue)
            .filter(
                Queue.id == queue_id,
                Queue.is_active.is_(True)
            )
            .with_for_update()
            .first()
        )

        if not queue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Queue not found."
            )
        if queue.status == QueueStatus.PAUSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Queue is currently paused. "
                    f"Reason: "
                    f"{queue.pause_reason or 'No reason provided.'}"
                )
            )

        if queue.status != QueueStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Queue is currently closed."
            )
        current_token = None

        if queue.current_serving_token_id is not None:
            current_token = (
                db.query(Token)
                .filter(
                    Token.id == queue.current_serving_token_id,
                    Token.queue_id == queue.id
                )
                .with_for_update()
                .first()
            )
            if not current_token:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Queue state is inconsistent."
                )
            if current_token.status != TokenStatus.SERVING:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Current serving token is not in SERVING state."
                )
        current_date = datetime.now().date()
        next_token = (
            db.query(Token)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == current_date,
                Token.status == TokenStatus.WAITING
            )
            .order_by(
                Token.token_number.asc()
            )
            .with_for_update()
            .first()
        )
        if current_token:
            current_token.status = result
            if result == TokenStatus.COMPLETED:
                current_token.completed_at = datetime.now()

            elif result == TokenStatus.MISSED:
                current_token.missed_at = datetime.now()

            if not next_token:
                queue.current_serving_token_id = None
                db.commit()
                if current_token:
                    schedule_token_update(
                        current_token.id
                    )
                if current_token:
                    if result == TokenStatus.COMPLETED:
                        schedule_notification(
                            token_id=current_token.id,
                            notification_type=(
                                NotificationType.TOKEN_COMPLETED
                            ),
                        )
                    elif result == TokenStatus.MISSED:
                        schedule_notification(
                            token_id=current_token.id,
                            notification_type=(
                                NotificationType.TOKEN_MISSED
                            ),
                        )
                if current_token:
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
        next_token.started_at = datetime.now()
        queue.current_serving_token_id = next_token.id
        db.commit()
        if current_token:
            schedule_token_update(
                current_token.id
            )
        schedule_token_update(
            next_token.id
        )
        if current_token:
            if result == TokenStatus.COMPLETED:
                schedule_notification(
                    token_id=current_token.id,
                    notification_type=(
                        NotificationType.TOKEN_COMPLETED
                    ),
                )

        elif result == TokenStatus.MISSED:
            schedule_notification(
                token_id=current_token.id,
                notification_type=(
                    NotificationType.TOKEN_MISSED
                ),
            )
        schedule_notification(
            token_id=next_token.id,
            notification_type=(
                NotificationType.YOUR_TURN
            ),
            )
        schedule_threshold_notification(
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
            "serving_token": next_token
        }        
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to advance queue."
        )
    

def get_current_token(
    queue_id: int,
    db: Session
):

    token = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.status == TokenStatus.CALLED
        )
        .order_by(
            Token.token_number.asc()
        )
        .first()
    )

    if not token:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No current token found."
        )

    return token

def get_waiting_tokens(
    queue_id: int,
    db: Session
):

    tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.status == TokenStatus.WAITING
        )
        .order_by(
            Token.token_number.asc()
        )
        .all()
    )

    return tokens