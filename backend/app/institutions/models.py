from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.utils.database import Base


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True)
    
    name = Column(String(255), nullable=False)

    auth_user_id = Column(
        Integer,
        ForeignKey("usertable.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
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

    auth_user = relationship(
        "UserModel",
        back_populates="institution"
    )

    queues = relationship(
        "Queue",
        back_populates="institution",
        cascade="all, delete"
    )