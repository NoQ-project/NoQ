from pydantic import BaseModel
from datetime import datetime

from backend.app.tokens.models import TokenStatus


class BookTokenSchema(BaseModel):
    queue_id: int


class TokenResponseSchema(BaseModel):
    id: int
    user_id: int
    queue_id: int
    token_number: int
    status: TokenStatus
    booking_date: datetime
    estimated_time: datetime | None = None

    class Config:
        from_attributes = True


class TokenDetailSchema(BaseModel):
    id: int
    user_id: int
    queue_id: int
    token_number: int
    status: TokenStatus
    booking_date: datetime
    estimated_time: datetime | None = None
    created_at: datetime
    cancelled_at: datetime | None = None

    class Config:
        from_attributes = True

class WaitingPositionSchema(BaseModel):

    token_number: int
    waiting_position: int
    estimated_waiting_time: int

    class Config:
        from_attributes = True

class CurrentTokenSchema(BaseModel):
    token_number: int
    status: TokenStatus

    class Config:
        from_attributes = True

class WaitingTokensSchema(BaseModel):
    token_number: int
    status: TokenStatus

    class Config:
        from_attributes = True