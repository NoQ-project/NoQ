import sys
from sqlalchemy import create_engine, text
from backend.app.utils.settings import settings

engine = create_engine(settings.DB_CONNECTION)

with engine.begin() as conn:
    conn.execute(text("DELETE FROM notifications WHERE type = 'PROFILE_UPDATED' OR queue_id IS NULL;"))
    conn.execute(text("ALTER TABLE notifications MODIFY COLUMN queue_id INT NOT NULL;"))
    conn.execute(text("ALTER TABLE notifications MODIFY COLUMN type ENUM('QUEUE_PAUSED', 'QUEUE_RESUMED', 'PEOPLE_AHEAD_THRESHOLD', 'YOUR_TURN', 'TOKEN_COMPLETED', 'TOKEN_MISSED', 'TOKEN_CANCELLED') NOT NULL;"))

print("Database reverted successfully.")
