<<<<<<< HEAD
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class QueueResponseSchema(BaseModel):
    id: int
    institution_id: int
    name: str
    description: str | None = None
    daily_limit: int
    avg_service_time: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QueueDetailSchema(BaseModel):
    id: int
    institution_id: int
    name: str
    description: str | None = None
    daily_limit: int
    avg_service_time: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
=======
>>>>>>> f4c3dca878710c3027b416ba91e7275d45219b3f
