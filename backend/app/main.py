from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.app.utils.database import Base, engine
from backend.app.auth.routes import auth_routes
from backend.app.admin.routes import admin_routes
from backend.app.institutions.routes import institution_routes
from backend.app.queues.routes import queue_routes
from backend.app.tokens.routes import token_routes
from backend.app.user.routes import user_routes
from backend.app.notifications.routes import notification_routes
from backend.app.tracking.routes import tracking_routes
from backend.app.middleware.cors import setup_cors

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoQ API")

# Setup CORS middleware
setup_cors(app)


# Root health-check route
@app.get("/")
def root():
    return {
        "status": "success",
        "message": "NoQ Backend is running!"
    }


# Fallback exception handler to guarantee CORS headers on 500 errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )


# Include API Routers
app.include_router(auth_routes)
app.include_router(admin_routes)
app.include_router(institution_routes)
app.include_router(queue_routes)
app.include_router(token_routes)
app.include_router(user_routes)
app.include_router(notification_routes)
app.include_router(tracking_routes)