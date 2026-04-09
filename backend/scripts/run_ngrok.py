#!/usr/bin/env python3
"""
تشغيل ngrok. الاستخدام: python -m backend.scripts.run_ngrok
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(ROOT / ".env")
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

from backend.config import NGROK_AUTH_TOKEN, FLASK_PORT


def main():
    if not NGROK_AUTH_TOKEN or NGROK_AUTH_TOKEN == "your_ngrok_token":
        print("ADD NGROK_AUTH_TOKEN IN .env")
        sys.exit(1)

    from pyngrok import ngrok
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    tunnel = ngrok.connect(str(FLASK_PORT), "http")
    print("=" * 50)
    print(f"Alexa Endpoint: {tunnel.public_url}/alexa_quiz")
    print("=" * 50)
    print("\n Ctrl+C to stop")
    try:
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        ngrok.kill()
        print("\n  ngrok stopped")


if __name__ == "__main__":
    main()
