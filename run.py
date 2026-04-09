#!/usr/bin/env python3
"""
Start all servers (delegates to backend.scripts.run_all).
  - Alexa API   → port 5002  (/alexa_quiz)
  - Web API     → port 5004  (/api/...)

Usage: python run.py
  or:  python -m backend.scripts.run_all

Before first run of Phase 4: python -m backend.scripts.migrate_phase4
"""
import sys
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

if __name__ == "__main__":
    runpy.run_module("backend.scripts.run_all", run_name="__main__")
