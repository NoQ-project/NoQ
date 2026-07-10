from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True)

    full_name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    phone = Column(
        String(20),
        unique=True,
        nullable=True
    )

    password_hash = Column(
        String(255),
        nullable=False
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