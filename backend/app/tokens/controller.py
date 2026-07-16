from sqlalchemy.orm import Session

from backend.app.tokens import service


def book_token(
    queue_id: str,
    user_id: str,
    db: Session
):
    return service.book_token(
        queue_id=queue_id,
        user_id=user_id,
        db=db
    )


def get_my_tokens(
    user_id: str,
    db: Session
):
    return service.get_my_tokens(
        user_id=user_id,
        db=db
    )


def get_token_details(
    token_id: str,
    user_id: str,
    db: Session
):
    return service.get_token_by_id(
        token_id=token_id,
        user_id=user_id,
        db=db
    )