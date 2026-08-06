from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.utils.database import get_db
from backend.app.admin.schemas import DashboardResponse
from backend.app.admin import service
from backend.app.admin.service import get_dashboard
from backend.app.auth.dependencies import require_role
from backend.app.auth.models import UserRole

admin_routes = APIRouter(prefix="/admin",
                         dependencies= Depends(require_role(UserRole.ADMIN))) 

@admin_routes.get(
    "/dashboard",
    response_model=DashboardResponse
)
def get_dashboard(
    db: Session = Depends(get_db),
):
    return service.get_dashboard(db)