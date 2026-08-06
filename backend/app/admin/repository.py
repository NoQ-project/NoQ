from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel
from backend.app.queues.models import Queue
from backend.app.tokens.models import Token
from backend.app.auth.models import UserRole
from datetime import datetime, timedelta
from backend.app.user.models import User
from backend.app.institutions.models import Institution

def get_total_users(db: Session):

    return (
        db.query(UserModel)
        .filter(UserModel.role == UserRole.USER)
        .count()
    )

def get_total_institutions(db: Session):
    return (
            db.query(UserModel)
            .filter(UserModel.role == UserRole.INSTITUTION)
            .count()
        )

def get_total_queues(db: Session):
    return db.query(Queue).count()

def get_active_queues(db: Session):
    return (
        db.query(Queue)
        .filter(Queue.is_active.is_(True))
        .count()
    )

def get_total_tokens(db: Session):
    return db.query(Token).count()

def get_today_tokens(db: Session):
    today = datetime.now().date()

    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)

    return (
        db.query(Token)
        .filter(
            Token.created_at >= start,
            Token.created_at < end,
        )
        .count()
    )


import math

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth.models import UserModel, UserRole


def get_users(
    db: Session,
    page: int,
    limit: int,
    search: str | None,
):
    query = (
        db.query(UserModel)
        .filter(UserModel.role == UserRole.USER)
    )

    if search:
        query = query.filter(
            or_(
                UserModel.name.ilike(f"%{search}%"),
                UserModel.email.ilike(f"%{search}%"),
            )
        )

    return (
        query.order_by(UserModel.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )


def count_users(
    db: Session,
    search: str | None,
):
    query = (
        db.query(UserModel)
        .filter(UserModel.role == UserRole.USER)
    )

    if search:
        query = query.filter(
            or_(
                UserModel.name.ilike(f"%{search}%"),
                UserModel.email.ilike(f"%{search}%"),
            )
        )
    return query.count()

def get_user_by_id(
    db: Session,
    user_id: int,
):
    return (
        db.query(UserModel)
        .filter(
            UserModel.id == user_id,
            UserModel.role == UserRole.USER,
        )
        .first()
    )

