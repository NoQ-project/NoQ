from pydantic import BaseModel
from datetime import datetime


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