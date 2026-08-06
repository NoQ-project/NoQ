from pydantic import BaseModel
from datetime import datetime, date


class DashboardStats(BaseModel):
    total_users: int
    total_institutions: int
    total_queues: int
    active_queues: int
    inactive_queues: int
    total_tokens: int
    today_tokens: int

class DashboardResponse(BaseModel):
    statistics: DashboardStats

class UserSummary(BaseModel):
    id: int
    name: str
    email: str
    is_verified: bool
    created_at: datetime

class UserListResponse(BaseModel):
    items: list[UserSummary]
    page: int
    limit: int
    total: int
    pages: int

class UserDetail(BaseModel):
    id: int
    name: str
    email: str
    is_verified: bool
    is_active: bool
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime

class MessageResponse(BaseModel):
    message: str

class InstitutionSummary(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    is_verified: bool
    is_active: bool
    created_at: datetime

class InstitutionListResponse(BaseModel):
    items: list[InstitutionSummary]
    page: int
    limit: int
    total: int
    pages: int

class InstitutionQueue(BaseModel):
    id: int
    name: str
    daily_limit: int
    avg_service_time: int
    is_active: bool

class InstitutionDetail(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    address: str
    website: str | None
    description: str | None
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    queues: list[InstitutionQueue]

class QueueSummary(BaseModel):
    id: int
    name: str
    institution_name: str
    daily_limit: int
    avg_service_time: int
    is_active: bool
    created_at: datetime

class QueueListResponse(BaseModel):
    items: list[QueueSummary]
    page: int
    limit: int
    total: int
    pages: int

class QueueInstitution(BaseModel):
    id: int
    name: str

class QueueDetail(BaseModel):
    id: int
    name: str
    description: str | None
    daily_limit: int
    avg_service_time: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    institution: QueueInstitution

class TokenSummary(BaseModel):
    id: int
    token_number: int
    user_name: str
    user_phone: str | None
    queue_name: str
    institution_name: str
    status: str
    booking_date: date
    created_at: datetime

class TokenListResponse(BaseModel):
    items: list[TokenSummary]
    page: int
    limit: int
    total: int
    pages: int

class TokenDetail(BaseModel):
    id: int
    token_number: int
    user_name: str
    user_phone: str | None
    queue_name: str
    institution_name: str
    status: str
    booking_date: date
    estimated_time: datetime | None
    created_at: datetime
    cancelled_at: datetime | None