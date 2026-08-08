from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)
from jose import JWTError, jwt

from backend.app.utils import settings
from backend.app.utils.database import LocalSession
from backend.app.notifications.ws_manager import (
    notification_manager,
)
from backend.app.user.models import User


notification_ws_routes = APIRouter(
    prefix="/notifications",
    tags=["Notification WebSocket"],
)


@notification_ws_routes.websocket("/ws")
async def notification_websocket(
    websocket: WebSocket,
):
    db = LocalSession()

    user_id = None

    try:
        access_token = websocket.cookies.get(
            "access_token"
        )

        if not access_token:
            await websocket.close(
                code=1008
            )
            return

        try:
            payload = jwt.decode(
                access_token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
            )

            user_id = payload.get("id")

            if not user_id:
                await websocket.close(
                    code=1008
                )
                return

        except JWTError:
            await websocket.close(
                code=1008
            )
            return

        user = (
            db.query(User)
            .filter(
                User.id == user_id
            )
            .first()
        )

        if not user:
            await websocket.close(
                code=1008
            )
            return

        await notification_manager.connect(
            user_id=user_id,
            websocket=websocket,
        )

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        if user_id is not None:
            notification_manager.disconnect(
                user_id=user_id,
                websocket=websocket,
            )

    except Exception:
        if user_id is not None:
            notification_manager.disconnect(
                user_id=user_id,
                websocket=websocket,
            )

    finally:
        db.close()