"""
WSGI entry point for the beer dispensing system.
This file is used by Gunicorn to start the application.
"""
from web_interface.app import app

# Initialize the system when this module is imported by Gunicorn
try:
    from main import initialize_system
    initialize_system()
except Exception as e:
    import logging
    logging.error(f"Error during system initialization: {e}")
    # We'll continue anyway for the web interface
    # This allows the web interface to show an error status