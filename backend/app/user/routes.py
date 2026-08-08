from fastapi import APIRouter, status, Depends
from sqlalchemy.orm import Session
from backend.app.utils.database import get_db
from backend.app.user.schemas import UserDashboardResponse
from backend.app.auth.dependencies import get_current_user
from backend.app.auth.models import UserModel
from backend.app.user import controller

user_routes = APIRouter(prefix="/user", 
                        tags=["User"]) 
@user_routes.get(
    "/dashboard",
    response_model=UserDashboardResponse,
    status_code=status.HTTP_200_OK,
)
def get_dashboard(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return controller.get_dashboard(
        db=db,
        current_user=current_user,
    )