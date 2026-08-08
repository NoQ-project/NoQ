from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from backend.app.auth.models import UserModel
from backend.app.auth.dependencies import get_current_user
from backend.app.tracking import controller
from sqlalchemy.orm import Session
from backend.app.utils.database import get_db
from jose import JWTError, jwt
from backend.app.utils import settings
from backend.app.utils.database import LocalSession
from backend.app.tokens.models import Token
from backend.app.tracking.service import get_token_tracking
from backend.app.tracking.websocket_manager import manager

tracking_routes = APIRouter(
    prefix="/tracking",
    tags=["Tracking"]
)

@tracking_routes.get("/{token_id}")
def get_token_tracking_route(
    token_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return controller.get_token_tracking_controller(
        token_id=token_id,
        user_id=current_user.profile.id,
        db=db
    )



ws_routes = APIRouter(
    prefix="/tracking",
    tags=["Tracking"]
)


@ws_routes.websocket("/{token_id}")
async def tracking_websocket(
    websocket: WebSocket,
    token_id: int
):
    db = LocalSession()

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
                algorithms=[settings.ALGORITHM]
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
        token = (
            db.query(Token)
            .filter(
                Token.id == token_id,
                Token.user_id == user_id
            )
            .first()
        )
        if not token:
            await websocket.close(
                code=1008
            )
            return
        await manager.connect(
            token_id,
            websocket
        )
        tracking = get_token_tracking(
            token_id=token_id,
            user_id=user_id,
            db=db
        )
        await websocket.send_json(
            tracking
        )
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(
            token_id,
            websocket
        )

    except Exception:
        manager.disconnect(
            token_id,
            websocket
        )

    finally:
        db.close()