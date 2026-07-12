from backend.app.auth.schemas import  RegisterSchema, LoginSchema
from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel
from fastapi import HTTPException,Request , status, Depends
from pwdlib import PasswordHash
from datetime import datetime, timedelta
from backend.app.utils.settings import settings
import jwt
from jwt.exceptions import InvalidTokenError
from backend.app.utils.database import get_db

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
        password_hash= hash_password,
        role = body.role
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
    
def get_current_user(request: Request, db: Session = Depends(get_db)):
    try:
        token = request.headers.get("authorization")
        if not token:
            raise HTTPException(status_code= status.HTTP_401_UNAUTHORIZED, detail= "You are unauthorized")
        
        token = token.split(" ")[-1]
        data = jwt.decode(token, settings.SECRET_KEY, settings.ALGORITHM )
        user_id = data.get("id")
        user= db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail= "You are unauthorized")
    except InvalidTokenError:
            raise HTTPException(status_code= status.HTTP_401_UNAUTHORIZED, detail= "You are unauthorized")
    
    return user        
                