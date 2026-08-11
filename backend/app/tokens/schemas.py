from pydantic import BaseModel, field_validator
from datetime import datetime, date

from backend.app.tokens.models import TokenStatus


def _clean_status(v):
    valid_values = {e.value for e in TokenStatus}
    if not v or v not in valid_values:
        return TokenStatus.CANCELLED
    return v


class BookTokenSchema(BaseModel):
    queue_id: int


class TokenResponseSchema(BaseModel):
    id: int
    user_id: int
    queue_id: int
    queue_name: str | None = None
    token_number: int
    status: TokenStatus
    booking_date: date | datetime
    estimated_time: datetime | None = None

    @field_validator('status', mode='before')
    @classmethod
    def validate_status(cls, v):
        return _clean_status(v)

    class Config:
        from_attributes = True


class TokenDetailSchema(BaseModel):
    id: int
    user_id: int
    queue_id: int
    queue_name: str | None = None
    token_number: int
    status: TokenStatus
    booking_date: date | datetime
    estimated_time: datetime | None = None
    created_at: datetime
    cancelled_at: datetime | None = None

    @field_validator('status', mode='before')
    @classmethod
    def validate_status(cls, v):
        return _clean_status(v)

    class Config:
        from_attributes = True

class WaitingPositionSchema(BaseModel):
    token_number: int
    waiting_position: int
    estimated_waiting_time: int
    estimated_service_time: datetime | None = None

    class Config:
        from_attributes = True

class CurrentTokenSchema(BaseModel):
    token_number: int
    status: TokenStatus

    @field_validator('status', mode='before')
    @classmethod
    def validate_status(cls, v):
        return _clean_status(v)

    class Config:
        from_attributes = True

class WaitingTokensSchema(BaseModel):
    token_number: int
    status: TokenStatus

    @field_validator('status', mode='before')
    @classmethod
    def validate_status(cls, v):
        return _clean_status(v)

    class Config:
        from_attributes = True


class AdvanceQueueResponseSchema(BaseModel):
    message: str
    completed_token: TokenDetailSchema | None = None
    serving_token: TokenDetailSchema | None = None

    class Config:
        from_attributes = True