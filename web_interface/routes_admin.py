"""
Admin routes for the beer dispensing system.
"""
import logging
from flask import render_template, request, redirect, url_for
from web_interface.app import app, db
from models import SystemLog, DispensingEvent

logger = logging.getLogger(__name__)

@app.route('/admin/logs')
def admin_logs():
    """Admin interface for viewing system logs."""
    # Get filter parameters
    environment = request.args.get('environment', 'all')
    level = request.args.get('level', None)
    
    # Build query
    query = SystemLog.query
    
    if environment != 'all':
        query = query.filter(SystemLog.environment == environment)
    
    if level:
        query = query.filter(SystemLog.level == level)
    
    # Get logs ordered by timestamp (newest first)
    logs = query.order_by(SystemLog.timestamp.desc()).limit(100).all()
    
    # Get dispensing events
    events_query = DispensingEvent.query
    if environment != 'all':
        events_query = events_query.filter(DispensingEvent.environment == environment)
    
    events = events_query.order_by(DispensingEvent.timestamp.desc()).limit(20).all()
    
    # Count log levels for statistics
    info_count = SystemLog.query.filter(SystemLog.level == 'INFO').count()
    warning_count = SystemLog.query.filter(SystemLog.level == 'WARNING').count()
    error_count = SystemLog.query.filter(SystemLog.level == 'ERROR').count()
    debug_count = SystemLog.query.filter(SystemLog.level == 'DEBUG').count()
    
    return render_template(
        'admin_logs.html',
        logs=logs,
        events=events,
        environment=environment,
        level=level,
        info_count=info_count,
        warning_count=warning_count,
        error_count=error_count,
        debug_count=debug_count
    )

@app.route('/admin/log', methods=['POST'])
def create_log():
    """Create a new log entry (API endpoint)."""
    data = request.json
    
    if not data:
        return {'error': 'No data provided'}, 400
    
    try:
        log = SystemLog.log(
            level=data.get('level', 'INFO'),
            source=data.get('source', 'api'),
            message=data.get('message', ''),
            environment=data.get('environment', 'production'),
            client_ip=request.remote_addr,
            user_agent=request.user_agent.string
        )
        
        return {
            'success': True,
            'log_id': log.id
        }
    except Exception as e:
        logger.error(f"Error creating log: {str(e)}")
        return {'error': str(e)}, 500
        
@app.route('/admin/dispense_event', methods=['POST'])
def record_dispense_event():
    """Record a new dispensing event (API endpoint)."""
    data = request.json
    
    if not data:
        return {'error': 'No data provided'}, 400
    
    try:
        event = DispensingEvent(
            beverage_type=data.get('beverage_type', 'unknown'),
            size_ml=data.get('size_ml', 0),
            successful=data.get('successful', True),
            duration_seconds=data.get('duration_seconds'),
            environment=data.get('environment', 'production'),
            error_message=data.get('error_message')
        )
        
        db.session.add(event)
        db.session.commit()
        
        return {
            'success': True,
            'event_id': event.id
        }
    except Exception as e:
        logger.error(f"Error recording dispense event: {str(e)}")
        return {'error': str(e)}, 500