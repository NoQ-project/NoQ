from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.queues.models import QueueStatus, Queue
from backend.app.institutions.models import Institution
from backend.app.institutions.schemas import (
    InstitutionCreateSchema,
    InstitutionUpdateSchema
)
from backend.app.auth.models import UserModel
from datetime import datetime, timezone

class InstitutionService:

    @staticmethod
    def create_institution(
        institution: InstitutionCreateSchema,
        db: Session,
        current_user: UserModel
    ):

<<<<<<< HEAD
        existing = (
            db.query(Institution)
            .filter(
                Institution.auth_user_id == current_user.id
            )
            .first()
        )
=======
        existing_institution = (
                    db.query(Institution)
                    .filter(
                        Institution.auth_user_id == current_user.id
                    )
                    .first()
                )
>>>>>>> b27fe2a11467d0f426f62c3f63815145f56648ff

        if existing_institution:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Institution profile already exists."
            )

        new_institution = Institution(
            name=institution.name,
<<<<<<< HEAD
            auth_user_id=current_user.id,
=======
            auth_user_id=current_user.id,    
>>>>>>> b27fe2a11467d0f426f62c3f63815145f56648ff
            description=institution.description,
            address=institution.address,
            phone=institution.phone,
            website=institution.website
        )

        db.add(new_institution)
        db.commit()
        db.refresh(new_institution)

        return {
            "id": new_institution.id,
            "name": new_institution.name,
            "description": new_institution.description,
            "address": new_institution.address,
            "phone": new_institution.phone,
            "email": new_institution.auth_user.email,
            "website": new_institution.website
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
                "name": institution.name,
                "description": institution.description,
                "address": institution.address,
                "phone": institution.phone,
                "email": institution.auth_user.email,
                "website": institution.website
            }
            for institution in institutions
        ]

    @staticmethod
    def search_institutions(
        db: Session,
        query: str
    ):

        institutions = (
            db.query(Institution)
            .join(
                UserModel,
                Institution.auth_user_id == UserModel.id
            )
        )

        if query:
            search = f"%{query}%"

            institutions = institutions.filter(
                or_(
                    Institution.name.ilike(search),
                    Institution.address.ilike(search)
                )
            )

        institutions = (
            institutions
            .order_by(Institution.name.asc())
            .all()
        )

        return [
            {
                "id": institution.id,
                "name": institution.name,
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
            "name": institution.name,
            "description": institution.description,
            "address": institution.address,
            "phone": institution.phone,
            "email": institution.auth_user.email,
            "website": institution.website
        }

    @staticmethod
    def update_institution(
        institution_id: int,
        institution: InstitutionUpdateSchema,
        db: Session
    ):

        existing_institution = (
            db.query(Institution)
            .filter(
                Institution.id == institution_id
            )
            .first()
        )

        if not existing_institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found."
            )

        existing_institution.name = institution.name
        existing_institution.description = institution.description
        existing_institution.address = institution.address
        existing_institution.phone = institution.phone
        existing_institution.website = institution.website

        db.commit()
        db.refresh(existing_institution)

        return {
            "id": existing_institution.id,
            "name": existing_institution.name,
            "description": existing_institution.description,
            "address": existing_institution.address,
            "phone": existing_institution.phone,
            "email": existing_institution.auth_user.email,
            "website": existing_institution.website
        }
    @staticmethod
    def delete_institution(
        institution_id: int,
        db: Session
    ):

        existing_institution = (
            db.query(Institution)
            .filter(
                Institution.id == institution_id
            )
            .first()
        )

        if not existing_institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found."
            )

        db.delete(existing_institution)
        db.commit()

        return {
            "message": "Institution deleted successfully."
        }

    @staticmethod
    def get_dashboard(
        db: Session,
        current_user: UserModel
    ):

        institution = (
            db.query(Institution)
            .filter(
                Institution.auth_user_id == current_user.id
            )
            .first()
        )

        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found."
            )

        return {
            "institution_name": institution.name,
            "total_queues": 0,
            "active_queues": 0,
            "total_tokens_today": 0,
            "waiting_tokens": 0,
            "called_tokens": 0,
            "served_tokens": 0,
            "missed_tokens": 0
        }