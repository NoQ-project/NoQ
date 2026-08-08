from fastapi import FastAPI

from backend.app.utils.database import Base, engine
from backend.app.auth.routes import auth_routes
from backend.app.admin.routes import admin_routes
from backend.app.institutions.routes import institution_routes
from backend.app.institutions.routes import institution_routes
from backend.app.queues.routes import queue_routes
from backend.app.tokens.routes import token_routes
from backend.app.user.routes import user_routes
from backend.app.notifications.routes import notification_routes
from backend.app.middleware.cors import setup_cors

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoQ API")
setup_cors(app)

app.include_router(auth_routes)
app.include_router(admin_routes)
app.include_router(institution_routes)
app.include_router(queue_routes)
app.include_router(token_routes)
app.include_router(user_routes)
app.include_router(notification_routes)