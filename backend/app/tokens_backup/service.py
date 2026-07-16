<<<<<<< HEAD:backend/app/tokens_backup/service.py
from datetime import datetime, timedelta

from fastapi import HTTPException, status

from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.tokens_backup.models import (
    Token,
    TokenStatus
)

from backend.app.queues.models import Queue


def book_token(
    queue_id: int,
    user_id: int,
    db: Session
):

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

    current_time = datetime.now()

    today_count = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            func.date(Token.booking_date)
            == current_time.date()
        )
        .count()
    )

    if today_count >= queue.daily_limit:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Queue is full for today."
        )

    token_number = today_count + 1

    estimated_time = (
        current_time +
        timedelta(
            minutes=(
                token_number *
                queue.avg_service_time
            )
        )
    )

    token = Token(

        user_id=user_id,

        queue_id=queue_id,

        token_number=token_number,

        status=TokenStatus.WAITING,

        booking_date=current_time,

        estimated_time=estimated_time

    )

    db.add(token)

    db.commit()

    db.refresh(token)

    return token


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
=======
>>>>>>> f4c3dca878710c3027b416ba91e7275d45219b3f:backend/app/tokens/service.py
