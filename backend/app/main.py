from fastapi import FastAPI
from backend.app.utils.database import Base, engine
from backend.app.auth.routes import auth_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoQ API")

app.include_router(auth_routes)