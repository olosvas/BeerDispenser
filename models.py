"""
Database models for the beer dispensing system.
"""
from datetime import datetime
from web_interface.app import db


class SystemLog(db.Model):
    """
    Stores system logs for monitoring and troubleshooting.
    """
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    level = db.Column(db.String(20), nullable=False, default='INFO')  # INFO, WARNING, ERROR, etc.
    source = db.Column(db.String(100), nullable=False)  # Component that generated the log
    message = db.Column(db.Text, nullable=False)
    environment = db.Column(db.String(20), default='development')  # 'development' or 'production'
    client_ip = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    
    def __repr__(self):
        return f"<SystemLog {self.id}: {self.level} - {self.source}>"
        
    @classmethod
    def log(cls, level, source, message, environment='development', client_ip=None, user_agent=None):
        """
        Create a new log entry.
        
        Args:
            level (str): Log level (INFO, WARNING, ERROR, etc.)
            source (str): Source component generating the log
            message (str): Log message
            environment (str): 'development' or 'production'
            client_ip (str, optional): Client IP address
            user_agent (str, optional): Client user agent
            
        Returns:
            SystemLog: Created log entry
        """
        log_entry = cls(
            level=level,
            source=source,
            message=message,
            environment=environment,
            client_ip=client_ip,
            user_agent=user_agent
        )
        db.session.add(log_entry)
        db.session.commit()
        return log_entry


class DispensingEvent(db.Model):
    """
    Records beverage dispensing events.
    """
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    beverage_type = db.Column(db.String(50), nullable=False)
    size_ml = db.Column(db.Integer, nullable=False)
    successful = db.Column(db.Boolean, default=True)
    duration_seconds = db.Column(db.Float, nullable=True)
    environment = db.Column(db.String(20), default='development')  # 'development' or 'production'
    error_message = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f"<DispensingEvent {self.id}: {self.beverage_type} {self.size_ml}ml>"