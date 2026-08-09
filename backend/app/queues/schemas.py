from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
from backend.app.queues.models import QueueStatus


class QueueCreateSchema(BaseModel):
    name: str
    description: str | None = None
    daily_limit: int
    avg_service_time: int = 10


class QueueUpdateSchema(BaseModel):
    name: str
    description: str | None = None
    daily_limit: int
    avg_service_time: int
    is_active: bool

class QueueResponseSchema(BaseModel):
    id: int
    institution_id: int
    name: str
    description: str | None = None
    daily_limit: int
    avg_service_time: int
    is_active: bool
    status: QueueStatus
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
    status: QueueStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Queue Dashboard Schemas

class QueueStatisticsSchema(BaseModel):
    total_tokens: int
    waiting: int
    currently_serving: int
    served: int
    missed: int
    cancelled: int


class QueueDashboardSchema(BaseModel):
    queue_id: int
    queue_name: str
    description: str | None = None
    daily_limit: int
    avg_service_time: int
    is_active: bool
    statistics: QueueStatisticsSchema


class DailyQueueStatisticsSchema(BaseModel):
    date: date
    total_tokens: int
    waiting: int
    currently_serving: int
    served: int
    missed: int
    cancelled: int


class QueueStatisticsRangeSchema(BaseModel):
    queue_id: int
    queue_name: str
    start_date: date
    end_date: date
    daily_statistics: list[DailyQueueStatisticsSchema]

class QueueStatusToggleRequest(BaseModel):
    reason: str | None = Field(
        default=None,
        max_length=500,
    )


class QueueStatusResponse(BaseModel):
    queue_id: int
    is_active: bool
    pause_reason: str | None
    paused_at: datetime | None
    message: str

class QueueTrackingResponse(BaseModel):
    queue_id: int
    is_active: bool
    pause_reason: str | None
    current_token_number: int | None
    waiting_count: int