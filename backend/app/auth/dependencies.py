from backend.app.utils.settings import settings
import jwt
from jwt.exceptions import InvalidTokenError
from backend.app.utils.database import get_db
from fastapi import HTTPException,Request , status, Depends
from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel, UserRole


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

def require_role(required_role: UserRole):

    def role_checker(
        current_user = Depends(get_current_user)
    ):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=403,
                detail="Forbidden"
            )

        return current_user

    return role_checker