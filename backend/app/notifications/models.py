from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Boolean,
    Enum,
    ForeignKey,
    Integer,
    Index,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.utils.database import Base
import enum

class NotificationType(str, enum.Enum):
    QUEUE_PAUSED = "QUEUE_PAUSED"
    QUEUE_RESUMED = "QUEUE_RESUMED"

    PEOPLE_AHEAD_THRESHOLD = "PEOPLE_AHEAD_THRESHOLD"

    YOUR_TURN = "YOUR_TURN"

    TOKEN_COMPLETED = "TOKEN_COMPLETED"
    TOKEN_MISSED = "TOKEN_MISSED"

    TOKEN_CANCELLED = "TOKEN_CANCELLED"
    TOKEN_BOOKED = "TOKEN_BOOKED"

class NotificationStatus(enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    queue_id = Column(
        Integer,
        ForeignKey(
            "queues.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    token_id = Column(
        Integer,
        ForeignKey(
            "tokens.id",
            ondelete="CASCADE",
        ),
        nullable=True,
    )

    type = Column(
        Enum(NotificationType),
        nullable=False,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    message = Column(
        Text,
        nullable=False,
    )

    is_read = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    action = Column(
        String(50),
        nullable=True,
    )

    threshold = Column(
        Integer,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="notifications",
    )

    queue = relationship(
        "Queue"
    )

    token = relationship(
        "Token",
        back_populates="notifications",
    )

    __table_args__ = (
        UniqueConstraint(
            "token_id",
            "type",
            "threshold",
            name="uq_notification_token_type_threshold",
        ),
        Index(
            "ix_notification_user_read",
            "user_id",
            "is_read",
        ),
        Index(
            "ix_notification_user_created",
            "user_id",
            "created_at",
        ),
    )
    

