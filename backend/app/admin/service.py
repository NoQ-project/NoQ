from sqlalchemy.orm import Session

from . import repository
from .schemas import DashboardResponse, DashboardStats


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