from backend.app.auth.schemas import  RegisterSchema, LoginSchema, VerifyEmailSchema, EmailSchema, ResetPasswordSchema
from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel, RefreshTokenModel
from fastapi import HTTPException,Request , status, Depends, BackgroundTasks, Response
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
from backend.app.utils.settings import settings
import jwt
from jwt.exceptions import InvalidTokenError
from backend.app.utils.database import get_db
import redis
from redis import Redis
import secrets
from backend.app.utils.mail import send_verification_email
from backend.app.config.redis_client import redis_client, save_pending_registration, verify_registration, store_and_send_otp, check_cooldown, start_cooldown, check_rate_limit, verified_user
from backend.app.auth.dependencies import create_access_token, create_refresh_token

password_hash = PasswordHash.recommended()
def get_password_hash(password):
    return password_hash.hash(password)


def register(body: RegisterSchema, bg_tasks:BackgroundTasks, db: Session):
    is_user = db.query(UserModel).filter(UserModel.email == body.email).first()
    if is_user:
        raise HTTPException(status_code = status.HTTP_409_CONFLICT, detail="email already exists")
    hash_password= get_password_hash(body.password)
    save_pending_registration(body, hash_password)
    store_and_send_otp(register, body.email, bg_tasks)
    return {"message": "OTP sent in email"}

def verify_register(body:VerifyEmailSchema, db: Session):
    data=verify_registration(body)

    new_user = UserModel(
        FirstName=data["first_name"],
        LastName=data["last_name"],
        email=data["email"],
        password_hash=data["hash_password"],
        role=data["role"]
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
   
def resend_otp(body:VerifyEmailSchema, bg_tasks: BackgroundTasks):
    if not redis_client.exists(f"register:{body.email}"):
        raise HTTPException(status_code=400, detail="Registration has expired. Please register again")
    check_cooldown(f"cooldown:resend_otp:{body.email}")
    check_rate_limit(f"rate_limit:resesnd_otp:{body.email}", 5, 60)
    store_and_send_otp("register", body.email, bg_tasks)
    start_cooldown(f"cooldown:resend_otp:{body.email}", 120)
    return {"message":"OTP sent successfully"}

def verify_password(plain_password, hash_password):
    return password_hash.verify(plain_password, hash_password)

def login_user(body:LoginSchema, db:Session):
    user = db.query(UserModel).filter(UserModel.email==body.email).first()
    if not user:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Invalid Email")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Invalid Password")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    refresh_token_data = RefreshTokenModel(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    return {"access_token": access_token,
            "refresh_token": refresh_token}
    
def request_reset_password(body:EmailSchema, db:Session, bg_tasks: BackgroundTasks):
    is_user = db.query(UserModel).filter(UserModel.email == body.email).first()
    if not is_user:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Email doesnot exist")
    store_and_send_otp("reset_password", body.email, bg_tasks)

def verify_reset_password(body: VerifyEmailSchema):
    stored_otp= redis_client.get(f"reset_password_otp:{body.email}")
    if stored_otp is None:
        raise HTTPException(status_code=400,detail="OTP expired.")
    if  body.otp != stored_otp:
        raise HTTPException(status_code=401, detail="Incorrect OTP")
    redis_client.delete(f"reset_password_otp:{body.email}")
    verified_user("reset_password", body.email)


def reset_password(body:ResetPasswordSchema, db:Session):
    user = db.query(UserModel).filter(UserModel.email == body.email).first()
    if not user:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Email doesnot exist")
    verified = redis_client.get(f"reset_password_verified:{body.email}")
    if verified is None:
        raise HTTPException(status_code=400, detail="OTP not verified")
    user.password_hash = get_password_hash(body.new_password)
    db.commit()
    db.refresh(user)
    redis_client.delete(f"reset_password_verified:{body.email}")
    return {"message":"Password Reset"}

def refresh_token(request: Request, response: Response, db: Session
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
    stored_token = db.query(RefreshTokenModel).filter( RefreshTokenModel.token == refresh_token).first()
    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    if stored_token.revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked"
        )
    if stored_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )
    new_access_token = create_access_token(
        stored_token.user_id
    )
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,   # True in production
        samesite="lax",
        max_age=15 * 60
    )
    return {
        "message": "Access token refreshed"
    }

def logout(request: Request, response: Response, db: Session):
    
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        stored_token = db.query(RefreshTokenModel).filter(
            RefreshTokenModel.token == refresh_token
        ).first()

        if stored_token:
            stored_token.revoked = True
            db.commit()
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully"}