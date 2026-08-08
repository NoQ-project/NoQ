from datetime import date, timedelta, datetime, timezone

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.tracking.events import schedule_queue_updates
from backend.app.queues.models import Queue
from backend.app.queues.schemas import (
    QueueCreateSchema,
    QueueUpdateSchema
)
from backend.app.tokens.models import Token, TokenStatus
from backend.app.notifications.models import NotificationType
from backend.app.notifications.scheduler import (
    schedule_queue_notification,
)
from backend.app.notifications.models import (
    NotificationType,
)

def create_queue(
    queue: QueueCreateSchema,
    db: Session
):

    new_queue = Queue(
        institution_id=1,      # TODO: Replace with logged-in institution ID
        name=queue.name,
        description=queue.description,
        daily_limit=queue.daily_limit,
        avg_service_time=queue.avg_service_time
    )

    db.add(new_queue)
    db.commit()
    db.refresh(new_queue)

    return new_queue


def update_queue(
    queue_id: int,
    queue: QueueUpdateSchema,
    db: Session
):

    existing_queue = get_queue_by_id(queue_id, db)

    for field, value in queue.model_dump(exclude_unset=True).items():
        setattr(existing_queue, field, value)

    db.commit()
    db.refresh(existing_queue)

    return existing_queue


def get_queues_by_institution(
    institution_id: int,
    db: Session
):

    queues = (
        db.query(Queue)
        .filter(
            Queue.institution_id == institution_id,
            Queue.is_active == True
        )
        .all()
    )

    return queues


def get_queue_by_id(
    queue_id: int,
    db: Session
):

    queue = (
        db.query(Queue)
        .filter(
            Queue.id == queue_id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue not found."
        )

    return queue


def delete_queue(
    queue_id: int,
    db: Session
):

    queue = (
        db.query(Queue)
        .filter(
            Queue.id == queue_id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue not found."
        )

    db.delete(queue)
    db.commit()

    return {
        "message": "Queue deleted successfully."
    }

# QUEUE DASHBOARD

def get_queue_dashboard(
    queue_id: int,
    db: Session
):

    queue = get_queue_by_id(queue_id, db)

    today = date.today()

    tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.booking_date == today
        )
        .all()
    )

    total_tokens = len(tokens)

    waiting = sum(
        1 for token in tokens
        if token.status == TokenStatus.WAITING
    )

    currently_serving = sum(
        1 for token in tokens
        if token.status == TokenStatus.CALLED
    )

    served = sum(
        1 for token in tokens
        if token.status == TokenStatus.SERVED
    )

    missed = sum(
        1 for token in tokens
        if token.status == TokenStatus.MISSED
    )

    cancelled = sum(
        1 for token in tokens
        if token.status == TokenStatus.CANCELLED
    )

    return {
        "queue_id": queue.id,
        "queue_name": queue.name,
        "description": queue.description,
        "daily_limit": queue.daily_limit,
        "avg_service_time": queue.avg_service_time,
        "is_active": queue.is_active,

        "statistics": {
            "total_tokens": total_tokens,
            "waiting": waiting,
            "currently_serving": currently_serving,
            "served": served,
            "missed": missed,
            "cancelled": cancelled
        }
    }

# QUEUE DATE RANGE STATISTICS

def get_queue_statistics(
    queue_id: int,
    start_date: date,
    end_date: date,
    db: Session
):

    queue = get_queue_by_id(queue_id, db)

    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date cannot be after end date."
        )

    daily_statistics = []

    current_date = start_date

    while current_date <= end_date:

        tokens = (
            db.query(Token)
            .filter(
                Token.queue_id == queue_id,
                Token.booking_date == current_date
            )
            .all()
        )

        total_tokens = len(tokens)

        waiting = sum(
            1 for token in tokens
            if token.status == TokenStatus.WAITING
        )

        currently_serving = sum(
            1 for token in tokens
            if token.status == TokenStatus.CALLED
        )

        served = sum(
            1 for token in tokens
            if token.status == TokenStatus.SERVED
        )

        missed = sum(
            1 for token in tokens
            if token.status == TokenStatus.MISSED
        )

        cancelled = sum(
            1 for token in tokens
            if token.status == TokenStatus.CANCELLED
        )

        daily_statistics.append({
            "date": current_date,
            "total_tokens": total_tokens,
            "waiting": waiting,
            "currently_serving": currently_serving,
            "served": served,
            "missed": missed,
            "cancelled": cancelled
        })

        current_date += timedelta(days=1)

    return {
        "queue_id": queue.id,
        "queue_name": queue.name,
        "start_date": start_date,
        "end_date": end_date,
        "daily_statistics": daily_statistics
    }

def toggle_queue_status(
    queue: Queue,
    reason: str | None,
    db: Session,
):
    if queue.is_active:

        if reason is None or not reason.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pause reason is required.",
            )

        queue.is_active = False
        queue.pause_reason = reason.strip()
        queue.paused_at = datetime.now(timezone.utc)
        message = "Queue paused successfully."
    else:
        queue.is_active = True
        queue.pause_reason = None
        queue.paused_at = None
        message = "Queue resumed successfully."
    db.commit()
    schedule_queue_updates(
        queue_id=queue.id,
        booking_date=date.today(),
        db=db,
    )
    schedule_queue_notification(
        queue_id=queue.id,
        booking_date=date.today(),
        notification_type=NotificationType,
        db=db,
    )
    db.refresh(queue)
    return {
        "queue_id": queue.id,
        "is_active": queue.is_active,
        "pause_reason": queue.pause_reason,
        "paused_at": queue.paused_at,
        "message": message,
    }