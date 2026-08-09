from sqlalchemy.orm import Session, joinedload
from backend.app.auth.models import UserModel, UserRole
from backend.app.queues.models import Queue
from backend.app.tokens.models import Token
from datetime import datetime, timedelta
from backend.app.user.models import User
from backend.app.institutions.models import Institution
from sqlalchemy import or_
from backend.app.admin.models import AuditLog


# =========================
# DASHBOARD
# =========================

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
        .filter(
            Queue.is_active.is_(True)
        )
        .count()
    )


def get_inactive_queues(db: Session):
    return (
        db.query(Queue)
        .filter(
            Queue.is_active.is_(False)
        )
        .count()
    )


def get_total_tokens(db: Session):
    return db.query(Token).count()


def get_today_tokens(db: Session):
    today = datetime.now().date()

    start = datetime.combine(
        today,
        datetime.min.time()
    )

    end = start + timedelta(days=1)

    return (
        db.query(Token)
        .filter(
            Token.created_at >= start,
            Token.created_at < end,
        )
        .count()
    )


# =========================
# USERS
# =========================

def get_users(
    db: Session,
    page: int,
    limit: int,
    search: str | None,
):
    query = (
        db.query(UserModel)
        .filter(
            UserModel.role == UserRole.USER
        )
    )

    if search:
        query = query.filter(
            or_(
                UserModel.name.ilike(
                    f"%{search}%"
                ),
                UserModel.email.ilike(
                    f"%{search}%"
                ),
            )
        )

    return (
        query
        .order_by(
            UserModel.created_at.desc()
        )
        .offset(
            (page - 1) * limit
        )
        .limit(limit)
        .all()
    )


def count_users(
    db: Session,
    search: str | None,
):
    query = (
        db.query(UserModel)
        .filter(
            UserModel.role == UserRole.USER
        )
    )

    if search:
        query = query.filter(
            or_(
                UserModel.name.ilike(
                    f"%{search}%"
                ),
                UserModel.email.ilike(
                    f"%{search}%"
                ),
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


# =========================
# INSTITUTIONS
# =========================

def get_institutions(
    db: Session,
    page: int,
    limit: int,
    search: str | None,
):
    query = (
        db.query(Institution)
        .options(
            joinedload(
                Institution.auth_user
            )
        )
        .join(UserModel)
        .filter(
            UserModel.role == UserRole.INSTITUTION
        )
    )

    if search:
        query = query.filter(
            or_(
                UserModel.name.ilike(
                    f"%{search}%"
                ),
                UserModel.email.ilike(
                    f"%{search}%"
                ),
            )
        )

    return (
        query
        .order_by(
            UserModel.created_at.desc()
        )
        .offset(
            (page - 1) * limit
        )
        .limit(limit)
        .all()
    )


def get_institution_by_id(
    db: Session,
    institution_id: int,
):
    return (
        db.query(Institution)
        .options(
            joinedload(
                Institution.auth_user
            ),
            joinedload(
                Institution.queues
            ),
        )
        .filter(
            Institution.id == institution_id
        )
        .first()
    )


# =========================
# QUEUES
# =========================

def get_queues(
    db: Session,
    page: int,
    limit: int,
    search: str | None,
):
    query = (
        db.query(Queue)
        .options(
            joinedload(
                Queue.institution
            )
        )
    )

    if search:
        query = query.filter(
            Queue.name.ilike(
                f"%{search}%"
            )
        )

    return (
        query
        .order_by(
            Queue.created_at.desc()
        )
        .offset(
            (page - 1) * limit
        )
        .limit(limit)
        .all()
    )


def get_queue_by_id(
    db: Session,
    queue_id: int,
):
    return (
        db.query(Queue)
        .options(
            joinedload(
                Queue.institution
            )
        )
        .filter(
            Queue.id == queue_id
        )
        .first()
    )


# =========================
# TOKENS
# =========================

def get_tokens(
    db: Session,
    page: int,
    limit: int,
):
    return (
        db.query(Token)
        .options(
            joinedload(Token.user),
            joinedload(Token.queue)
            .joinedload(
                Queue.institution
            ),
        )
        .order_by(
            Token.created_at.desc()
        )
        .offset(
            (page - 1) * limit
        )
        .limit(limit)
        .all()
    )


def get_token_by_id(
    db: Session,
    token_id: int,
):
    return (
        db.query(Token)
        .options(
            joinedload(Token.user),
            joinedload(Token.queue)
            .joinedload(
                Queue.institution
            ),
        )
        .filter(
            Token.id == token_id
        )
        .first()
    )


# =========================
# AUDIT LOGS
# =========================

def create_log(
    db: Session,
    admin_id: int,
    action: str,
    target_type: str,
    target_id: int,
    description: str | None = None,
):
    log = AuditLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        description=description,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def get_logs(
    db: Session,
    page: int,
    limit: int,
):
    return (
        db.query(AuditLog)
        .order_by(
            AuditLog.created_at.desc()
        )
        .offset(
            (page - 1) * limit
        )
        .limit(limit)
        .all()
    )


def count_logs(
    db: Session,
):
    return db.query(AuditLog).count()


def get_log_by_id(
    db: Session,
    log_id: int,
):
    return (
        db.query(AuditLog)
        .filter(
            AuditLog.id == log_id
        )
        .first()
    )