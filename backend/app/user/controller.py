from sqlalchemy.orm import Session
from backend.app.user import service

def get_dashboard(
    db: Session,
    current_user,
):
    return service.get_dashboard(
        db=db,
        current_user=current_user,
    )