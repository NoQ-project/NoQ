from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.utils.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer , primary_key=True)

    auth_user_id = Column(
        Integer,
        ForeignKey("usertable.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    address = Column(
        String(255),
        nullable=True
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

    auth_user= relationship(
        "UserModel",
        back_populates="profile"
    )