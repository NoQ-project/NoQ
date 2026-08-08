from pydantic import BaseModel, ConfigDict
from datetime import datetime, date


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