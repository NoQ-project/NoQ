from sqlalchemy.orm import Session

from backend.app.user import service
from backend.app.user.schemas import UpdateUserSchema


def get_user_profile(
    user_id: int,
    db: Session
):
    return service.get_user_profile(
        user_id=user_id,
        db=db
    )


def update_user_profile(
    user_id: int,
    body: UpdateUserSchema,
    db: Session
):
    return service.update_user_profile(
        user_id=user_id,
        body=body,
        db=db
    )


def get_user_details(
    user_id: int,
    db: Session
):
    return service.get_user_by_id(
        user_id=user_id,
        db=db
    )