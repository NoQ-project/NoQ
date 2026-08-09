"""first and last name

Revision ID: b0f13e360f74
Revises: 3d57a318c48c
Create Date: 2026-08-09 19:16:21.203648

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b0f13e360f74'
down_revision: Union[str, Sequence[str], None] = '3d57a318c48c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
