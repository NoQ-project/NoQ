from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from backend.app.utils.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(
        Integer,
        primary_key=True
    )
    admin_id = Column(
        Integer,
        ForeignKey("usertable.id"),
        nullable=False
    )
    action = Column(
        String(100),
        nullable=False
    )
    target_type = Column(
        String(50),
        nullable=False
    )
    target_id = Column(
        Integer,
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