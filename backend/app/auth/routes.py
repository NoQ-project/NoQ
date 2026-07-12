from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from backend.app.auth.schemas import UserResponseSchema, RegisterSchema, LoginSchema
from backend.app.auth.models import UserRole
from backend.app.auth import controller
from backend.app.utils.database import get_db
from backend.app.auth.dependencies import get_current_user
from backend.app.auth.dependencies import require_role 

auth_routes = APIRouter(prefix="/auth") 

@auth_routes.post("/register", response_model= UserResponseSchema, status_code=status.HTTP_201_CREATED)
def register(body:RegisterSchema, db:Session= Depends(get_db)):
    return controller.register(body, db)

@auth_routes.post("/login",status_code=status.HTTP_200_OK)
def login(body: LoginSchema, db:Session = Depends(get_db)):
    return controller.login_user(body, db)

 
@auth_routes.get("/profile", response_model= UserResponseSchema, status_code= status.HTTP_200_OK)
def profile(
    current_user = Depends(get_current_user)
):
    return current_user


@auth_routes.get("/dashboard", response_model= UserResponseSchema, status_code= status.HTTP_200_OK)
def profile(
    current_user = Depends(require_role(UserRole.USER))
):
    return current_user

