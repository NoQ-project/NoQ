from redis import Redis
from backend.app.utils.settings import settings
import json
import secrets
import redis
from backend.app.utils.mail import send_verification_email
from fastapi import HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True
)

# def generate_otp():
#     return f"{secrets.randbelow(1000000):06d}"

def save_pending_registration(body, hashed_password):
    registration_data = {
        "first_name": body.FirstName,
        "last_name": body.LastName,
        "email": body.email,
        "hash_password": hashed_password,
        "role": body.role.value,
    }

    redis_client.setex(
        f"register:{body.email}",
        900, 
        json.dumps(registration_data)
    )
   
    # otp = generate_otp()
    # redis_client.setex(
    #     f"verify_email:{body.email}",
    #     300,
    #     otp
    # )
    # return registration_data

def verify_registration(body):

    value = redis_client.get(f"register:{body.email}")
    if value is None:
        raise HTTPException(
            status_code=400,
            detail="Registration expired."
        )
    stored_otp= redis_client.get(f"otp:{body.email}")
    if stored_otp is None:
        raise HTTPException(status_code=400,detail="OTP expired.")
    if  body.otp != stored_otp:
        raise HTTPException(status_code=401, detail="Incorrect OTP")
    
    registration_data = json.loads(value)
    redis_client.delete(f"verify_email:{body.email}")
    redis_client.delete(f"register:{body.email}")

    return registration_data

async def store_and_send_otp(email: str, bg_tasks: BackgroundTasks):
    otp = f"{secrets.randbelow(1000000):06d}"
    await redis.setex(
        f"otp:{email}",
        300,
        otp
    )
    bg_tasks.add_task(send_verification_email, email, otp)

async def start_cooldown(key:str, seconds:int):
    await redis.setx(key, seconds,"1")

async def check_cooldown(key:str):
    ttl = await redis.ttl(key)
    if ttl > 0:
        raise HTTPException(status_code=429, detail= f"Please wait for {ttl} seconds" )

async def check_rate_limit(key: str, limit: int, window: int):
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, window)
    if count > limit:
        ttl = await redis.ttl(key)
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Try again in {ttl} seconds."
        )