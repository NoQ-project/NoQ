import asyncio

from backend.app.tracking.websocket_manager import manager
from backend.app.utils.database import LocalSession
from backend.app.tokens.models import Token, TokenStatus
from backend.app.tracking.service import get_token_tracking


def schedule_token_update(token_id: int):
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(
            broadcast_token_update(token_id)
        )
    except RuntimeError:
        return


async def broadcast_token_update(
    token_id: int
):
    db = LocalSession()

    try:
        token = (
            db.query(Token)
            .filter(
                Token.id == token_id
            )
            .first()
        )

        if not token:
            return

        tracking = get_token_tracking(
            token_id=token.id,
            user_id=token.user_id,
            db=db
        )

        await manager.broadcast(
            token.id,
            tracking
        )

    finally:
        db.close()


def schedule_queue_updates(
    queue_id: int,
    booking_date,
    db
):
    tokens = (
        db.query(Token)
        .filter(
            Token.queue_id == queue_id,
            Token.booking_date == booking_date,
            Token.status.in_([
                TokenStatus.WAITING,
                TokenStatus.SERVING
            ])
        )
        .all()
    )

    for token in tokens:
        schedule_token_update(token.id)