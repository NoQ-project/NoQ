from datetime import date
from sqlalchemy.orm import Session

from backend.app.queues import service


def create_queue(
    queue,
    db: Session
):
    return service.create_queue(
        queue=queue,
        db=db
    )


def update_queue(
    queue_id: int,
    queue,
    db: Session
):
    return service.update_queue(
        queue_id=queue_id,
        queue=queue,
        db=db
    )


def delete_queue(
    queue_id: int,
    db: Session
):
    return service.delete_queue(
        queue_id=queue_id,
        db=db
    )


def get_queue_details(
    queue_id: int,
    db: Session
):
    return service.get_queue_by_id(
        queue_id=queue_id,
        db=db
    )


def toggle_queue_status(
    queue_id: int,
    db: Session
):
    return service.toggle_queue_status(
        queue_id=queue_id,
        db=db
    )

# QUEUE DASHBOARD

def get_queue_dashboard(
    queue_id: int,
    db: Session
):
    return service.get_queue_dashboard(
        queue_id=queue_id,
        db=db
    )


def get_queue_statistics(
    queue_id: int,
    start_date: date,
    end_date: date,
    db: Session
):
    return service.get_queue_statistics(
        queue_id=queue_id,
        start_date=start_date,
        end_date=end_date,
        db=db
    )