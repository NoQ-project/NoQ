from backend.app.auth.schemas import  RegisterSchema, LoginSchema, VerifyEmailSchema
from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel
from fastapi import HTTPException,Request , status, Depends, BackgroundTasks
from pwdlib import PasswordHash
from datetime import datetime, timedelta
from backend.app.utils.settings import settings
import jwt
from jwt.exceptions import InvalidTokenError
from backend.app.utils.database import get_db
import redis
from redis import Redis
import secrets
from backend.app.utils.mail import send_verification_email
from backend.app.config.redis_client import save_pending_registration, verify_registration


password_hash = PasswordHash.recommended()
def get_password_hash(password):
    return password_hash.hash(password)


def register(body: RegisterSchema, bg_tasks:BackgroundTasks, db: Session):
    is_user = db.query(UserModel).filter(UserModel.email == body.email).first()
    if is_user:
        raise HTTPException(status_code = status.HTTP_409_CONFLICT, detail="email already exists")
    hash_password= get_password_hash(body.password)
    otp = save_pending_registration(body, hash_password)
    bg_tasks.add_task(send_verification_email, body.email, otp)
    return {"message": "verify the email now"}

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
   
def verify_password(plain_password, hash_password):
    return password_hash.verify(plain_password, hash_password)

def login_user(body:LoginSchema, db:Session):
    
    user = db.query(UserModel).filter(UserModel.email==body.email).first()
    
    if not user:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Invalid Email")
    
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Invalid Password")

    exp_time = datetime.now()+ timedelta(minutes=settings.EXP_TIME)

    token = jwt.encode({"id":user.id,"exp":exp_time}, settings.SECRET_KEY, settings.ALGORITHM)
    
    return {"token": token}
    
    
