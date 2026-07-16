from fastapi import FastAPI
from backend.app.utils.database import Base, engine
from backend.app.auth.routes import auth_routes

from backend.app.institutions.routes import institution_routes

from backend.app.middleware.cors import setup_cors

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoQ API")
setup_cors(app)

app.include_router(auth_routes)

app.include_router(auth_routes)
app.include_router(institution_routes)
