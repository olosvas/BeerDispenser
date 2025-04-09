"""
Database logging utility for the beer dispensing system.
"""
import os
import logging
import time
from flask import request, has_request_context
from models import SystemLog, DispensingEvent

logger = logging.getLogger(__name__)

def log_to_db(level, source, message, environment=None):
    """
    Log a message to the system_log table.
    
    Args:
        level (str): Log level (INFO, WARNING, ERROR, DEBUG)
        source (str): Source module/component
        message (str): Log message
        environment (str, optional): Environment (development, production)
    """
    try:
        # Get client IP and user agent if available
        client_ip = None
        user_agent = None
        if has_request_context():
            client_ip = request.remote_addr
            user_agent = request.headers.get('User-Agent', '')
        
        # Call the log method on the SystemLog model
        SystemLog.log(
            level=level.upper(),
            source=source,
            message=message,
            environment=environment or os.environ.get('ENVIRONMENT', 'development'),
            client_ip=client_ip,
            user_agent=user_agent
        )
    except Exception as e:
        # Log to standard logger if database logging fails
        logger.error(f"Failed to log to database: {str(e)}")


def log_dispensing_event(size_ml, beverage_type, successful=True, duration_seconds=None, 
                         error_message=None, environment=None):
    """
    Log a dispensing event to the database.
    
    Args:
        size_ml (int): Volume in milliliters
        beverage_type (str): Type of beverage
        successful (bool, optional): Whether dispensing was successful
        duration_seconds (float, optional): Duration in seconds
        error_message (str, optional): Error message if unsuccessful
        environment (str, optional): Environment (development, production)
    """
    try:
        # Call the log_dispensing_event method on the DispensingEvent model
        DispensingEvent.log_dispensing_event(
            size_ml=size_ml,
            beverage_type=beverage_type,
            successful=successful,
            duration_seconds=duration_seconds,
            error_message=error_message,
            environment=environment or os.environ.get('ENVIRONMENT', 'development')
        )
    except Exception as e:
        # Log to standard logger if database logging fails
        logger.error(f"Failed to log dispensing event to database: {str(e)}")


# Create convenience methods for different log levels
def info(source, message, environment=None):
    """Log an INFO message to the database."""
    log_to_db('INFO', source, message, environment)


def warning(source, message, environment=None):
    """Log a WARNING message to the database."""
    log_to_db('WARNING', source, message, environment)


def error(source, message, environment=None):
    """Log an ERROR message to the database."""
    log_to_db('ERROR', source, message, environment)


def debug(source, message, environment=None):
    """Log a DEBUG message to the database."""
    log_to_db('DEBUG', source, message, environment)
