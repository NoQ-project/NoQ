from pydantic import BaseModel, EmailStr
from backend.app.auth.models import UserRole


class RegisterSchema(BaseModel): 
    FirstName: str
    LastName: str
    role : UserRole
    email: EmailStr
    password: str


class UserResponseSchema(BaseModel): 
    FirstName: str
    LastName: str
    id: int
    email: EmailStr

class LoginSchema(BaseModel): 
    email: EmailStr
    password: str