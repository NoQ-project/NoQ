from pydantic import BaseModel
from datetime import datetime

from backend.app.tokens.models import TokenStatus


class BookTokenSchema(BaseModel):
    queue_id: str


class TokenResponseSchema(BaseModel):
    id: str
    user_id: str
    queue_id: str
    token_number: int
    status: TokenStatus
    booking_date: datetime
    estimated_time: datetime | None = None

    class Config:
        from_attributes = True


class TokenDetailSchema(BaseModel):
    id: str
    user_id: str
    queue_id: str
    token_number: int
    status: TokenStatus
    booking_date: datetime
    estimated_time: datetime | None = None
    created_at: datetime
    cancelled_at: datetime | None = None

    class Config:
        from_attributes = True