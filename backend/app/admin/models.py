from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer
from sqlalchemy.sql import func
from backend.app.utils.database import Base
import uuid


class Review(Base):

    __tablename__ = "audit_logs"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    auth_id = Column(
       Integer,
        ForeignKey("usertable.id"),
        nullable=False
    )
    action = Column(
        String(100),
        nullable=False
    )
    description = Column(
        Text,
        nullable=True
    )
    created_at = Column(
        DateTime,
        server_default=func.now()
    )