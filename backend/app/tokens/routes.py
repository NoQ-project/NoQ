from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.tokens import controller
from backend.app.tokens.schemas import (
    BookTokenSchema,
    TokenResponseSchema,
    TokenDetailSchema,
    WaitingPositionSchema
)
from backend.app.utils.database import get_db

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
    db: Session = Depends(get_db)
):
    # Temporary Testing (User ID = 1)
    return controller.book_token(
        queue_id=body.queue_id,
        user_id=1,
        db=db
    )


@token_routes.get(
    "/my-tokens",
    response_model=List[TokenResponseSchema],
    status_code=status.HTTP_200_OK
)
def get_my_tokens(
    db: Session = Depends(get_db)
):
    # Temporary Testing (User ID = 1)
    return controller.get_my_tokens(
        user_id=1,
        db=db
    )


@token_routes.get(
    "/{token_id}",
    response_model=TokenDetailSchema,
    status_code=status.HTTP_200_OK
)
def get_token_details(
    token_id: int,
    db: Session = Depends(get_db)
):
    # Temporary Testing (User ID = 1)
    return controller.get_token_details(
        token_id=token_id,
        user_id=1,
        db=db
    )

@token_routes.patch(
    "/{token_id}/cancel",
    response_model=TokenDetailSchema,
    status_code=status.HTTP_200_OK
)
def cancel_token(
    token_id: int,
    db: Session = Depends(get_db)
):

    # Temporary Testing (User ID = 1)
    return controller.cancel_token(
        token_id=token_id,
        user_id=1,
        db=db
    )

@token_routes.get(
    "/{token_id}/waiting-position",
    response_model=WaitingPositionSchema,
    status_code=status.HTTP_200_OK
)
def get_waiting_position(

    token_id:int,
    db:Session=Depends(get_db)
):

    return controller.get_waiting_position(

        token_id=token_id,
        user_id=1,
        db=db
    )

@token_routes.patch(
    "/call-next/{queue_id}",
    response_model=TokenResponseSchema
)
def call_next_token(

        queue_id:int,
        db:Session=Depends(get_db)

):

    return controller.call_next_token(
        queue_id=queue_id,
        db=db
    )

@token_routes.patch(
    "/serve/{token_id}",
    response_model=TokenResponseSchema
)
def serve_token(

        token_id:int,
        db:Session=Depends(get_db)

):

    return controller.serve_token(
        token_id=token_id,
        db=db
    )

@token_routes.patch(
    "/missed/{token_id}",
    response_model=TokenResponseSchema
)
def mark_token_as_missed(

        token_id:int,
        db:Session=Depends(get_db)

):

    return controller.mark_token_as_missed(
        token_id=token_id,
        db=db
    )

