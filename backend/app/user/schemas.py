from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserResponseSchema(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UpdateUserSchema(BaseModel):
    full_name: str
    phone: str | None = None


class UserDetailSchema(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True