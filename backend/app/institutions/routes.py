from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.utils.database import get_db
from backend.app.institutions.schemas import InstitutionResponse
from backend.app.institutions import controller

institution_routes = APIRouter(prefix="/institutions")


@institution_routes.get(
    "/search",
    response_model=list[InstitutionResponse],
    status_code=status.HTTP_200_OK,
)
def search_institutions(
    query: str,
    db: Session = Depends(get_db),
):
    return controller.search_institutions(
        db=db,
        query=query,
    )