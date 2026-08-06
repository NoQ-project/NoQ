from sqlalchemy.orm import Session
from backend.app.auth.models import usertable
from backend.app.queues.models import Queue
from backend.app.tokens.models import Token
from backend.app.auth.models import UserRole
from datetime import datetime, timedelta
from backend.app.user.models import User
from backend.app.institutions.models import Institution

def get_total_users(db: Session):

    return (
        db.query(usertable)
        .filter(usertable.role == UserRole.USER)
        .count()
    )

def get_total_institutions(db: Session):
    return (
            db.query(usertable)
            .filter(usertable.role == UserRole.INSTITUTION)
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
