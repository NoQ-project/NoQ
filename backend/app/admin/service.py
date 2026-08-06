from sqlalchemy.orm import Session
import math
from fastapi import HTTPException, status
from . import repository
from .schemas import DashboardResponse, DashboardStats, UserSummary, UserListResponse, UserDetail, MessageResponse

def get_dashboard(db: Session) -> DashboardResponse:

    statistics = DashboardStats(
        total_users=repository.get_total_users(db),
        total_institutions=repository.get_total_institutions(db),
        total_queues=repository.get_total_queues(db),
        active_queues=repository.get_active_queues(db),
        inactive_queues=repository.get_inactive_queues(db),
        total_tokens=repository.get_total_tokens(db),
        today_tokens=repository.get_today_tokens(db),
    )
    return DashboardResponse(
        statistics=statistics
    )


def get_users(
    db: Session,
    page: int,
    limit: int,
    search: str | None,
):
    users = repository.get_users(
        db=db,
        page=page,
        limit=limit,
        search=search,
    )

    total = repository.count_users(
        db=db,
        search=search,
    )

    pages = math.ceil(total / limit) if total else 1

    return UserListResponse(
        items=[
            UserSummary(
                id=user.id,
                name=user.name,
                email=user.email,
                is_verified=user.is_verified,
                created_at=user.created_at,
            )
            for user in users
        ],
        page=page,
        limit=limit,
        total=total,
        pages=pages,
    )

def get_user(
    db: Session,
    user_id: int,
):
    user = repository.get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    profile = user.profile

    return UserDetail(
        id=user.id,
        first_name=user.FirstName,
        last_name=user.LastName,
        email=user.email,
        is_verified=user.is_verified,
        is_active=user.is_active,
        phone=profile.phone if profile else None,
        address=profile.address if profile else None,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )

def set_user_active_status(
    db: Session,
    user_id: int,
    is_active: bool,
):
    user = repository.get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    if user.is_active == is_active:
        state = "active" if is_active else "suspended"

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is already {state}."
        )

    user.is_active = is_active
    db.commit()
    action = "activated" if is_active else "suspended"
    return MessageResponse(
        message=f"User {action} successfully."
    )