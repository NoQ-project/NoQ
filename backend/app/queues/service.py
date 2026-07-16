from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.queues.models import Queue


def get_queues_by_institution(
    institution_id: int,
    db: Session
):
    queues = (
        db.query(Queue)
        .filter(
            Queue.institution_id == institution_id,
            Queue.is_active == True
        )
        .all()
    )

    return queues


def get_queue_by_id(
    queue_id: int,
    db: Session
):
    queue = (
        db.query(Queue)
        .filter(Queue.id == queue_id)
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue not found."
        )

    return queue