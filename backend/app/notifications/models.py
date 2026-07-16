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

    id = Column(Integer, 
               primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    token_id = Column(
        Integer,
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