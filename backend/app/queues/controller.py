from datetime import date

from sqlalchemy.orm import Session

from backend.app.queues.schemas import QueueStatusToggleRequest
from backend.app.queues import service
from backend.app.auth.dependencies import get_owned_queue
from backend.app.auth.models import UserModel


def create_queue(
    queue,
    db: Session,
    current_user: UserModel,
):
    return service.create_queue(
        queue=queue,
        db=db,
        current_user=current_user,
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


def get_institution_queues(
    institution_id: int,
    db: Session
):
    return service.get_queues_by_institution(
        institution_id=institution_id,
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


def toggle_queue_status(
    queue_id: int,
    data: QueueStatusToggleRequest,
    db: Session,
    current_user: UserModel,
):
    queue = get_owned_queue(
        queue_id=queue_id,
        db=db,
        current_user=current_user,
    )

    return service.toggle_queue_status(
        queue=queue,
        reason=data.reason,
        db=db,
    )


def generate_queue_qr(
    queue_id: int,
    db: Session
):
    return service.generate_queue_qr(
        queue_id=queue_id,
        db=db
    )

def get_working_hours(
    queue_id: int,
    db: Session
):
    return service.get_working_hours(
        queue_id=queue_id,
        db=db
    )

def update_working_hours(
    queue_id: int,
    hours_data,
    db: Session
):
    return service.update_working_hours(
        queue_id=queue_id,
        hours_data=hours_data,
        db=db
    )