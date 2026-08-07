from sqlalchemy.orm import Session
import math
from fastapi import HTTPException, status
from . import repository
from .schemas import DashboardResponse, DashboardStats, UserSummary, UserListResponse, UserDetail, MessageResponse, InstitutionDetail, InstitutionListResponse, InstitutionSummary, InstitutionQueue, QueueDetail, QueueInstitution, QueueListResponse, QueueSummary, TokenSummary, TokenListResponse, TokenDetail, AuditLogListResponse, AuditLogSummary
from backend.app.tokens.models import Token
from datetime import datetime, timezone

def add_log(
    db: Session,
    admin_id: int,
    action: str,
    target_type: str,
    target_id: int,
    description: str | None = None,
):
    return repository.create_log(
        db=db,
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        description=description,
    )

def get_dashboard(db: Session) -> DashboardResponse:
    statistics = DashboardStats(
        total_users=repository.get_total_users(db),
        total_institutions=repository.get_total_institutions(db),
        total_queues=repository.get_total_queues(db),
        active_queues=repository.get_active_queues(db),
        inactive_queues=repository.get_inactive_queues(db),
        total_tokens=repository.get_total_tokens(db),
        today_tokens=repository.get_today_tokens(db),
    )
    return DashboardResponse(
        statistics=statistics
    )

def get_users(
    db: Session,
    page: int,
    limit: int,
    search: str | None,
):
    users = repository.get_users(
        db=db,
        page=page,
        limit=limit,
        search=search,
    )

    total = repository.count_users(
        db=db,
        search=search,
    )

    pages = math.ceil(total / limit) if total else 1

    return UserListResponse(
        items=[
            UserSummary(
                id=user.id,
                name=user.name,
                email=user.email,
                is_verified=user.is_verified,
                created_at=user.created_at,
            )
            for user in users
        ],
        page=page,
        limit=limit,
        total=total,
        pages=pages,
    )

def get_user(
    db: Session,
    user_id: int,
):
    user = repository.get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    profile = user.profile

    return UserDetail(
        id=user.id,
        first_name=user.FirstName,
        last_name=user.LastName,
        email=user.email,
        is_verified=user.is_verified,
        is_active=user.is_active,
        phone=profile.phone if profile else None,
        address=profile.address if profile else None,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )

def set_user_active_status(
    db: Session,
    user_id: int,
    is_active: bool,
    admin_id:int
):
    user = repository.get_user_by_id(
        db=db,
        user_id=user_id,
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    if user.is_active == is_active:
        state = "active" if is_active else "suspended"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is already {state}."
        )
    user.is_active = is_active
    db.commit()
    action = "activated" if is_active else "suspended"
    add_log(
        db=db,
        admin_id=user.id,
        action=f"{action} User",
        target_type="User",
        target_id=user.id,
        description=f"{action} user {user.id}",
    )
    return MessageResponse(
        message=f"User {action} successfully."
    )

def get_institutions(
    db: Session,
    page: int,
    limit: int,
    search: str | None,
):
    institutions = repository.get_institutions(
        db,
        page,
        limit,
        search,
    )
    total = repository.count_institutions(
        db,
        search,
    )
    return InstitutionListResponse(
        items=[
            InstitutionSummary(
                id=i.id,
                name=i.auth_user.name,
                email=i.auth_user.email,
                phone=i.phone,
                is_verified=i.auth_user.is_verified,
                is_active=i.auth_user.is_active,
                created_at=i.created_at,
            )
            for i in institutions
        ],
        page=page,
        limit=limit,
        total=total,
        pages=math.ceil(total / limit) if total else 1,
    )


def get_institution(
    db: Session,
    institution_id: int,
):
    institution = repository.get_institution_by_id(
        db,
        institution_id,
    )
    if institution is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found."
        )
    return InstitutionDetail(
        id=institution.id,
        name=institution.auth_user.name,
        email=institution.auth_user.email,
        phone=institution.phone,
        address=institution.address,
        website=institution.website,
        description=institution.description,
        is_verified=institution.auth_user.is_verified,
        is_active=institution.auth_user.is_active,
        created_at=institution.created_at,
        updated_at=institution.updated_at,
        queues=[
                InstitutionQueue(
                    id=queue.id,
                    name=queue.name,
                    daily_limit=queue.daily_limit,
                    avg_service_time=queue.avg_service_time,
                    is_active=queue.is_active,
                )
                for queue in institution.queues
            ]
    )

