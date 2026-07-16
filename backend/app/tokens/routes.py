from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.tokens import controller
from backend.app.tokens.schemas import (
    BookTokenSchema,
    TokenResponseSchema,
    TokenDetailSchema,
)
from backend.app.utils.database import get_db
from backend.app.auth.dependencies import get_current_user

token_routes = APIRouter(
    prefix="/tokens",
    tags=["Tokens"]
)


@token_routes.post(
    "/book",
    response_model=TokenResponseSchema,
    status_code=status.HTTP_201_CREATED
)
def book_token(
    body: BookTokenSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return controller.book_token(
        queue_id=body.queue_id,
        user_id=current_user.id,
        db=db
    )


@token_routes.get(
    "/my-tokens",
    response_model=List[TokenResponseSchema],
    status_code=status.HTTP_200_OK
)
def get_my_tokens(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return controller.get_my_tokens(
        user_id=current_user.id,
        db=db
    )


@token_routes.get(
    "/{token_id}",
    response_model=TokenDetailSchema,
    status_code=status.HTTP_200_OK
)
def get_token_details(
    token_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return controller.get_token_details(
        token_id=token_id,
        user_id=current_user.id,
        db=db
    )