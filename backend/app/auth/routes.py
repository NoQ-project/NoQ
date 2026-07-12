from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from backend.app.auth.schemas import UserResponseSchema, RegisterSchema, LoginSchema
from backend.app.auth import controller
from backend.app.utils.database import get_db

auth_routes = APIRouter(prefix="/auth") 

@auth_routes.post("/register", response_model= UserResponseSchema, status_code=status.HTTP_201_CREATED)
def register(body:RegisterSchema, db:Session= Depends(get_db)):
    return controller.register(body, db)

@auth_routes.post("/login",status_code=status.HTTP_200_OK)
def login(body: LoginSchema, db:Session = Depends(get_db)):
    return controller.login_user(body, db)