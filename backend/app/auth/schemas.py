from pydantic import BaseModel, EmailStr
from backend.app.auth.models import UserRole
from typing import Annotated
from pydantic import BaseModel, StringConstraints

PasswordStr = Annotated[
    str,
    StringConstraints(min_length=8, max_length=20, strip_whitespace=True)
]

class RegisterSchema(BaseModel): 
    username: str
    role: UserRole = UserRole.USER
    email: EmailStr
    password: PasswordStr


class UserResponseSchema(BaseModel):
    name: str
    id: int
    role: UserRole
    email: EmailStr
    phone: str | None = None
    address: str | None = None

    @classmethod
    def from_user_model(cls, user):
        return cls(
            name=user.name,
            id=user.id,
            role=user.role,
            email=user.email,
            phone=user.profile.phone if user.profile else None,
            address=user.profile.address if user.profile else None,
        )

    class Config:
        from_attributes = True

class LoginSchema(BaseModel): 
    email: EmailStr
    password: PasswordStr

class VerifyEmailSchema(BaseModel):
    email: EmailStr
    otp: str

class VerifyRegistrationSchema(BaseModel):
    email: EmailStr
    otp: str
    address: str | None = None
    phone: str | None = None
    institution_name: str | None = None
    description: str | None = None
    website: str | None = None

class EmailSchema(BaseModel):
    email: EmailStr

class ResetPasswordSchema(BaseModel): 
    email: EmailStr
    new_password: PasswordStr


class UpdateProfileSchema(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
