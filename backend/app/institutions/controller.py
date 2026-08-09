from sqlalchemy.orm import Session
from backend.app.auth.models import UserModel
from backend.app.institutions.schemas import (
    InstitutionCreateSchema,
    InstitutionUpdateSchema
)
from backend.app.institutions.service import InstitutionService


class InstitutionController:

    @staticmethod
    def create_institution(
        institution: InstitutionCreateSchema,
        db: Session,
        current_user: UserModel
    ):
        return InstitutionService.create_institution(
            institution=institution,
            db=db,
            current_user=current_user
        )

    @staticmethod
    def get_all_institutions(
        db: Session
    ):
        return InstitutionService.get_all_institutions(
            db=db
        )

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

    @staticmethod
    def update_institution(
        institution_id: int,
        institution: InstitutionUpdateSchema,
        db: Session
    ):
        return InstitutionService.update_institution(
            institution_id=institution_id,
            institution=institution,
            db=db
        )

    @staticmethod
    def delete_institution(
        institution_id: int,
        db: Session
    ):
        return InstitutionService.delete_institution(
            institution_id=institution_id,
            db=db
        )

    @staticmethod
    def get_dashboard(
        db: Session,
        current_user: UserModel
    ):
        return InstitutionService.get_dashboard(
            db=db,
            current_user=current_user
        )