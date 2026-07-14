from sqlalchemy.orm import Session

from backend.app.institutions.service import InstitutionService


class InstitutionController:

    @staticmethod
    def search_institutions(db: Session, query: str):
        """
        Search institutions by name or address.
        """
        return InstitutionService.search_institutions(
            db=db,
            query=query
        )