from fastapi import APIRouter, Depends, status, Request, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from backend.app.auth import controller
from backend.app.auth.models import UserRole
from backend.app.auth.schemas import UserResponseSchema, RegisterSchema, LoginSchema, VerifyEmailSchema, EmailSchema, ResetPasswordSchema
from backend.app.utils.database import get_db
from backend.app.auth.dependencies import get_current_user
from backend.app.auth.dependencies import require_role 
from backend.app.auth.dependencies import get_owned_token


auth_routes = APIRouter(prefix="/auth") 

@auth_routes.post("/register",status_code=status.HTTP_200_OK)
def register(body:RegisterSchema,bg_tasks:BackgroundTasks,db:Session= Depends(get_db)):
    return controller.register(body,bg_tasks, db)

@auth_routes.post("/verify_register",response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
def verify_register(body: VerifyEmailSchema, db:Session=Depends(get_db)):
    return controller.verify_register(body,db)

@auth_routes.post("/resend_otp", status_code=status.HTTP_200_OK)
def resend_otp(body:EmailSchema, bg_tasks:BackgroundTasks):
    return controller.resend_otp(body, bg_tasks)

@auth_routes.post("/login",status_code=status.HTTP_200_OK)
def login(body: LoginSchema, db:Session = Depends(get_db)):
    return controller.login_user(body, db)

@auth_routes.post("/request_reset_password", status_code=status.HTTP_200_OK)
def request_reset_password(body:EmailSchema,  bg_tasks:BackgroundTasks,db:Session = Depends(get_db)):
    return controller.request_reset_password(body, bg_tasks, db)

@auth_routes.post("/verify_reset_password", status_code=status.HTTP_200_OK)
def verify_reset_password(body:VerifyEmailSchema):
    return controller.verify_reset_password(body)

@auth_routes.post("/reset_password", status_code=status.HTTP_200_OK)
def reset_password(body:ResetPasswordSchema, db:Session = Depends(get_db)):
    return controller.reset_password(body, db)


