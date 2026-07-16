from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from datetime import datetime, timezone
from sqlalchemy.sql import func
from backend.app.utils.database import Base
import enum

class UserRole(enum.Enum):
        USER = "user"
        INSTITUTION = "institution"
        ADMIN = "admin"

class UserModel(Base):
    __tablename__ = "usertable"
    id = Column(Integer, 
               primary_key=True)
    role = Column(
            Enum(UserRole),
            default=UserRole.USER,
            nullable=False
        )
    FirstName = Column(String(20))
    LastName= Column(String(20))
    email = Column(String(50),
                   unique=True)
    password_hash = Column(
            String(255),
            nullable=False
    )
    password_changed_at = Column(DateTime, nullable=True)
    is_verified = Column(Boolean)

class RefreshTokenModel(Base):
    __tablename__ = "refresh_tokens"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    token = Column(
        String(500),
        nullable=False,
        unique=True,
        index=True
    )
    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )
    revoked = Column(
        Boolean,
        default=False,
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )