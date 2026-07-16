<<<<<<< HEAD
from sqlalchemy.orm import Session

from backend.app.queues import service


def get_institution_queues(
    institution_id: int,
    db: Session
):
    return service.get_queues_by_institution(
        institution_id=institution_id,
        db=db
    )


def get_queue_details(
    queue_id: int,
    db: Session
):
    return service.get_queue_by_id(
        queue_id=queue_id,
        db=db
    )
=======
>>>>>>> f4c3dca878710c3027b416ba91e7275d45219b3f
