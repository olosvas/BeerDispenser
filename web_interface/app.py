"""
Flask application for the beer dispensing system web interface.
"""
import os
import logging
from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

logger = logging.getLogger(__name__)

# Create base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize SQLAlchemy with the base class
db = SQLAlchemy(model_class=Base)

# Create the Flask application
app = Flask(__name__)
# Use a fixed secret key for development
app.secret_key = os.environ.get("SESSION_SECRET", "development_secret_key")

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///beer_dispenser.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the database with the app
db.init_app(app)

# Create database tables
with app.app_context():
    try:
        from models import SystemLog, DispensingEvent
        db.create_all()
        logger.info("Database tables created")
        
        # Add a test log entry to verify database functionality
        SystemLog.log(
            level='INFO',
            source='system',
            message='Application started and database initialized',
            environment='development'
        )
        logger.info("Test log entry created")
    except Exception as e:
        logger.error(f"Error setting up database: {str(e)}")
        # Continue anyway to allow the web interface to run

# Import routes after database initialization
from web_interface import routes

def start_web_server(host='0.0.0.0', port=5000, debug=True):
    """
    Start the Flask web server.
    
    Args:
        host (str): Host address to bind to
        port (int): Port to listen on
        debug (bool): Whether to run in debug mode
    """
    # Ensure database tables are created
    with app.app_context():
        db.create_all()
    
    logger.info(f"Starting web interface on {host}:{port}")
    app.run(host=host, port=port, debug=debug)
