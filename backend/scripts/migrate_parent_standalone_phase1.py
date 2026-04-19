#!/usr/bin/env python3
"""
Phase 1 (standalone parent schema): parents.account_kind, parents.content_specialist_id,
specialists.is_shadow — applied via init_db() ALTERs.

Run once after pull (or rely on app startup init_db):
  python -m backend.scripts.migrate_parent_standalone_phase1
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

from backend.database.connection import init_db


def main() -> None:
    init_db()
    print("migrate_parent_standalone_phase1: init_db() complete (columns added if missing).")


if __name__ == "__main__":
    main()
