from sqlalchemy.orm import Session

from backend.app.tokens import service


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

def call_next_token(
        queue_id:int,
        db:Session
):

    return service.call_next_token(
        queue_id=queue_id,
        db=db
    )



def serve_token(
        token_id:int,
        db:Session
):

    return service.serve_token(
        token_id=token_id,
        db=db
    )



def mark_token_as_missed(
        token_id:int,
        db:Session
):

    return service.mark_token_as_missed(
        token_id=token_id,
        db=db
    )