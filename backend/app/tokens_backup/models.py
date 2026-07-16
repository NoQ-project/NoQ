from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.utils.database import Base
import enum


class TokenStatus(enum.Enum):
    WAITING = "waiting"
    CALLED = "called"
    SERVED = "served"
    CANCELLED = "cancelled"
    MISSED = "missed"


class Token(Base):
    __tablename__ = "tokens"

<<<<<<< HEAD:backend/app/tokens_backup/models.py
    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("usertable.id"),
=======
    id = Column(Integer, 
               primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
>>>>>>> f4c3dca878710c3027b416ba91e7275d45219b3f:backend/app/tokens/models.py
        nullable=False
    )

    queue_id = Column(
        Integer,
        ForeignKey("queues.id"),
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
        "UserModel"
    )

    queue = relationship(
        "Queue",
        back_populates="tokens"
    )