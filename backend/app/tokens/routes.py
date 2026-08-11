from typing import List
from datetime import date
from fastapi import APIRouter, Depends, status, HTTPException, Query
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
    AdvanceQueueResponseSchema,
)
from backend.app.utils.database import get_db

token_routes = APIRouter(
    prefix="/tokens",
    tags=["Tokens"],
)

from backend.app.user.models import User as UserProfile

def get_profile_id(user: UserModel, db: Session) -> int:
    if user.profile:
        return user.profile.id
    profile = UserProfile(auth_user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile.id

@token_routes.post(
    "/book",
    response_model=TokenResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def book_token_route(
    queue_id: int,
    booking_date: date = Query(None, description="Date to book the token for"),
    current_user: UserModel = Depends(
        require_role(UserRole.USER)
    ),
    db: Session = Depends(get_db),
):
    profile_id = get_profile_id(current_user, db)
    return controller.book_token(
        queue_id=queue_id,
        user_id=profile_id,
        booking_date=booking_date,
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
    profile_id = get_profile_id(current_user, db)
    return controller.get_my_tokens(
        user_id=profile_id,
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
    # Ownership is already verified by get_owned_token dependency
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


@token_routes.post(
    "/advance/{queue_id}",
    response_model=AdvanceQueueResponseSchema,
    status_code=status.HTTP_200_OK,
)
def advance_queue_route(
    queue_id: int,
    result: TokenStatus = Query(TokenStatus.COMPLETED, description="Result for the current serving token: COMPLETED or MISSED"),
    current_user: UserModel = Depends(require_role(UserRole.INSTITUTION)),
    db: Session = Depends(get_db),
):
    """Mark current serving token as COMPLETED or MISSED, then serve the next waiting token."""
    return controller.advance_token_controller(
        queue_id=queue_id,
        result=result,
        db=db,
    )


@token_routes.post(
    "/close-day/{queue_id}",
    status_code=status.HTTP_200_OK,
)
def close_day_route(
    queue_id: int,
    current_user: UserModel = Depends(require_role(UserRole.INSTITUTION)),
    db: Session = Depends(get_db),
):
    """Cancel all remaining WAITING tokens for today and notify users. Call after closing time."""
    return controller.close_day(
        queue_id=queue_id,
        db=db,
    )