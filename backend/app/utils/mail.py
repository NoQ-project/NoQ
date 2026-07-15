from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr, BaseModel
from typing import List
from backend.app.auth.models import UserModel
from backend.app.utils.settings import settings

class EmailSchema(BaseModel):
    email: EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME = settings.MAIL_USERNAME,
    MAIL_PASSWORD = settings.MAIL_PASSWORD,
    MAIL_FROM = settings.MAIL_FROM,
    MAIL_PORT = settings.MAIL_PORT,
    MAIL_SERVER = settings.MAIL_SERVER,
    MAIL_FROM_NAME= settings.MAIL_FROM_NAME,
    MAIL_STARTTLS = settings.MAIL_STARTTLS,
    MAIL_SSL_TLS = settings.MAIL_SSL_TLS,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

fm = FastMail(conf)
async def send_verification_email(email:EmailStr, otp: str):
    html = f"""
<!DOCTYPE html>
<html>
<body>
    <h2>Email Verification</h2>

    <p>Your OTP is:</p>

    <h1>{otp}</h1>

    <p>This OTP expires in 5 minutes.</p>
</body>
</html>"""
    message = MessageSchema(
        subject="Verify Your Email",
        recipients = [email],
        body=html,
        subtype=MessageType.html)

    await fm.send_message(message)
    



