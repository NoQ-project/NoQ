from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from backend.app.utils.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer , primary_key=True)
    full_name = Column(
        String(100),
        nullable=False
    )
    auth_id = Column(
       Integer,
        ForeignKey("usertable.id"),
        nullable=False
    )
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    phone = Column(
        String(10),
        unique=True,
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