from redis import Redis
from backend.app.utils.settings import settings
import json
import secrets
import redis
from backend.app.utils.mail import send_verification_email
from fastapi import HTTPException
from pydantic import BaseModel, EmailStr

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True
)

def generate_otp():
    return f"{secrets.randbelow(1000000):06d}"

def save_pending_registration(body, hashed_password):
    registration_data = {
        "first_name": body.FirstName,
        "last_name": body.LastName,
        "email": body.email,
        "hash_password": hashed_password,
        "role": body.role.value,
    }
    key = f"register:{body.email}"

    redis_client.setex(
        f"register:{body.email}",
        600, 
        json.dumps(registration_data)
    )
    print("Saved:", key)
    print(redis_client.get(key))
    otp = generate_otp()
    redis_client.setex(
        f"verify_email:{body.email}",
        300,
        otp
    )
    return otp

def verify_registration(body):

    value = redis_client.get(f"register:{body.email}")
    if value is None:
        raise HTTPException(
            status_code=400,
            detail="Registration expired."
        )
    stored_otp= redis_client.get(f"verify_email:{body.email}")
    if stored_otp is None:
        raise HTTPException(status_code=400,detail="OTP expired.")
    if  body.otp != stored_otp:
        raise HTTPException(status_code=401, detail="Incorrect OTP")
    
    registration_data = json.loads(value)
    redis_client.delete(f"verify_email:{body.email}")
    redis_client.delete(f"register:{body.email}")

    return registration_data