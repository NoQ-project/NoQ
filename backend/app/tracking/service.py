from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.tokens.models import Token, TokenStatus
from backend.app.queues.models import Queue


def get_token_tracking(
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
    queue = (
        db.query(Queue)
        .filter(
            Queue.id == token.queue_id
        )
        .first()
    )
    if not queue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue not found."
        )
    
    current_serving_token = None
    people_ahead = 0
    estimated_wait_minutes = None
    estimated_time = None

    if queue.current_serving_token_id is not None:
        current_serving_token = (
            db.query(Token)
            .filter(
                Token.id == queue.current_serving_token_id,
                Token.queue_id == queue.id,
                Token.booking_date == token.booking_date,
                Token.status == TokenStatus.SERVING
            )
            .first()
        )

    if token.status == TokenStatus.WAITING:
        # Number of WAITING tokens before this token.
        waiting_ahead = (
            db.query(Token)
            .filter(
                Token.queue_id == queue.id,
                Token.booking_date == token.booking_date,
                Token.status == TokenStatus.WAITING,
                Token.token_number < token.token_number
            )
            .count()
        )

        # The currently serving customer is also ahead.
        serving_ahead = (
            1 if current_serving_token is not None else 0
        )
        people_ahead = waiting_ahead + serving_ahead
        estimated_wait_minutes = (
            people_ahead * queue.avg_service_time
        )
        estimated_time = (
            datetime.now()
            + timedelta(
                minutes=estimated_wait_minutes
            )
        )
    elif token.status == TokenStatus.SERVING:
        people_ahead = 0
        estimated_wait_minutes = 0
        # The user's turn is currently being served.
        estimated_time = datetime.now()
    return {
        "token_id": token.id,
        "token_number": token.token_number,
        "status": token.status,
        "queue_id": queue.id,
        "queue_name": queue.name,
        "queue_status": queue.status,
        "pause_reason": queue.pause_reason,
        "current_serving_token": (
            current_serving_token.token_number
            if current_serving_token
            else None
        ),
        "people_ahead": people_ahead,
        "estimated_wait_minutes": (
            estimated_wait_minutes
        ),
        "estimated_time": estimated_time
    }