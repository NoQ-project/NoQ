from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum

class User(Base):
    
    class UserRole(enum.Enum):
        USER = "user"
        INSTITUTION = "institution"
        ADMIN = "admin"

    role = Column(
            Enum(UserRole),
            default=UserRole.USER,
            nullable=False
        )

    password_hash = Column(
            String(255),
            nullable=False
        )