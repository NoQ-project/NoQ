from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.queues import controller
from backend.app.queues.schemas import (
    QueueResponseSchema,
    QueueDetailSchema,
)
from backend.app.utils.database import get_db

queue_routes = APIRouter(
    prefix="/queues",
    tags=["Queues"]
)


@queue_routes.get(
    "/{institution_id}",
    response_model=List[QueueResponseSchema],
    status_code=status.HTTP_200_OK
)
def get_queues(
    institution_id: int,
    db: Session = Depends(get_db)
):
    return controller.get_institution_queues(
        institution_id=institution_id,
        db=db
    )


@queue_routes.get(
    "/details/{queue_id}",
    response_model=QueueDetailSchema,
    status_code=status.HTTP_200_OK
)
def get_queue_details(
    queue_id: int,
    db: Session = Depends(get_db)
):
    return controller.get_queue_details(
        queue_id=queue_id,
        db=db
    )