from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Time, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.utils.database import Base
from enum import Enum


class QueueStatus(str, Enum):
    OPEN = "OPEN"
    PAUSED = "PAUSED"
    CLOSED = "CLOSE"

class Queue(Base):
    __tablename__ = "queues"

    id = Column(Integer,
            primary_key=True)

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(
        String(100),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    daily_limit = Column(
        Integer,
        nullable=False
    )

    avg_service_time = Column(
        Integer,
        default=10
    )

    # average time in minutes
    is_active = Column(
        Boolean,
        default=True
    )
    status = Column(
        Enum(QueueStatus),
        nullable=False,
        default=QueueStatus.CLOSED,
        index=True
    )
    pause_reason = Column(
        Text,
        nullable=True
    )
    current_serving_token_id = Column(
        Integer,
        nullable=True,
        index=True
    )
    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    institution = relationship(
        "Institution",
        back_populates="queues"
    )

    tokens = relationship(
        "Token",
        back_populates="queue",
        cascade="all, delete"
    )
    working_hours = relationship(
        "QueueWorkingHour",
        back_populates="queue",
        cascade="all, delete-orphan"
    )

class QueueWorkingHour(Base):
    __tablename__ = "queue_working_hours"

    id = Column(
        Integer,
        primary_key=True
    )

    queue_id = Column(
        Integer,
        ForeignKey(
            "queues.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    day_of_week = Column(
        Integer,
        nullable=False
    )

    opening_time = Column(
        Time,
        nullable=False
    )

    closing_time = Column(
        Time,
        nullable=False
    )

    queue = relationship(
        "Queue",
        back_populates="working_hours"
    )

    __table_args__ = (
        CheckConstraint(
            "day_of_week BETWEEN 0 AND 6",
            name="check_valid_day_of_week"
        ),
    )