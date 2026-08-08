from sqlalchemy.orm import Session
from backend.app.tracking import service

def get_token_tracking_controller(
    token_id: int,
    user_id: int,
    db: Session
):
    return service.get_token_tracking(
        token_id=token_id,
        user_id=user_id,
        db=db
    )