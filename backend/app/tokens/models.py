from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Enum,
    UniqueConstraint,
    Date
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
        default=TokenStatus.WAITING
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
    cancelled_at = Column(
        DateTime,
        nullable=True
    )
    __table_args__ = (
        UniqueConstraint(
            "queue_id",
            "booking_date",
            "token_number",
            name="unique_daily_queue_token"
        ),
    )

    # Relationships
    user = relationship(
        "User",
        back_populates="tokens"
    )
    queue = relationship(
        "Queue",
        back_populates="tokens"
    )