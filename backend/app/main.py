from fastapi import FastAPI
from backend.app.utils.database import Base, engine
from backend.app.auth.routes import auth_routes
<<<<<<< HEAD
=======
from backend.app.institutions.routes import institution_routes
from app.middleware.cors import setup_cors
>>>>>>> 4f9b53432e1d774541dd8f5c0da260e7ae6590b3

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoQ API")
setup_cors(app)

<<<<<<< HEAD
app.include_router(auth_routes)
=======
app.include_router(auth_routes)
app.include_router(institution_routes)
>>>>>>> 4f9b53432e1d774541dd8f5c0da260e7ae6590b3
