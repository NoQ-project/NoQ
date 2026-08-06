from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.utils.database import get_db
from backend.app.admin.schemas import DashboardResponse, UserListResponse, UserDetail, MessageResponse, InstitutionDetail, QueueDetail, QueueListResponse, TokenDetail, TokenListResponse
from backend.app.admin import service
from backend.app.auth.dependencies import require_role
from backend.app.auth.models import UserRole

admin_routes = APIRouter(prefix="/admin",
                         dependencies= Depends(require_role(UserRole.ADMIN))) 

@admin_routes.get(
    "/dashboard",
    response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db),):
    return service.get_dashboard(db)

@admin_routes.get(
    "/users",
    response_model=UserListResponse)
def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db)
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

@admin_routes.get(
    "/queues",
    response_model=QueueListResponse)
def get_queues(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    db: Session = Depends(get_db)
):
    return service.get_queues(
        db,
        page,
        limit,
        search
    )

@admin_routes.get(
    "/queues/{queue_id}",
    response_model=QueueDetail)
def get_queue(
    queue_id: int,
    db: Session = Depends(get_db)
):
    return service.get_queue(
        db,
        queue_id
    )

@admin_routes.patch(
    "/queues/{queue_id}/activate",
    response_model=MessageResponse)
def activate_queue(
    queue_id: int,
    db: Session = Depends(get_db)
):
    return service.set_queue_status(
        db,
        queue_id,
        True
    )

@admin_routes.patch(
    "/queues/{queue_id}/deactivate",
    response_model=MessageResponse)
def deactivate_queue(
    queue_id: int,
    db: Session = Depends(get_db)
):
    return service.set_queue_status(
        db,
        queue_id,
        False
    )

@admin_routes.get(
    "/tokens",
    response_model=TokenListResponse)
def get_tokens(
    page: int = Query(
        1,
        ge=1),
    limit: int = Query(
        20,
        ge=1,
        le=100),
    db: Session = Depends(get_db)):
    return service.get_tokens(
        db,
        page,
        limit
    )

@admin_routes.get(
    "/tokens/{token_id}",
    response_model=TokenDetail)
def get_token(
    token_id: int,
    db:Session = Depends(get_db)):
    return service.get_token(
        db,
        token_id
    )

@admin_routes.patch(
    "/tokens/{token_id}/cancel",
    response_model=MessageResponse)
def cancel_token(
    token_id: int,
    db: Session = Depends(get_db)
):
    return service.cancel_token(
        db,
        token_id
    )