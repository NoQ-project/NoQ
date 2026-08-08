from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    Enum,
    UniqueConstraint,
    Date,
    Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.utils.database import Base
import enum


class TokenStatus(str, enum.Enum):
    WAITING = "WAITING"
    SERVING = "CALLED"
    COMPLETED = "COMPLETED"
    MISSED = "MISSED"
    CANCELLED = "CANCELLED"


class Token(Base):
    __tablename__ = "tokens"

    id = Column(
    Integer,
    primary_key=True,
    autoincrement=True
)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    queue_id = Column(
        Integer,
        ForeignKey("queues.id", ondelete="CASCADE"),
        nullable=False
    )
    token_number = Column(
        Integer,
        nullable=False
    )

    status = Column(
        Enum(TokenStatus),
        default=TokenStatus.WAITING,
        nullable=False
    )

    booking_date = Column(
        Date,
        nullable=False
    )

    estimated_time = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
    started_at = Column(
        DateTime,
        nullable=True
    )
    completed_at = Column(
        DateTime,
        nullable=True
    )
    missed_at = Column(
        DateTime,
        nullable=True
    )
    cancelled_at = Column(
        DateTime,
        nullable=True
    )
    user = relationship(
        "User",
        back_populates="tokens"
    )

    queue = relationship(
        "Queue",
        back_populates="tokens"
    )

    notifications = relationship(
        "Notification",
        back_populates="token"
    )

    __table_args__ = (
        UniqueConstraint(
            "queue_id",
            "booking_date",
            "token_number",
            name="uq_queue_date_token_number"
        ),

        Index(
            "ix_token_queue_date_status",
            "queue_id",
            "booking_date",
            "status"
        ),

        Index(
            "ix_token_user_status",
            "user_id",
            "status"
        ),
    )