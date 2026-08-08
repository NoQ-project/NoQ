from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel
from backend.app.auth.dependencies import get_current_user
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
    db: Session = Depends(get_db)
):
    return controller.InstitutionController.create_institution(
        institution=institution,
        db=db
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
    return controller.InstitutionController.get_dashboard(
        db=db,
         current_user=current_user,
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
