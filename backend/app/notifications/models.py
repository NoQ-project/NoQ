from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Boolean,
    Enum,
    ForeignKey,
    Integer
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.utils.database import Base
import enum

class NotificationType(str, enum.Enum):
    QUEUE_UPDATE = "QUEUE_UPDATE"
    APPROACHING_TURN = "APPROACHING_TURN"
    YOUR_TURN = "YOUR_TURN"
    MISSED = "MISSED"
    CANCELLED = "CANCELLED"
    SYSTEM = "SYSTEM"

class NotificationStatus(enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, 
               primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    token_id = Column(
        Integer,
        ForeignKey("tokens.id", ondelete="CASCADE"),
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
        "User",
        back_populates="notifications"
    )

    token = relationship(
        "Token",
        back_populates="notifications"
    )