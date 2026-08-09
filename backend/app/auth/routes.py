from fastapi import APIRouter, Depends, status, Request, BackgroundTasks, HTTPException, Response
from sqlalchemy.orm import Session
from backend.app.auth import controller
from backend.app.auth.models import UserRole, UserModel
from backend.app.auth.schemas import UserResponseSchema, RegisterSchema, LoginSchema, VerifyEmailSchema, EmailSchema, ResetPasswordSchema
from backend.app.utils.database import get_db
from backend.app.auth.dependencies import get_current_user, require_role, get_owned_token

auth_routes = APIRouter(prefix="/auth", tags=["Authentication"]) 

@auth_routes.post("/register", status_code=status.HTTP_200_OK)
def register(body: RegisterSchema, bg_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    return controller.register(body, bg_tasks, db)

@auth_routes.post("/verify_register", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
def verify_register(body: VerifyEmailSchema, db: Session = Depends(get_db)):
    return controller.verify_register(body, db)

@auth_routes.post("/resend_otp", status_code=status.HTTP_200_OK)
def resend_otp(body: EmailSchema, bg_tasks: BackgroundTasks):
    return controller.resend_otp(body, bg_tasks)

@auth_routes.post("/login", status_code=status.HTTP_200_OK)
def login(body: LoginSchema, response: Response, db: Session = Depends(get_db)):
    login_result = controller.login_user(body, db)
    
    # Handle dict or tuple response from controller
    if isinstance(login_result, tuple):
        tokens, user = login_result
    else:
        tokens = login_result
        user = db.query(UserModel).filter(UserModel.email == body.email).first()

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=15 * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=30 * 24 * 60 * 60
    )
    
    return {
        "message": "Login successful",
        "role": user.role.value if user and hasattr(user.role, 'value') else (user.role if user else "user"),
        "email": user.email if user else body.email
    }

@auth_routes.get("/me", response_model=UserResponseSchema, status_code=status.HTTP_200_OK)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@auth_routes.post("/request_reset_password", status_code=status.HTTP_200_OK)
def request_reset_password(
    body: EmailSchema, 
    db: Session = Depends(get_db),
    bg_tasks: BackgroundTasks = BackgroundTasks()
):
    return controller.request_reset_password(body, db, bg_tasks)

@auth_routes.post("/verify_reset_password", status_code=status.HTTP_200_OK)
def verify_reset_password(body: VerifyEmailSchema):
    return controller.verify_reset_password(body)

@auth_routes.post("/reset_password", status_code=status.HTTP_200_OK)
def reset_password(body: ResetPasswordSchema, db: Session = Depends(get_db)):
    return controller.reset_password(body, db)

@auth_routes.post("/refresh", status_code=status.HTTP_200_OK)
def refresh_token(response: Response, request: Request, db: Session = Depends(get_db)):
    return controller.refresh_token(request, response, db)

@auth_routes.post("/logout", status_code=status.HTTP_200_OK)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    return controller.logout(request, response, db)