from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.utils.database import Base
import enum
import uuid

class TokenStatus(enum.Enum):
    WAITING = "waiting"
    CALLED = "called"
    SERVED = "served"
    CANCELLED = "cancelled"
    MISSED = "missed"

class Token(Base):
    __tablename__ = "tokens"

    id = Column(Integer, 
               primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    queue_id = Column(
        String(36),
        ForeignKey("queues.id"),
        nullable=False
    )
    token_number = Column(
        Integer,
        nullable=False
    )
    status = Column(
        Enum(TokenStatus),
        default=TokenStatus.WAITING
    )
    booking_date = Column(
        DateTime,
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
    cancelled_at = Column(
        DateTime,
        nullable=True
    )

    # Relationships
    user = relationship(
        "User"
    )
    queue = relationship(
        "Queue",
        back_populates="tokens"
    )