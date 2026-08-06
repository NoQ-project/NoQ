from pydantic import BaseModel

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