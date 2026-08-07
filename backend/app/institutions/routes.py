from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.utils.database import get_db
from backend.app.institutions.schemas import InstitutionResponse
from backend.app.institutions import controller

institution_routes = APIRouter(
    prefix="/institutions",
    tags=["Institutions"]
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