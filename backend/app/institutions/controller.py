<<<<<<< HEAD
from sqlalchemy.orm import Session
from backend.app.institutions.service import InstitutionService


class InstitutionController:

    @staticmethod
    def search_institutions(
        db: Session,
        query: str
    ):
        return InstitutionService.search_institutions(
            db=db,
            query=query
        )


    @staticmethod
    def get_institution_by_id(
        institution_id: int,
        db: Session
    ):
        return InstitutionService.get_institution_by_id(
            institution_id=institution_id,
            db=db
        )
=======
>>>>>>> f4c3dca878710c3027b416ba91e7275d45219b3f
