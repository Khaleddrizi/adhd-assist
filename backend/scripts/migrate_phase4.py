#!/usr/bin/env python3
"""
Migration Phase 4: add specialists, parents, patients, training_programs.
Run once: python -m backend.scripts.migrate_phase4
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

from sqlalchemy import text
from backend.database.connection import engine, init_db


def migrate() -> None:
    init_db()
    with engine.connect() as conn:
        for stmt, name in [
            ("ALTER TABLE users ADD COLUMN patient_id INTEGER REFERENCES patients(id)", "users.patient_id"),
            ("ALTER TABLE quiz_sessions ADD COLUMN patient_id INTEGER REFERENCES patients(id)", "quiz_sessions.patient_id"),
        ]:
            try:
                conn.execute(text(stmt))
                conn.commit()
                print(f"Added {name}")
            except Exception as e:
                conn.rollback()
                if "already exists" in str(e) or "duplicate" in str(e).lower():
                    print(f"{name} already exists, skipping")
                else:
                    raise
    print("Migration complete.")


if __name__ == "__main__":
    migrate()
