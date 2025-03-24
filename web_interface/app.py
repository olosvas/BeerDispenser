"""
Flask application for the beer dispensing system web interface.
"""
import os
import logging
from flask import Flask, session

logger = logging.getLogger(__name__)

# Create the Flask application
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Import routes
from web_interface import routes

def start_web_server(host='0.0.0.0', port=5000, debug=True):
    """
    Start the Flask web server.
    
    Args:
        host (str): Host address to bind to
        port (int): Port to listen on
        debug (bool): Whether to run in debug mode
    """
    logger.info(f"Starting web interface on {host}:{port}")
    app.run(host=host, port=port, debug=debug)
