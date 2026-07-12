from fastapi import FastAPI
from backend.app.database import Base, engine
from backend.app.models import *

app = FastAPI(title="NoQ API")
print("Known tables:", Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)
@app.get("/")
def root():
    return {"message": "NoQ API is running"}