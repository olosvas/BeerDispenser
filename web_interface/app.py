"""
Flask application for the beer dispensing system web interface.
"""
import os
import logging
from flask import Flask, session

logger = logging.getLogger(__name__)

# Create the Flask application
app = Flask(__name__)
# Use a fixed secret key for development
app.secret_key = os.environ.get("SESSION_SECRET", "development_secret_key")

# Configure the database connection
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Import and initialize the database
from models import db, SystemLog, DispensingEvent

# Initialize the database with the Flask app
db.init_app(app)

# Create all tables if they don't exist
with app.app_context():
    db.create_all()
    logger.info("Database tables created/verified")
    
    # Log application start
    try:
        SystemLog.log(
            level="INFO",
            source="system",
            message="Application started and database initialized"
        )
    except Exception as e:
        logger.error(f"Failed to log application start: {e}")

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
