"""
Application entry point for the automated beer dispensing system.
"""
import os
from web_interface.app import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)