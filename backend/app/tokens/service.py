from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.tokens.models import Token, TokenStatus
from backend.app.queues.models import Queue


def book_token(
    queue_id: str,
    user_id: str,
    db: Session
):
    # Check whether queue exists
    queue = (
        db.query(Queue)
        .filter(
            Queue.id == queue_id,
            Queue.is_active == True
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue not found."
        )

    # Count today's tokens
    today_count = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            func.date(Token.booking_date) == datetime.now().date()
        )
        .count()
    )

    # Check daily limit
    if today_count >= queue.daily_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Queue is full for today."
        )

    # Generate token number
    token_number = today_count + 1

    # Calculate estimated time
    estimated_time = (
        datetime.now()
        + timedelta(
            minutes=token_number * queue.avg_service_time
        )
    )

    # Create token
    token = Token(
        user_id=user_id,
        queue_id=queue_id,
        token_number=token_number,
        status=TokenStatus.WAITING,
        booking_date=datetime.now(),
        estimated_time=estimated_time
    )

    db.add(token)
    db.commit()
    db.refresh(token)

    return token


def get_my_tokens(
    user_id: str,
    db: Session
):
    tokens = (
        db.query(Token)
        .filter(Token.user_id == user_id)
        .all()
    )

    return tokens


def get_token_by_id(
    token_id: str,
    user_id: str,
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