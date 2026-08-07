from datetime import datetime, timedelta

from fastapi import HTTPException, status

from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.tokens.models import (
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
            func.date(Token.booking_date) == current_time.date(),
            Token.status != TokenStatus.CANCELLED
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


def cancel_token(
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

    token.status = TokenStatus.CANCELLED
    token.cancelled_at = datetime.now()

    db.commit()
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


def call_next_token(
    queue_id: int,
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

    token = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.status == TokenStatus.WAITING
        )
        .order_by(
            Token.token_number.asc()
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No waiting token found."
        )

    token.status = TokenStatus.CALLED

    db.commit()
    db.refresh(token)

    return token


def serve_token(
    token_id: int,
    db: Session
):

    token = (
        db.query(Token)
        .filter(
            Token.id == token_id
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found."
        )

    if token.status != TokenStatus.CALLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only called tokens can be served."
        )

    token.status = TokenStatus.SERVED

    db.commit()
    db.refresh(token)

    return token


def mark_token_as_missed(
    token_id: int,
    db: Session
):

    token = (
        db.query(Token)
        .filter(
            Token.id == token_id
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found."
        )

    if token.status != TokenStatus.CALLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only called tokens can be marked as missed."
        )

    token.status = TokenStatus.MISSED

    db.commit()
    db.refresh(token)

    return token

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