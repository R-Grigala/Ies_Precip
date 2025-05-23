"""added fetch_status and map_status

Revision ID: 07d711912a67
Revises: 97a6e8d315df
Create Date: 2025-02-19 12:38:36.671486

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '07d711912a67'
down_revision = '97a6e8d315df'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('div_positions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('map_selected', sa.Integer(), nullable=False))
        batch_op.drop_column('map_status')

    with op.batch_alter_table('stations', schema=None) as batch_op:
        batch_op.add_column(sa.Column('map_status', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('fetch_status', sa.Boolean(), nullable=True))
        batch_op.drop_column('status')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('stations', schema=None) as batch_op:
        batch_op.add_column(sa.Column('status', mysql.TINYINT(display_width=1), autoincrement=False, nullable=True))
        batch_op.drop_column('fetch_status')
        batch_op.drop_column('map_status')

    with op.batch_alter_table('div_positions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('map_status', mysql.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_column('map_selected')

    # ### end Alembic commands ###
