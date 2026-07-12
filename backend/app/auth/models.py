from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
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