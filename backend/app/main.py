from fastapi import FastAPI

#from backend.app.utils.database import Base, engine
from backend.app.auth.routes import auth_routes
<<<<<<< HEAD
from backend.app.institutions.routes import institution_routes
from backend.app.queues.routes import queue_routes
#from backend.app.tokens.routes import token_routes
#Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoQ API")

# Authentication
app.include_router(auth_routes)

# Institution
app.include_router(institution_routes)

# Queue
app.include_router(queue_routes)

#token

#app.include_router(token_routes)
=======

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoQ API")

app.include_router(auth_routes)
>>>>>>> f4c3dca878710c3027b416ba91e7275d45219b3f