def get_queues(
    db: Session,
    page: int,
    limit: int,
    search: str | None,
):
    queues = repository.get_queues(
        db,
        page,
        limit,
        search
    )
    total = repository.count_queues(
        db,
        search
    )
    return QueueListResponse(
        items=[
            QueueSummary(
                id=q.id,
                name=q.name,
                institution_name=q.institution.name,
                daily_limit=q.daily_limit,
                avg_service_time=q.avg_service_time,
                is_active=q.is_active,
                created_at=q.created_at
            )
            for q in queues
        ],
        page=page,
        limit=limit,
        total=total,
        pages=math.ceil(total / limit) if total else 1
    )


def get_queue(
    db: Session,
    queue_id: int,
):
    queue = repository.get_queue_by_id(
        db,
        queue_id
    )
    if queue is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue not found."
        )
    return QueueDetail(
        id=queue.id,
        name=queue.name,
        description=queue.description,
        daily_limit=queue.daily_limit,
        avg_service_time=queue.avg_service_time,
        is_active=queue.is_active,
        created_at=queue.created_at,
        updated_at=queue.updated_at,
        institution=QueueInstitution(
            id=queue.institution.id,
            name=queue.institution.name
        )
    )


def change_queue_status(
    db: Session,
    queue_id: int,
    is_active: bool,
    admin_id: int
):
    queue = repository.get_queue_by_id(
        db,
        queue_id
    )
    if queue is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue not found."
        )
    if queue.is_active == is_active:
        state = "active" if is_active else "inactive"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Queue is already {state}."
        )
    queue.is_active = is_active
    db.commit()
    action = "activated" if is_active else "deactivated"
    add_log(
            db=db,
            admin_id=admin_id,
            action= f"{action} queue",
            target_type="Queue",
            target_id=queue.id,
            description=f"{action} queue {queue.id}",
        )
    return MessageResponse(
        message=f"Queue {action} successfully."
    )

def get_tokens(
    db: Session,
    page: int,
    limit: int
):
    tokens = repository.get_tokens(
        db,
        page,
        limit
    )
    total = repository.count_tokens(db)
    return TokenListResponse(
        items=[
            TokenSummary(
                id=t.id,
                token_number=t.token_number,
                user_name=t.user.full_name,
                user_phone=t.user.phone,
                queue_name=t.queue.name,
                institution_name=t.queue.institution.name,
                status=t.status.value,
                booking_date=t.booking_date,
                created_at=t.created_at
            )
            for t in tokens
        ],
        page=page,
        limit=limit,
        total=total,
        pages=math.ceil(total / limit)
    )

def get_token(
    db: Session,
    token_id: int
):
    token = repository.get_token_by_id(
        db,
        token_id
    )
    if token is None:
        raise HTTPException(
            status_code=404,
            detail="Token not found"
        )
    return TokenDetail(
        id=token.id,
        token_number=token.token_number,
        user_name=token.user.full_name,
        user_phone=token.user.phone,
        queue_name=token.queue.name,
        institution_name=token.queue.institution.name,
        status=token.status.value,
        booking_date=token.booking_date,
        estimated_time=token.estimated_time,
        created_at=token.created_at,
        cancelled_at=token.cancelled_at
    )

def cancel_token(
    db: Session,
    token_id: int,
    admin_id: int
):
    token = repository.get_token_by_id(
        db,
        token_id
    )
    if token is None:
        raise HTTPException(
            status_code=404,
            detail="Token not found"
        )
    if token.status == Token.CANCELLED:
        raise HTTPException(
            status_code=400,
            detail="Token already cancelled"
        )
    token.status = Token.CANCELLED
    token.cancelled_at = datetime.now(
        timezone.utc
    )
    db.commit()
    add_log(
        db=db,
        admin_id= admin_id,
        action="Cancel Token",
        target_type="Token",
        target_id=Token.id,
        description=f"Cancelled Token{Token.id}",
    )
    return MessageResponse(
        message="Token cancelled successfully"
    )


def get_logs(
    db,
    page,
    limit,
):
    logs = repository.get_logs(
        db,
        page,
        limit,
    )
    total = repository.count_logs(db)
    return AuditLogListResponse(
        items=[
            AuditLogSummary(
                id=log.id,
                admin_id=log.admin_id,
                action=log.action,
                target_type=log.target_type,
                target_id=log.target_id,
                description=log.description,
                created_at=log.created_at,
            )
            for log in logs
        ],
        page=page,
        limit=limit,
        total=total,
        pages=math.ceil(total / limit) if total else 1,
    )


def get_log(
    db,
    log_id,
):
    log = repository.get_log_by_id(
        db,
        log_id,
    )
    if log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found.",
        )
    return AuditLogSummary(
        id=log.id,
        admin_id=log.admin_id,
        action=log.action,
        target_type=log.target_type,
        target_id=log.target_id,
        description=log.description,
        created_at=log.created_at,
    )