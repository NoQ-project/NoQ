from sqlalchemy.orm import Session

from backend.app.tokens import service
from backend.app.tokens.models import TokenStatus


def book_token(
    queue_id: int,
    user_id: int,
    db: Session
):
    return service.book_token(
        queue_id=queue_id,
        user_id=user_id,
        db=db
    )

def get_my_tokens(
    user_id: int,
    db: Session
):
    return service.get_my_tokens(
        user_id=user_id,
        db=db
    )

def get_token_details(
    token_id: int,
    user_id: int,
    db: Session
):
    return service.get_token_by_id(
        token_id=token_id,
        user_id=user_id,
        db=db
    )

def cancel_token(
    token_id: int,
    user_id: int,
    db: Session
):
    return service.cancel_token(
        token_id=token_id,
        user_id=user_id,
        db=db
    )

def get_waiting_position(
    token_id:int,
    user_id:int,
    db:Session
):
    return service.get_waiting_position(

        token_id=token_id,
        user_id=user_id,
        db=db
    )

def advance_token_controller(
    queue_id: int,
    result: TokenStatus,
    db: Session
):
    return service.advance_queue(
        queue_id=queue_id,
        result=result,
        db=db
    )

def get_current_token(
    queue_id: int,
    db: Session
):

    return service.get_current_token(
        queue_id=queue_id,
        db=db
    )

def get_waiting_tokens(
    queue_id: int,
    db: Session
):

    return service.get_waiting_tokens(
        queue_id=queue_id,
        db=db
    )