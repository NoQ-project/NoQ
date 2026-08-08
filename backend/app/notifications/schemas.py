from datetime import datetime
from pydantic import BaseModel
from app.notifications.models import NotificationType

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    queue_id: int
    token_id: int | None
    type: NotificationType
    title: str
    message: str
    is_read: bool
    action: str | None
    threshold: int | None
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationMessageResponse(BaseModel):
    message: str