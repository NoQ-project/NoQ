from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Boolean,
    Enum,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.utils.database import Base
import enum
import uuid

class NotificationType(enum.Enum):
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"

class NotificationStatus(enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    READ = "read"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    user_id = Column(
        String(36),
        ForeignKey("users.id"),
        nullable=False
    )
    token_id = Column(
        String(36),
        ForeignKey("tokens.id"),
        nullable=True
    )
    type = Column(
        Enum(NotificationType),
        nullable=False
    )
    status = Column(
        Enum(NotificationStatus),
        default=NotificationStatus.PENDING
    )
    title = Column(
        String(255),
        nullable=False
    )
    message = Column(
        Text,
        nullable=False
    )
    is_read = Column(
        Boolean,
        default=False
    )
    created_at = Column(
        DateTime,
        server_default=func.now()
    )
    sent_at = Column(
        DateTime,
        nullable=True
    )

    # Relationships
    user = relationship(
        "User"
    )
    token = relationship(
        "Token"
    )