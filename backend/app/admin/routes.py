from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.utils.database import get_db
from backend.app.admin import service
from backend.app.admin.schemas import (
    DashboardResponse,
    UserListResponse,
    UserDetail,
    MessageResponse,
    InstitutionDetail,
    InstitutionListResponse,
    QueueDetail,
    QueueListResponse,
    TokenDetail,
    TokenListResponse,
    AuditLogSummary,
    AuditLogListResponse,
)
from backend.app.auth.dependencies import require_role
from backend.app.auth.models import UserRole


admin_routes = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# ============================================================
# DASHBOARD
# ============================================================

@admin_routes.get(
    "/dashboard",
    response_model=DashboardResponse,
)
def get_dashboard(
    db: Session = Depends(get_db),
):
    return service.get_dashboard(db)


# ============================================================
# USERS
# ============================================================

@admin_routes.get(
    "/users",
    response_model=UserListResponse,
)
def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return service.get_users(
        db=db,
        page=page,
        limit=limit,
        search=search,
    )


@admin_routes.get(
    "/users/{user_id}",
    response_model=UserDetail,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    return service.get_user(
        db=db,
        user_id=user_id,
    )


@admin_routes.patch(
    "/users/{user_id}/status",
    response_model=MessageResponse,
)
def set_user_active_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    return service.set_user_active_status(
        db=db,
        user_id=user_id,
        is_active=is_active,
        admin_id=current_user.id,
    )


# ============================================================
# INSTITUTIONS
# ============================================================

@admin_routes.get(
    "/institutions",
    response_model=InstitutionListResponse,
)
def get_institutions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return service.get_institutions(
        db=db,
        page=page,
        limit=limit,
        search=search,
    )


@admin_routes.get(
    "/institutions/{institution_id}",
    response_model=InstitutionDetail,
)
def get_institution(
    institution_id: int,
    db: Session = Depends(get_db),
):
    return service.get_institution(
        db=db,
        institution_id=institution_id,
    )


# ============================================================
# QUEUES
# ============================================================

@admin_routes.get(
    "/queues",
    response_model=QueueListResponse,
)
def get_queues(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return service.get_queues(
        db=db,
        page=page,
        limit=limit,
        search=search,
    )


@admin_routes.get(
    "/queues/{queue_id}",
    response_model=QueueDetail,
)
def get_queue(
    queue_id: int,
    db: Session = Depends(get_db),
):
    return service.get_queue(
        db=db,
        queue_id=queue_id,
    )


@admin_routes.patch(
    "/queues/{queue_id}/status",
    response_model=MessageResponse,
)
def change_queue_status(
    queue_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    return service.change_queue_status(
        db=db,
        queue_id=queue_id,
        is_active=is_active,
        admin_id=current_user.id,
    )


# ============================================================
# TOKENS
# ============================================================

@admin_routes.get(
    "/tokens",
    response_model=TokenListResponse,
)
def get_tokens(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return service.get_tokens(
        db=db,
        page=page,
        limit=limit,
    )


@admin_routes.get(
    "/tokens/{token_id}",
    response_model=TokenDetail,
)
def get_token(
    token_id: int,
    db: Session = Depends(get_db),
):
    return service.get_token(
        db=db,
        token_id=token_id,
    )


@admin_routes.patch(
    "/tokens/{token_id}/cancel",
    response_model=MessageResponse,
)
def cancel_token(
    token_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    return service.cancel_token(
        db=db,
        token_id=token_id,
        admin_id=current_user.id,
    )


# ============================================================
# AUDIT LOGS
# ============================================================

@admin_routes.get(
    "/logs",
    response_model=AuditLogListResponse,
)
def get_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return service.get_logs(
        db=db,
        page=page,
        limit=limit,
    )


@admin_routes.get(
    "/logs/{log_id}",
    response_model=AuditLogSummary,
)
def get_log(
    log_id: int,
    db: Session = Depends(get_db),
):
    return service.get_log(
        db=db,
        log_id=log_id,
    )