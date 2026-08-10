from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel, UserRole
from backend.app.auth.dependencies import get_current_user, require_role
from backend.app.queues import controller as queue_controller
from backend.app.queues.schemas import QueueCreateSchema, QueueResponseSchema, QueueDetailSchema
from backend.app.utils.database import get_db
from backend.app.institutions.schemas import (
    InstitutionDashboardResponse,
    InstitutionCreateSchema,
    InstitutionUpdateSchema,
    InstitutionResponse
)
from backend.app.institutions import controller

institution_routes = APIRouter(
    prefix="/institutions",
    tags=["Institutions"]
)


@institution_routes.post(
    "/",
    response_model=InstitutionResponse,
    status_code=status.HTTP_201_CREATED
)
def create_institution(
    institution: InstitutionCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return controller.InstitutionController.create_institution(
        institution=institution,
        db=db,
        current_user=current_user
    )


@institution_routes.get(
    "/",
    response_model=list[InstitutionResponse],
    status_code=status.HTTP_200_OK
)
def get_all_institutions(
    db: Session = Depends(get_db)
):
    return controller.InstitutionController.get_all_institutions(
        db=db
    )


@institution_routes.get(
    "/search",
    response_model=list[InstitutionResponse],
    status_code=status.HTTP_200_OK,
)
def search_institutions(
    query: str,
    db: Session = Depends(get_db),
):
    return controller.InstitutionController.search_institutions(
        db=db,
        query=query,
    )


@institution_routes.get(
    "/dashboard",
    response_model=InstitutionDashboardResponse,
    status_code=status.HTTP_200_OK
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    print("Current user:")
    return controller.InstitutionController.get_dashboard(
        db=db,
        current_user=current_user,
    )


@institution_routes.get(
    "/queues",
    response_model=list[QueueResponseSchema],
    status_code=status.HTTP_200_OK
)
def get_institution_queues(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role(UserRole.INSTITUTION))
):
    if not current_user.institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution profile not found."
        )

    return queue_controller.get_institution_queues(
        institution_id=current_user.institution.id,
        db=db,
    )


@institution_routes.post(
    "/queues",
    response_model=QueueDetailSchema,
    status_code=status.HTTP_201_CREATED
)
def create_institution_queue(
    queue: QueueCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role(UserRole.INSTITUTION))
):
    return queue_controller.create_queue(
        queue=queue,
        db=db,
        current_user=current_user,
    )


@institution_routes.delete(
    "/queues/{queue_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_institution_queue(
    queue_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role(UserRole.INSTITUTION))
):
    return queue_controller.delete_queue(
        queue_id=queue_id,
        db=db,
    )


@institution_routes.patch(
    "/queues/{queue_id}/limits",
    response_model=QueueDetailSchema,
    status_code=status.HTTP_200_OK
)
def update_institution_queue_limits(
    queue_id: int,
    queue: QueueCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role(UserRole.INSTITUTION))
):
    return queue_controller.update_queue(
        queue_id=queue_id,
        queue=queue,
        db=db,
    )


@institution_routes.get(
    "/{institution_id}",
    response_model=InstitutionResponse,
    status_code=status.HTTP_200_OK
)
def get_institution_details(
    institution_id: int,
    db: Session = Depends(get_db)
):
    return controller.InstitutionController.get_institution_by_id(
        institution_id=institution_id,
        db=db
    )


@institution_routes.put(
    "/{institution_id}",
    response_model=InstitutionResponse,
    status_code=status.HTTP_200_OK
)
def update_institution(
    institution_id: int,
    institution: InstitutionUpdateSchema,
    db: Session = Depends(get_db)
):
    return controller.InstitutionController.update_institution(
        institution_id=institution_id,
        institution=institution,
        db=db
    )


@institution_routes.delete(
    "/{institution_id}",
    status_code=status.HTTP_200_OK
)
def delete_institution(
    institution_id: int,
    db: Session = Depends(get_db)
):
    return controller.InstitutionController.delete_institution(
        institution_id=institution_id,
        db=db
    )