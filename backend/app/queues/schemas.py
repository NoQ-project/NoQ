from pydantic import BaseModel
from datetime import datetime


class QueueResponseSchema(BaseModel):
    id: str
    institution_id: str
    name: str
    description: str | None = None
    daily_limit: int
    avg_service_time: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class QueueDetailSchema(BaseModel):
    id: str
    institution_id: str
    name: str
    description: str | None = None
    daily_limit: int
    avg_service_time: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True