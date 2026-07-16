<<<<<<< HEAD:backend/app/tokens_backup/schemas.py
from pydantic import BaseModel
from datetime import datetime

from backend.app.tokens_backup.models import TokenStatus


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
=======
>>>>>>> f4c3dca878710c3027b416ba91e7275d45219b3f:backend/app/tokens/schemas.py
