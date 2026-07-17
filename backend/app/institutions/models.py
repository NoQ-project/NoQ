from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.utils.database import Base
import uuid


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    name = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    address = Column(
        Text,
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=True
    )

    email = Column(
        String(255),
        unique=True,
        nullable=True
    )

    website = Column(
        String(255),
        nullable=True
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
    queues = relationship(
        "Queue",
        back_populates="institution",
        cascade="all, delete"
    )