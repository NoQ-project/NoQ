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


def _redis_action(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except redis.exceptions.RedisError as exc:
        raise HTTPException(
            status_code=503,
            detail="Redis unavailable. Please try again later."
        ) from exc


def save_pending_registration(body, hashed_password):
    registration_data = {
        "username": body.username,
        "email": body.email,
        "hash_password": hashed_password,
        "role": body.role.value,
    }

    _redis_action(
        redis_client.setex,
        f"register:{body.email}",
        900,
        json.dumps(registration_data)
    )

def verify_registration(body):

    value = _redis_action(redis_client.get, f"register:{body.email}")
    if value is None:
        raise HTTPException(
            status_code=400,
            detail="Registration expired."
        )
    stored_otp = _redis_action(redis_client.get, f"register_otp:{body.email}")
    if stored_otp is None:
        raise HTTPException(status_code=400, detail="OTP expired.")
    if body.otp != stored_otp:
        raise HTTPException(status_code=401, detail="Incorrect OTP")
    _redis_action(redis_client.delete, f"register_otp:{body.email}")
    registration_data = json.loads(value)
    _redis_action(redis_client.delete, f"register:{body.email}")

    return registration_data

def store_and_send_otp(purpose: str,  bg_tasks: BackgroundTasks ,email: EmailStr):
    otp = f"{secrets.randbelow(1000000):06d}"
    _redis_action(
        redis_client.setex,
        f"{purpose}_otp:{email}",
        300,
        otp
    )
    bg_tasks.add_task(send_verification_email, email, otp)

def verified_user(purpose:str, email:EmailStr):
    _redis_action(
        redis_client.set,
        f"{purpose}_verified:{email}",
        "true",
        300
    )

def start_cooldown(key:str, seconds:int):
    _redis_action(
        redis_client.setex,
        key,
        seconds,
        "1"
    )

def check_cooldown(key:str):
    ttl = _redis_action(redis_client.ttl, key)
    if ttl > 0:
        raise HTTPException(status_code=429, detail=f"Please wait for {ttl} seconds")

def check_rate_limit(key: str, limit: int, window: int):
    count = _redis_action(redis_client.incr, key)
    if count == 1:
        _redis_action(redis_client.expire, key, window)
    if count > limit:
        ttl = _redis_action(redis_client.ttl, key)
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Try again in {ttl} seconds."
        )
    
