from pydantic import BaseModel
from datetime import date

class ActiveTokenResponse(BaseModel):
    token_id: int
    token_number: int
    status: str
    queue_id: int
    queue_name: str
    booking_date: date

class BookingHistoryResponse(BaseModel):
    token_id: int
    token_number: int
    status: str
    queue_id: int
    queue_name: str
    booking_date: date

class UserDashboardResponse(BaseModel):
    active_tokens: list[ActiveTokenResponse]
    booking_history: list[BookingHistoryResponse]
    unread_notifications: int