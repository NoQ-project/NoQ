from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.institutions.models import Institution


class InstitutionService:

    @staticmethod
    def search_institutions(db: Session, query: str):
        """
        Search institutions by name or address.
        """

        if not query:
            return (
                db.query(Institution)
                .order_by(Institution.name.asc())
                .all()
            )

        search = f"%{query}%"

        institutions = (
            db.query(Institution)
            .filter(
                or_(
                    Institution.name.ilike(search),
                    Institution.address.ilike(search)
                )
            )
            .order_by(Institution.name.asc())
            .all()
        )

        return institutions


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

        return institution