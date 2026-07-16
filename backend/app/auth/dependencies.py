from backend.app.utils.settings import settings
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError, PyJWTError
from backend.app.utils.database import get_db
from backend.app.utils.settings import settings
from fastapi import HTTPException,Request , status, Depends
from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel, UserRole
from backend.app.tokens.models import Token 
from backend.app.queues.models import Queue 
from backend.app.admin.models import Review 
from backend.app.user.models import User 
from backend.app.notifications.models import Notification
from backend.app.institutions.models import Institution 
from datetime import datetime, timezone, timedelta


def get_current_user(request: Request, db: Session = Depends(get_db)):
    try:
        token = request.cookies.get("access_token")
        if not token:
            raise HTTPException(status_code= status.HTTP_401_UNAUTHORIZED, detail= "You are unauthorized")
        
        data = jwt.decode(token, settings.SECRET_KEY, settings.ALGORITHM )
        user_id = data.get("id")

        user= db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail= "You are unauthorized")
    except ExpiredSignatureError:
            raise HTTPException(status_code= status.HTTP_401_UNAUTHORIZED, detail= "Access Token Expired")
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
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


def require_owner (db: Session, model, resource_id: int, owner_id, current_user= Depends(get_current_user)):
    
    resource = (
        db.query(model)
        .filter(
            model.id == resource_id,
            owner_id == current_user.id
        )
        .first()
    )
    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{model.__name__} not found."
        )
    
    return resource

def get_owned_token(
    booking_id: int,
    db: Session,
    current_user,
):
    return require_owner(
        db=db,
        model=Token,
        resource_id=id,
        owner_column=Token.user_id,
        current_user=current_user,
    )

def get_owned_queue(
    queue_id: int,
    db: Session,
    current_user,
):
    return require_owner(
        db=db,
        model=Queue,
        resource_id= id,
        owner_column=Queue.institution_id,
        current_user=current_user,
    )

def get_owned_user_profile(
    profile_id: int,
    db: Session,
    current_user,
):
    return require_owner(
        db=db,
        model=User,
        resource_id= id,
        owner_column=User.user_id,
        current_user=current_user,
    )

def get_owned_institution_profile(
    profile_id: int,
    db: Session,
    current_user,
):
    return require_owner(
        db=db,
        model=Institution,
        resource_id=id,
        owner_column=Institution.institution_id,
        current_user=current_user,
    )

def get_owned_notification(
    notification_id: int,
    db: Session,
    current_user,
):
    return require_owner(
        db=db,
        model=Notification,
        resource_id=id,
        owner_column=Notification.user_id,
        current_user=current_user,
    )

def get_owned_review(
    review_id: int,
    db: Session,
    current_user,
):
    return require_owner(
        db=db,
        model=Review,
        resource_id=review_id,
        owner_column=Review.user_id,
        current_user=current_user,
    )

def create_access_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXP_TIME)
    payload = {
        "id": user_id,
        "type": "access",
        "exp": expire
    }
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        settings.ALGORITHM
    )

def create_refresh_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXP_TIME)
    payload = {
        "id": user_id,
        "type": "refresh",
        "exp": expire
    }
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        settings.ALGORITHM
    )