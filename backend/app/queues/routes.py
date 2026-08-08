from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.auth.models import UserModel, UserRole
from backend.app.auth.dependencies import get_current_user, require_role
from backend.app.queues import controller
from backend.app.queues.schemas import (
    QueueCreateSchema,
    QueueUpdateSchema,
    QueueResponseSchema,
    QueueDetailSchema,
    QueueDashboardSchema,
    QueueStatisticsRangeSchema
)
from backend.app.utils.database import get_db
from backend.app.queues.schemas import QueueStatusToggleRequest, QueueStatusResponse

queue_routes = APIRouter(
    prefix="/queues",
    tags=["Queues"]
)


@queue_routes.post(
    "/",
    response_model=QueueDetailSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_queue(
    queue: QueueCreateSchema,
    current_user: UserModel = Depends(require_role(UserRole.INSTITUTION)),
    db: Session = Depends(get_db),
):
    return controller.create_queue(
        queue=queue,
        db=db,
        current_user=current_user,
    )


@queue_routes.put(
    "/{queue_id}",
    response_model=QueueDetailSchema,
    status_code=status.HTTP_200_OK
)
def update_queue(
    queue_id: int,
    queue: QueueUpdateSchema,
    db: Session = Depends(get_db)
):
    return controller.update_queue(
        queue_id=queue_id,
        queue=queue,
        db=db
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


@queue_routes.delete(
    "/{queue_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_queue(
    queue_id: int,
    db: Session = Depends(get_db)
):
    return controller.delete_queue(
        queue_id=queue_id,
        db=db
    )

# QUEUE DASHBOARD


@queue_routes.get(
    "/dashboard/{queue_id}",
    response_model=QueueDashboardSchema,
    status_code=status.HTTP_200_OK
)
def get_queue_dashboard(
    queue_id: int,
    db: Session = Depends(get_db)
):
    return controller.get_queue_dashboard(
        queue_id=queue_id,
        db=db
    )

# QUEUE DATE RANGE STATISTICS


@queue_routes.get(
    "/statistics/{queue_id}",
    response_model=QueueStatisticsRangeSchema,
    status_code=status.HTTP_200_OK
)
def get_queue_statistics(
    queue_id: int,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    return controller.get_queue_statistics(
        queue_id=queue_id,
        start_date=start_date,
        end_date=end_date,
        db=db
    )

@queue_routes.patch(
    "/{queue_id}/toggle-status",
    response_model=QueueStatusResponse,
    status_code=status.HTTP_200_OK,
)
def toggle_queue_status(
    queue_id: int,
    data: QueueStatusToggleRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return controller.toggle_queue_status(
        queue_id=queue_id,
        data=data,
        db=db,
        current_user=current_user,
    )