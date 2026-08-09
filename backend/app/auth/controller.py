
from backend.app.auth.schemas import RegisterSchema, LoginSchema, VerifyEmailSchema, EmailSchema, ResetPasswordSchema
from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel, RefreshTokenModel, UserRole
from backend.app.user.models import User
from fastapi import HTTPException,Request , status, Depends, BackgroundTasks, Response
from fastapi import HTTPException, Request, status, BackgroundTasks, Response
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
from backend.app.config.redis_client import (
    redis_client,
    save_pending_registration,
    verify_registration,
    store_and_send_otp,
    check_cooldown,
    start_cooldown,
    check_rate_limit,
    verified_user
)
from backend.app.auth.dependencies import create_access_token, create_refresh_token

password_hash = PasswordHash.recommended()


def get_password_hash(password):
    return password_hash.hash(password)


def register(
    body: RegisterSchema,
    bg_tasks: BackgroundTasks,
    db: Session
):
    is_user = db.query(UserModel).filter(
        UserModel.email == body.email
    ).first()

    if is_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="email already exists"
        )

    hash_password = get_password_hash(body.password)

    save_pending_registration(body, hash_password)
    store_and_send_otp("register", bg_tasks, body.email)

    return {
        "message": "OTP sent in email"
    }


def verify_register(body, db: Session):
    data = verify_registration(body)

    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration session expired or invalid. Please sign up again."
        )

    hashed_pwd = (
        data.get("password")
        or data.get("hash_password")
        or data.get("hashed_password")
    )

    if not hashed_pwd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration session expired or invalid. Please sign up again."
        )

    new_user = UserModel(
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
        email=data["email"],
        password_hash=hashed_pwd,
        role=data.get("role") or UserRole.USER,
        is_verified=True,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Every USER-role account needs a matching profile row, since
    # routes like /tokens/my-tokens rely on `current_user.profile`.
    # Institution accounts get their profile row created separately
    # (see backend/app/institutions/service.py).
    if new_user.role == UserRole.USER:
        profile = User(auth_user_id=new_user.id)
        db.add(profile)
        db.commit()
        db.refresh(new_user)

    return new_user


def resend_otp(
    body: VerifyEmailSchema,
    bg_tasks: BackgroundTasks
):
    if not redis_client.exists(f"register:{body.email}"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration has expired. Please register again"
        )

    check_cooldown(
        f"cooldown:resend_otp:{body.email}"
    )

    check_rate_limit(
        f"rate_limit:resend_otp:{body.email}",
        5,
        60
    )

    store_and_send_otp(
        "register",
        bg_tasks,
        body.email
    )

    start_cooldown(
        f"cooldown:resend_otp:{body.email}",
        120
    )

    return {
        "message": "OTP sent successfully"
    }


def verify_password(plain_password, hash_password):
    return password_hash.verify(
        plain_password,
        hash_password
    )


def login_user(
    body: LoginSchema,
    db: Session,
):
    user = (
        db.query(UserModel)
        .filter(UserModel.email == body.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Email",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended.",
        )

    if not verify_password(
        body.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Password",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    refresh_token_data = RefreshTokenModel(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        revoked=False,
        created_at=datetime.now(timezone.utc),
    )

    db.add(refresh_token_data)
    db.commit()
    db.refresh(refresh_token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "role": user.role.value,
    }

def request_reset_password(
    body: EmailSchema,
    db: Session,
    bg_tasks: BackgroundTasks
):
    is_user = db.query(UserModel).filter(
        UserModel.email == body.email
    ).first()

    if not is_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email doesnot exist"
        )

    store_and_send_otp(
        "reset_password",
        body.email,
        bg_tasks
    )

    return {
        "message": "OTP sent in email"
    }


def verify_reset_password(body: VerifyEmailSchema):
    stored_otp = redis_client.get(
        f"reset_password_otp:{body.email}"
    )

    if stored_otp is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired."
        )

    if isinstance(stored_otp, bytes):
        stored_otp = stored_otp.decode()

    if str(body.otp) != str(stored_otp):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect OTP"
        )

    redis_client.delete(
        f"reset_password_otp:{body.email}"
    )

    verified_user(
        "reset_password",
        body.email
    )

    return {
        "message": "OTP verified successfully"
    }


def reset_password(
    body: ResetPasswordSchema,
    db: Session
):
    user = db.query(UserModel).filter(
        UserModel.email == body.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email doesnot exist"
        )

    verified = redis_client.get(
        f"reset_password_verified:{body.email}"
    )

    if verified is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not verified"
        )

    user.password_hash = get_password_hash(
        body.new_password
    )

    user.password_changed_at = datetime.now()

    db.commit()
    db.refresh(user)

    redis_client.delete(
        f"reset_password_verified:{body.email}"
    )

    return {
        "message": "Password Reset"
    }


def refresh_token(
    request: Request,
    response: Response,
    db: Session
):
    refresh_token_value = request.cookies.get(
        "refresh_token"
    )   
    print("REFRESH TOKEN FROM COOKIE:", refresh_token_value)

    if not refresh_token_value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )

    stored_token = db.query(
        RefreshTokenModel
    ).filter(
        RefreshTokenModel.token == refresh_token_value
    ).first()
    print("TOKEN FOUND IN DB:", stored_token is not None)
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

    now = datetime.now(timezone.utc)

    expires_at = stored_token.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
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
        secure=False,
        samesite="lax",
        max_age=15 * 60
    )

    return {
        "message": "Access token refreshed"
    }


def logout(
    request: Request,
    response: Response,
    db: Session
):
    refresh_token_value = request.cookies.get(
        "refresh_token"
    )

    if refresh_token_value:
        stored_token = db.query(
            RefreshTokenModel
        ).filter(
            RefreshTokenModel.token == refresh_token_value
        ).first()

        if stored_token:
            stored_token.revoked = True
            db.commit()

    response.delete_cookie(
        key="access_token"
    )

    response.delete_cookie(
        key="refresh_token"
    )

    return {
        "message": "Logout successful"
    }

