from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.user.models import User
from backend.app.user.schemas import UpdateUserSchema


def get_user_profile(
    user_id: int,
    db: Session
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    return user


def update_user_profile(
    user_id: int,
    body: UpdateUserSchema,
    db: Session
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    user.full_name = body.full_name
    user.phone = body.phone

    db.commit()
    db.refresh(user)

    return user


def get_user_by_id(
    user_id: int,
    db: Session
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    return user