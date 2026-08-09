"""add first and last name to usertable

Revision ID: 3d57a318c48c
Revises: 4d5f042c72aa
Create Date: 2026-08-09 18:20:31.518594

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3d57a318c48c'
down_revision: Union[str, Sequence[str], None] = '4d5f042c72aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass