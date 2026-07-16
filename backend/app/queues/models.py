from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.utils.database import Base
import uuid

class Queue(Base):
    __tablename__ = "queues"

    id = Column(Integer, 
               primary_key=True)
    institution_id = Column(
        String(36),
        ForeignKey("institutions.id"),
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