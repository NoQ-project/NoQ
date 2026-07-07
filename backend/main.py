from fastapi import FastAPI
from database import Base, engine
from models import *

app = FastAPI(title="NoQ API")
print("Known tables:", Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)
@app.get("/")
def root():
    return {"message": "NoQ API is running"}