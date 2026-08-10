from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from backend.app.auth.models import UserModel, UserRole
from backend.app.auth.dependencies import (
    get_current_user,
    get_owned_token,
    require_role,
)
from backend.app.tokens import controller
from backend.app.tokens.models import Token, TokenStatus
from backend.app.tokens.schemas import (
    TokenResponseSchema,
    TokenDetailSchema,
    WaitingPositionSchema,
    CurrentTokenSchema,
    WaitingTokensSchema,
)
from backend.app.utils.database import get_db

token_routes = APIRouter(
    prefix="/tokens",
    tags=["Tokens"],
)

@token_routes.post(
    "/book",
    response_model=TokenResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def book_token_route(
    queue_id: int,
    current_user: UserModel = Depends(
        require_role(UserRole.USER)
    ),
    db: Session = Depends(get_db),
):
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile not found for this account.",
        )

    return controller.book_token(
        queue_id=queue_id,
        user_id=current_user.profile.id,
        db=db,
    )

@token_routes.get(
    "/my-tokens",
    response_model=List[TokenResponseSchema],
    status_code=status.HTTP_200_OK,
)
def get_my_tokens(
    current_user: UserModel = Depends(require_role(UserRole.USER)),
    db: Session = Depends(get_db),
):
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile not found for this account."
        )
    return controller.get_my_tokens(
        user_id=current_user.profile.id,
        db=db,
    )

@token_routes.get(
    "/{token_id}",
    response_model=TokenDetailSchema,
    status_code=status.HTTP_200_OK,
)
def get_token_details(
    token_id: int,
    current_token: Token = Depends(get_owned_token),
    db: Session = Depends(get_db),
):
    return controller.get_token_details(
        token_id=token_id,
        user_id=current_token.user_id,
        db=db,
    )

@token_routes.patch(
    "/{token_id}/cancel",
    response_model=TokenDetailSchema,
    status_code=status.HTTP_200_OK,
)
def cancel_token(
    token_id: int,
    queue_id: int,
    current_token: Token = Depends(get_owned_token),
    db: Session = Depends(get_db),
):
    return controller.cancel_token(
        queue_id=queue_id,
        token_id=token_id,
        user_id=current_token.user_id,
        db=db,
    )

@token_routes.get(
    "/{token_id}/waiting-position",
    response_model=WaitingPositionSchema,
    status_code=status.HTTP_200_OK,
)
def get_waiting_position(
    token_id: int,
    current_token: Token = Depends(get_owned_token),
    db: Session = Depends(get_db),
):
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile not found for this account."
        )
    return controller.get_waiting_position(
        token_id=token_id,
        user_id=current_token.user_id,
        db=db,
    )

@token_routes.get(
    "/current-token/{queue_id}",
    response_model=CurrentTokenSchema,
    status_code=status.HTTP_200_OK,
)
def get_current_token(
    queue_id: int,
    db: Session = Depends(get_db),
):
    return controller.get_current_token(
        queue_id=queue_id,
        db=db,
    )

@token_routes.get(
    "/waiting-tokens/{queue_id}",
    response_model=List[WaitingTokensSchema],
    status_code=status.HTTP_200_OK,
)
def get_waiting_tokens(
    queue_id: int,
    db: Session = Depends(get_db),
):
    return controller.get_waiting_tokens(
        queue_id=queue_id,
        db=db,
    )