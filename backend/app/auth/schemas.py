from pydantic import BaseModel, EmailStr
from backend.app.auth.models import UserRole
from typing import Annotated
from pydantic import BaseModel, StringConstraints

PasswordStr = Annotated[
    str,
    StringConstraints(min_length=8, max_length=20, strip_whitespace=True)
]

class RegisterSchema(BaseModel): 
    FirstName: str
    LastName: str
    role : UserRole
    email: EmailStr
    password: PasswordStr


class UserResponseSchema(BaseModel): 
    FirstName: str
    LastName: str
    id: int
    role: UserRole
    email: EmailStr

class LoginSchema(BaseModel): 
    email: EmailStr
    password: PasswordStr

class VerifyEmailSchema(BaseModel):
    email: EmailStr
    otp: str

class EmailSchema(BaseModel):
    email: EmailStr

class ResetPasswordSchema(BaseModel): 
    email: EmailStr
    new_password: PasswordStr
