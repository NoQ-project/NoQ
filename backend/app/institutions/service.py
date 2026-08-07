from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.institutions.models import Institution
from backend.app.auth.models import UserModel


class InstitutionService:

    @staticmethod
    def search_institutions(
        db: Session,
        query: str
    ):

        institutions = (
            db.query(Institution)
            .join(UserModel, Institution.auth_user_id == UserModel.id)
        )

        if query:
            search = f"%{query}%"

            institutions = institutions.filter(
                or_(
                    UserModel.name.ilike(search),
                    Institution.address.ilike(search)
                )
            )

        institutions = institutions.order_by(
            UserModel.name.asc()
        ).all()

        return [
            {
                "id": institution.id,
                "name": institution.auth_user.name,
                "description": institution.description,
                "address": institution.address,
                "phone": institution.phone,
                "email": institution.auth_user.email,
                "website": institution.website
            }
            for institution in institutions
        ]


    @staticmethod
    def get_institution_by_id(
        institution_id: int,
        db: Session
    ):

        institution = (
            db.query(Institution)
            .filter(
                Institution.id == institution_id
            )
            .first()
        )

        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found."
            )

        return {
            "id": institution.id,
            "name": institution.auth_user.name,
            "description": institution.description,
            "address": institution.address,
            "phone": institution.phone,
            "email": institution.auth_user.email,
            "website": institution.website
        }


    @staticmethod
    def get_all_institutions(
        db: Session
    ):

        institutions = (
            db.query(Institution)
            .all()
        )

        return [
            {
                "id": institution.id,
                "name": institution.auth_user.name,
                "description": institution.description,
                "address": institution.address,
                "phone": institution.phone,
                "email": institution.auth_user.email,
                "website": institution.website
            }
            for institution in institutions
        ]