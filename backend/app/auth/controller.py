from backend.app.auth.schemas import  RegisterSchema, LoginSchema
from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel
from fastapi import HTTPException, status
from pwdlib import PasswordHash
from datetime import datetime, timedelta
from backend.app.utils.settings import settings
import jwt

password_hash = PasswordHash.recommended()
def get_password_hash(password):
    return password_hash.hash(password)


def register(body: RegisterSchema, db: Session):
    is_user = db.query(UserModel).filter(UserModel.email == body.email).first()

    if is_user:
        raise HTTPException(status_code = status.HTTP_409_CONFLICT, detail="email already exists")
    
    hash_password= get_password_hash(body.password)

    new_user = UserModel(
        FirstName= body.FirstName,
        LastName = body.LastName,
        email = body.email,
        password_hash= hash_password
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

    token = jwt.encode({"id":user.id,"exp":exp_time, "role": user.role.value}, settings.SECRET_KEY, settings.ALGORITHM)

    return {"token": token}