from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.utils.database import get_db
from backend.app.admin.schemas import DashboardResponse, UserListResponse, UserDetail
from backend.app.admin import service
from backend.app.admin.service import get_dashboard, get_user, get_users
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