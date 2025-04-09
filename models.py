"""
Database models for the beer dispensing system.
"""
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class SystemLog(db.Model):
    """System-wide logging table."""
    __tablename__ = 'system_log'

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    level = db.Column(db.String(20), nullable=False)  # INFO, WARNING, ERROR, DEBUG
    source = db.Column(db.String(100), nullable=False)  # Module/component that generated the log
    message = db.Column(db.Text, nullable=False)  # Log message
    environment = db.Column(db.String(20), nullable=True)  # development, production, etc.
    client_ip = db.Column(db.String(50), nullable=True)  # IP address of client if applicable
    user_agent = db.Column(db.String(255), nullable=True)  # User agent of client if applicable

    @classmethod
    def log(cls, level, source, message, environment=None, client_ip=None, user_agent=None):
        """
        Add a log entry to the database.
        
        Args:
            level (str): Log level (INFO, WARNING, ERROR, DEBUG)
            source (str): Source module/component
            message (str): Log message
            environment (str, optional): Environment (development, production)
            client_ip (str, optional): Client IP address
            user_agent (str, optional): Client user agent
        """
        log_entry = cls(
            level=level,
            source=source,
            message=message,
            environment=environment or os.environ.get('ENVIRONMENT', 'development'),
            client_ip=client_ip,
            user_agent=user_agent
        )
        db.session.add(log_entry)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Failed to save log to database: {str(e)}")

    def to_dict(self):
        """Convert log entry to dictionary."""
        return {
            'id': self.id,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'level': self.level,
            'source': self.source,
            'message': self.message,
            'environment': self.environment,
            'client_ip': self.client_ip,
            'user_agent': self.user_agent
        }


class DispensingEvent(db.Model):
    """Table to track beverage dispensing events."""
    __tablename__ = 'dispensing_event'

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    size_ml = db.Column(db.Integer, nullable=False)  # Volume in milliliters
    successful = db.Column(db.Boolean, default=True, nullable=False)  # Whether dispensing was successful
    duration_seconds = db.Column(db.Float, nullable=True)  # How long it took to dispense
    beverage_type = db.Column(db.String(50), nullable=False)  # Type of beverage: beer, kofola, etc.
    error_message = db.Column(db.Text, nullable=True)  # Error message if dispensing failed
    environment = db.Column(db.String(20), nullable=True)  # development, production, etc.

    @classmethod
    def log_dispensing_event(cls, size_ml, beverage_type, successful=True, duration_seconds=None, 
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
        event = cls(
            size_ml=size_ml,
            beverage_type=beverage_type,
            successful=successful, 
            duration_seconds=duration_seconds,
            error_message=error_message,
            environment=environment or os.environ.get('ENVIRONMENT', 'development')
        )
        db.session.add(event)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Failed to save dispensing event to database: {str(e)}")

    def to_dict(self):
        """Convert dispensing event to dictionary."""
        return {
            'id': self.id,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'size_ml': self.size_ml,
            'successful': self.successful,
            'duration_seconds': self.duration_seconds,
            'beverage_type': self.beverage_type,
            'error_message': self.error_message,
            'environment': self.environment
        }