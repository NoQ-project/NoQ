from sqlalchemy.orm import Session
import math

from . import repository
from .schemas import DashboardResponse, DashboardStats, UserSummary, UserListResponse

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