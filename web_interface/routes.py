"""
Routes for the beer dispensing system web interface.
"""
import logging
import sys
import time
from datetime import datetime, timedelta
from flask import render_template, request, jsonify, redirect, url_for, session
from web_interface.app import app
from models import db

# Get language configuration
from config import LANGUAGES, DEFAULT_LANGUAGE

logger = logging.getLogger(__name__)

# This will be set when the web interface is initialized in main.py
_controller = None

def set_controller(controller):
    """
    Set the reference to the main controller.
    
    Args:
        controller: MainController instance
    """
    global _controller
    _controller = controller


@app.route('/')
def index():
    """Redirect to customer interface."""
    # Reset session to start fresh
    session.clear()
    session['language'] = 'sk'
    session['keep_progress'] = False
    logger.info("Starting fresh session")
    return redirect(url_for('customer', keepProgress='false'))


@app.route('/admin')
def admin():
    """Admin interface for the beer dispensing system."""
    # Get current system state and stats from the controller
    state = {
        'state': 'idle',
        'stats': {
            'beverages_dispensed': 0,
            'error_count': 0,
            'uptime': '0h'
        },
        'logs': []
    }
    
    if _controller:
        # Get real system state if controller is available
        system_state = _controller.get_system_state()
        state['state'] = system_state.get('state', 'idle').lower() if isinstance(system_state, dict) else 'idle'
        
        # Get statistics
        with _controller.stats_lock:
            stats = _controller.stats.copy()
            
            # Add start_time if not present
            if 'start_time' not in stats:
                stats['start_time'] = time.time()
                
            state['stats'] = {
                'beverages_dispensed': stats.get('beers_poured', 0),
                'error_count': stats.get('errors', 0),
                'uptime': f"{int((time.time() - stats.get('start_time', time.time())) / 3600)}h"
            }
        
        # Get error logs
        logs = _controller.error_handler.get_error_history()
        state['logs'] = [
            {'message': log.get('message', ''), 'timestamp': log.get('timestamp', '')}
            for log in logs[-5:] if log  # Get last 5 logs
        ]
    
    # Add current server time
    now = time.strftime('%Y-%m-%d %H:%M:%S')
    
    return render_template('admin.html', state=state, now=now)


@app.route('/control')
def control():
    """Control panel for the beer dispensing system."""
    # Initialize state information
    state = {
        'state': 'idle',
        'beer_temp': 5.0,  # Default beer temperature
        'sensors': {
            'cup_present': False,
            'weight': 0,
            'last_update': int(time.time())
        },
        'stats': {
            'cups_dispensed': 0,
            'beers_poured': 0,
            'total_volume_ml': 0,
            'errors': 0,
            'last_operation_time': 0.0,
        }
    }
    
    logger.info("Rendering control panel")
    
    if _controller:
        # Get real system state if controller is available
        logger.debug("Fetching system state from controller")
        system_state = _controller.get_system_state()
        
        if isinstance(system_state, dict):
            state['state'] = system_state.get('state', 'idle').lower()
            logger.debug(f"Current system state: {state['state']}")
            
            # Add any additional sensor data from the controller
            if 'sensors' in system_state:
                state['sensors'].update(system_state['sensors'])
                logger.debug(f"Sensor data loaded: {state['sensors']}")
            
            # Add beer temperature if available
            if 'temperature' in system_state:
                state['beer_temp'] = system_state['temperature']
                logger.debug(f"Beer temperature loaded: {state['beer_temp']}")
        
        # Get statistics
        with _controller.stats_lock:
            stats = _controller.stats.copy()
            logger.debug(f"Raw stats data: {stats}")
            
            # Update stats with available data
            state['stats']['cups_dispensed'] = stats.get('cups_dispensed', 0)
            state['stats']['beers_poured'] = stats.get('beers_poured', 0)
            state['stats']['total_volume_ml'] = stats.get('total_volume_ml', 0)
            state['stats']['errors'] = stats.get('errors', 0)
            state['stats']['last_operation_time'] = stats.get('last_operation_time', 0.0)
    else:
        logger.warning("Controller not available, using default state")
    
    # Mock some data for development if needed
    if state['beer_temp'] == 5.0 and 'hardware.mock_hardware' in sys.modules:
        import random
        state['beer_temp'] = round(random.uniform(4.0, 7.0), 1)
        logger.debug(f"Using mock beer temperature: {state['beer_temp']}")
    
    # Add current server time
    now = time.strftime('%Y-%m-%d %H:%M:%S')
    
    return render_template('control.html', state=state, now=now)


@app.route('/status')
def status():
    """System status page."""
    # Initialize state information with all expected fields from the template
    state = {
        'state': 'idle',
        'beer_temp': 5.0,  # Default temperature
        'sensors': {
            'cup_present': False,
            'weight': 0,
            'last_update': int(time.time())
        },
        'stats': {
            'cups_dispensed': 0,
            'beers_poured': 0,
            'total_volume_ml': 0,
            'errors': 0,
            'last_operation_time': 0.0,
            'beverages_dispensed': 0,
            'error_count': 0,
            'uptime': '0h'
        },
        'logs': []
    }
    
    errors = []
    
    if _controller:
        # Get real system state if controller is available
        system_state = _controller.get_system_state()
        
        if isinstance(system_state, dict):
            state['state'] = system_state.get('state', 'idle').lower()
            
            # Add any additional sensor data from the controller
            if 'sensors' in system_state:
                state['sensors'].update(system_state['sensors'])
            
            # Add beer temperature if available
            if 'temperature' in system_state:
                state['beer_temp'] = system_state['temperature']
        
        # Get statistics
        with _controller.stats_lock:
            stats = _controller.stats.copy()
            
            # Add start_time if not present
            if 'start_time' not in stats:
                stats['start_time'] = time.time()
            
            # Update stats with available data
            state['stats']['cups_dispensed'] = stats.get('cups_dispensed', 0)
            state['stats']['beers_poured'] = stats.get('beers_poured', 0)
            state['stats']['total_volume_ml'] = stats.get('total_volume_ml', 0)
            state['stats']['errors'] = stats.get('errors', 0)
            state['stats']['last_operation_time'] = stats.get('last_operation_time', 0.0)
            state['stats']['beverages_dispensed'] = stats.get('beers_poured', 0)
            state['stats']['error_count'] = stats.get('errors', 0)
            state['stats']['uptime'] = f"{int((time.time() - stats.get('start_time', time.time())) / 3600)}h"
        
        # Get error logs
        errors = _controller.error_handler.get_error_history()
        state['logs'] = [
            {'message': log.get('message', ''), 'timestamp': log.get('timestamp', '')}
            for log in errors[-5:] if log  # Get last 5 logs
        ]
    
    # Mock some data for development if needed
    if state['beer_temp'] == 5.0 and 'hardware.mock_hardware' in sys.modules:
        import random
        state['beer_temp'] = round(random.uniform(4.0, 7.0), 1)
    
    # Add current server time
    now = time.strftime('%Y-%m-%d %H:%M:%S')
    
    return render_template('status.html', state=state, errors=errors, now=now)


@app.route('/customer')
@app.route('/customer/')
def customer():
    """Customer interface for the beer dispensing system."""
    # Get language preference
    language = request.args.get('language', session.get('language', DEFAULT_LANGUAGE))
    
    # Check if it's a valid language
    if language not in LANGUAGES:
        language = DEFAULT_LANGUAGE
    
    # Store in session
    session['language'] = language
    
    # Check if should keep progress
    keep_progress = request.args.get('keepProgress', 'false').lower() == 'true'
    session['keep_progress'] = keep_progress
    
    logger.info(f"Rendering customer interface with language: {language}, keep_progress: {keep_progress}")
    
    # Render template with language context
    return render_template('customer.html', language=language)


@app.route('/api/state')
def get_state():
    """Get the current state for the UI."""
    logger.info("API request for state")
    
    # Initialize state information
    state = {
        'state': 'idle',
        'beer_temp': 5.0,
        'sensors': {
            'cup_present': False,
            'weight': 0,
            'last_update': int(time.time())
        },
        'stats': {
            'cups_dispensed': 0,
            'beers_poured': 0,
            'total_volume_ml': 0,
            'errors': 0,
            'last_operation_time': 0.0,
        }
    }
    
    if _controller:
        # Get real system state if controller is available
        logger.debug("Fetching system state from controller for API")
        system_state = _controller.get_system_state()
        
        if isinstance(system_state, dict):
            state['state'] = system_state.get('state', 'idle').lower()
            
            # Add any additional sensor data from the controller
            if 'sensors' in system_state:
                state['sensors'].update(system_state['sensors'])
            
            # Add beer temperature if available
            if 'temperature' in system_state:
                state['beer_temp'] = system_state['temperature']
        
        # Get statistics
        with _controller.stats_lock:
            stats = _controller.stats.copy()
            
            # Update stats with available data
            state['stats']['cups_dispensed'] = stats.get('cups_dispensed', 0)
            state['stats']['beers_poured'] = stats.get('beers_poured', 0)
            state['stats']['total_volume_ml'] = stats.get('total_volume_ml', 0)
            state['stats']['errors'] = stats.get('errors', 0)
            state['stats']['last_operation_time'] = stats.get('last_operation_time', 0.0)
    else:
        logger.warning("Controller not available for API, using default state")
    
    # Mock some data for development if needed
    if state['beer_temp'] == 5.0 and 'hardware.mock_hardware' in sys.modules:
        import random
        state['beer_temp'] = round(random.uniform(4.0, 7.0), 1)
        logger.debug(f"Using mock beer temperature for API: {state['beer_temp']}")
    
    # Add current server time
    state['server_time'] = time.time()
    state['server_formatted_time'] = time.strftime('%Y-%m-%d %H:%M:%S')
    
    logger.debug(f"Returning state via API: {state}")
    return jsonify(state)


@app.route('/api/system/status')
def system_status():
    """Get system status information."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    status = _controller.get_system_status()
    
    # Add additional information for the UI
    status['server_time'] = time.time()
    status['server_formatted_time'] = time.strftime('%Y-%m-%d %H:%M:%S')
    
    return jsonify(status)


@app.route('/api/system/reset', methods=['POST'])
def system_reset():
    """Reset the system."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    try:
        _controller.reset_system()
        return jsonify({"status": "System reset successful"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/dispense', methods=['POST'])
def dispense():
    """Manually dispense a beverage."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Get parameters
    beverage_type = request.json.get('beverage_type', 'beer')
    volume_ml = request.json.get('volume_ml', 300)
    
    try:
        # Start dispensing sequence
        success, message = _controller.dispense_sequence.execute_full_sequence(volume_ml=volume_ml)
        
        if success:
            return jsonify({"status": "Dispensing successful", "message": message})
        else:
            return jsonify({"error": message}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/save_state', methods=['POST'])
def save_state():
    """Save UI state for persistence."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Get state data
    state_data = request.json.get('ui_state', {})
    
    # Associate with session
    session_id = session.get('session_id', 'anonymous')
    
    # In a real implementation, this would be saved to a database
    # Here we just log it
    logger.debug(f"Saving state for session {session_id}: {state_data}")
    
    return jsonify({"status": "State saved"})


@app.route('/api/errors', methods=['GET'])
def get_errors():
    """Get error history."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    errors = _controller.error_handler.get_error_history()
    
    return jsonify({
        "errors": errors
    })


@app.route('/maintenance', methods=['POST'])
def maintenance():
    """Put system into or take out of maintenance mode."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    mode = request.json.get('mode')
    
    if mode == 'enter':
        success = _controller.enter_maintenance_mode()
    elif mode == 'exit':
        success = _controller.exit_maintenance_mode()
    else:
        return jsonify({"error": "Invalid mode specified"}), 400
    
    if success:
        return jsonify({"status": "maintenance mode " + ("entered" if mode == 'enter' else "exited")})
    else:
        return jsonify({"error": "Failed to change maintenance mode"}), 400


@app.route('/verify_age', methods=['POST'])
def verify_age():
    """Handle age verification requests."""
    from age_verification.age_detector import verify_age_for_beverage, detect_age_from_image
    
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    method = request.form.get('method', 'webcam')
    beverage_type = request.form.get('beverage_type', 'beer')
    
    if method == 'webcam':
        # Verification via webcam
        from age_verification.webcam_capture import WebcamCapture
        
        try:
            # Initialize webcam
            webcam = WebcamCapture()
            initialized = webcam.initialize()
            
            if not initialized:
                return jsonify({
                    "success": False,
                    "message": "Nepodarilo sa inicializovať kameru." if session.get('language') == 'sk' else "Failed to initialize camera."
                })
            
            # Capture image
            success, image_data = webcam.capture_image(save_to_file=True)
            webcam.release()
            
            if not success:
                return jsonify({
                    "success": False,
                    "message": "Nepodarilo sa zachytiť fotografiu. Skúste prosím znova." if session.get('language') == 'sk' else "Failed to capture photo. Please try again."
                })
            
            # Verify age
            try:
                result = verify_age_for_beverage(image_data, beverage_type, image_is_path=True)
                
                return jsonify({
                    "success": True,
                    "verified": result.get('verified', False),
                    "message": result.get('message', ''),
                    "estimated_age": result.get('estimated_age', 0)
                })
            except Exception as e:
                logger.error(f"Age verification error: {str(e)}")
                return jsonify({
                    "success": False,
                    "message": "Chyba pri overovaní veku." if session.get('language') == 'sk' else "Error during age verification."
                })
                
        except Exception as e:
            logger.error(f"Webcam error: {str(e)}")
            return jsonify({
                "success": False,
                "message": "Problém s kamerou. Skúste prosím iný spôsob overenia." if session.get('language') == 'sk' else "Camera issue. Please try another verification method."
            })
    
    elif method == 'id_card':
        # Verification via ID card form
        try:
            # Get form data
            id_type = request.form.get('id_type')
            id_number = request.form.get('id_number')
            birth_date = request.form.get('birth_date')
            
            # This is a mock for demonstration - in a real system, 
            # this would validate against a database or official API
            try:
                # Just a basic check - in real system this would be more comprehensive
                if not id_number or not birth_date:
                    return jsonify({
                        "success": False,
                        "message": "Neplatné údaje." if session.get('language') == 'sk' else "Invalid data."
                    })
                
                # Simple verification based on birth date
                # This is just a demo! Real systems would use secure verification
                import datetime
                birth_date = datetime.datetime.strptime(birth_date, '%Y-%m-%d')
                today = datetime.datetime.now()
                age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                
                # Check if age is sufficient for the selected beverage
                minimum_age = 18  # Default for alcoholic beverages
                if beverage_type.lower() in ['kofola']:
                    minimum_age = 0  # Non-alcoholic beverages
                
                result = {
                    "success": True,
                    "verified": age >= minimum_age,
                    "message": f"Vek overený: {age} rokov." if session.get('language') == 'sk' else f"Age verified: {age} years old.",
                    "estimated_age": age
                }
                
                if not result["verified"]:
                    result["message"] = f"Prepáčte, nemáte požadovaný vek ({minimum_age}+)." if session.get('language') == 'sk' else f"Sorry, you don't meet the required age ({minimum_age}+)."
                
                return jsonify(result)
                
            except Exception as e:
                logger.error(f"ID validation error: {str(e)}")
                return jsonify({
                    "success": False,
                    "message": "Nepodarilo sa overiť vek." if session.get('language') == 'sk' else "Failed to verify age."
                })
                
        except Exception as e:
            logger.error(f"ID form error: {str(e)}")
            return jsonify({
                "success": False,
                "message": "Chyba pri spracovaní formulára." if session.get('language') == 'sk' else "Error processing the form."
            })
    
    else:
        return jsonify({
            "success": False,
            "message": "Neplatná metóda overenia." if session.get('language') == 'sk' else "Invalid verification method."
        })


@app.route('/switch_language', methods=['GET', 'POST'])
def switch_language():
    """Switch the UI language."""
    # Determine mode
    if request.method == 'POST':
        # Get language from form data
        language = request.form.get('language', DEFAULT_LANGUAGE)
    else:
        # Get language from query parameter
        language = request.args.get('language', DEFAULT_LANGUAGE)
    
    # Validate language
    if language not in LANGUAGES:
        language = DEFAULT_LANGUAGE
    
    # Store in session
    session['language'] = language
    
    # If it's an API request, return a JSON response
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({"status": "success", "language": language})
    
    # Otherwise, redirect back to the previous page or homepage
    return redirect(request.referrer or url_for('index'))


@app.route('/api/start_dispensing', methods=['POST'])
def start_dispensing():
    """Start the dispensing process for the cart items."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Get order items from request
    order_items = request.json.get('order_items', [])
    
    if not order_items:
        return jsonify({
            "success": False,
            "message": "No items in order"
        }), 400
    
    try:
        # In a real implementation, this would trigger the actual hardware
        # Here we'll just simulate success
        logger.info(f"Starting dispensing for order: {order_items}")
        
        # Store order in session for status checks
        session['current_order'] = {
            'items': order_items,
            'start_time': time.time(),
            'status': 'preparing',
            'progress': 10,
            'current_item_index': 0
        }
        
        return jsonify({
            "success": True,
            "message": "Dispensing started",
            "order_id": str(int(time.time()))  # Mock order ID
        })
    except Exception as e:
        logger.error(f"Error starting dispensing: {str(e)}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route('/api/dispensing_status')
def dispensing_status():
    """Get the current status of the dispensing process."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Get order from session
    current_order = session.get('current_order', None)
    
    if not current_order:
        return jsonify({
            "status": "not_found",
            "message": "No active dispensing process",
            "progress": 0
        })
    
    # In a real implementation, this would query the hardware
    # Here we'll simulate progress based on time elapsed
    elapsed_time = time.time() - current_order['start_time']
    total_items = len(current_order['items'])
    current_item_index = current_order['current_item_index']
    
    # Simulate different stages
    if elapsed_time < 2:
        # Still preparing
        status = "preparing"
        progress = min(30, int(elapsed_time * 15))
    elif elapsed_time < 4:
        # Dispensing cup
        status = "dispensing_cup"
        progress = min(50, 30 + int((elapsed_time - 2) * 10))
    elif elapsed_time < 8:
        # Pouring beverage
        status = "pouring"
        progress = min(80, 50 + int((elapsed_time - 4) * 7.5))
        current_item_index = min(current_item_index + int((elapsed_time - 4) / 2), total_items - 1)
    elif elapsed_time < 10:
        # Delivering cup
        status = "delivering"
        progress = min(99, 80 + int((elapsed_time - 8) * 10))
    else:
        # Complete
        status = "complete"
        progress = 100
    
    # Update session
    current_order['status'] = status
    current_order['progress'] = progress
    current_order['current_item_index'] = current_item_index
    session['current_order'] = current_order
    
    # Get current item being processed
    current_item = current_order['items'][current_item_index] if current_item_index < total_items else None
    
    return jsonify({
        "status": status,
        "progress": progress,
        "message": f"Processing {current_item_index + 1} of {total_items}",
        "current_item": current_item,
        "order_items": current_order['items']
    })

@app.route('/api/verify_age', methods=['POST'])
def api_verify_age():
    """Handle age verification requests from the JavaScript frontend."""
    
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Get JSON data from request
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    beverage_type = data.get('beverage_type', 'beer')
    
    logger.debug(f"Received verification request for beverage type: {beverage_type}")
    
    from age_verification.age_detector import verify_age_for_beverage, detect_age_from_image
    import base64
    
    # Extract image and beverage type from JSON
    image_data_url = data.get('image_data')
    
    if not image_data_url:
        return jsonify({"success": False, "message": "No image provided"}), 400
    
    try:
        # Extract base64 data from data URL
        # Format: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
        image_base64 = image_data_url.split(',')[1]
        image_bytes = base64.b64decode(image_base64)
        
        # Verify age using the bytes directly
        result = verify_age_for_beverage(image_bytes, beverage_type, image_is_path=False)
        
        logger.info(f"Age verification result: {result}")
        
        # Get verification status from the result
        verified = result.get('verified', False)
        
        return jsonify({
            "success": True,
            "verified": verified,
            "is_adult": verified,  # is_adult should match verified for consistent UI feedback
            "message": result.get('message', 'Age verification complete.'),
            "estimated_age": result.get('estimated_age', 0)
        })
        
    except Exception as e:
        logger.error(f"API age verification error: {str(e)}")
        return jsonify({
            "success": False,
            "is_adult": False,
            "message": "Error during age verification: " + str(e)
        })

@app.route('/admin/logs')
def admin_logs():
    """Admin logs interface for viewing system and dispensing logs."""
    from models import SystemLog, DispensingEvent
    from sqlalchemy import func, distinct
    from datetime import datetime, timedelta
    
    # Context for template
    context = {
        'system_logs': [],
        'dispensing_logs': [],
        'system_log_sources': [],
        'system_log_stats': {
            'info_count': 0,
            'info_percent': 0,
            'warning_count': 0,
            'warning_percent': 0,
            'error_count': 0,
            'error_percent': 0,
            'debug_count': 0,
            'debug_percent': 0,
            'total_count': 0,
            'source_count': 0,
            'last_log_time': 'N/A'
        },
        'dispensing_stats': {
            'success_count': 0,
            'success_percent': 0,
            'failure_count': 0,
            'failure_percent': 0,
            'beer_count': 0,
            'beer_percent': 0,
            'kofola_count': 0,
            'kofola_percent': 0,
            'birel_count': 0,
            'birel_percent': 0,
            'total_volume': 0,
            'avg_size': 0,
            'last_dispensed': 'N/A',
            'avg_duration': 0
        }
    }
    
    try:
        # Get unique sources for filtering
        unique_sources = db.session.query(distinct(SystemLog.source)).all()
        context['system_log_sources'] = [source[0] for source in unique_sources]
        
        # Get system logs (most recent 100)
        system_logs = SystemLog.query.order_by(SystemLog.timestamp.desc()).limit(100).all()
        try:
            context['system_logs'] = [log.to_dict() for log in system_logs]
        except (AttributeError, TypeError) as e:
            logger.error(f"Error converting system logs to dict: {str(e)}")
            # Fallback to using the model objects directly
            context['system_logs'] = system_logs
        
        # Get dispensing logs (most recent 100)
        dispensing_logs = DispensingEvent.query.order_by(DispensingEvent.timestamp.desc()).limit(100).all()
        try:
            context['dispensing_logs'] = [log.to_dict() for log in dispensing_logs]
        except (AttributeError, TypeError) as e:
            logger.error(f"Error converting dispensing logs to dict: {str(e)}")
            # Fallback to using the model objects directly
            context['dispensing_logs'] = dispensing_logs
        
        # Calculate system log statistics
        info_count = db.session.query(func.count(SystemLog.id)).filter(SystemLog.level == 'INFO').scalar() or 0
        warning_count = db.session.query(func.count(SystemLog.id)).filter(SystemLog.level == 'WARNING').scalar() or 0
        error_count = db.session.query(func.count(SystemLog.id)).filter(SystemLog.level == 'ERROR').scalar() or 0
        debug_count = db.session.query(func.count(SystemLog.id)).filter(SystemLog.level == 'DEBUG').scalar() or 0
        total_count = info_count + warning_count + error_count + debug_count
        
        # Get number of unique sources
        source_count = db.session.query(func.count(distinct(SystemLog.source))).scalar() or 0
        
        # Get last log time
        last_log = SystemLog.query.order_by(SystemLog.timestamp.desc()).first()
        if last_log:
            try:
                if hasattr(last_log, 'to_dict'):
                    last_log_dict = last_log.to_dict()
                    if isinstance(last_log_dict.get('timestamp'), str):
                        last_log_time = last_log_dict.get('timestamp')
                    else:
                        last_log_time = last_log.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    last_log_time = last_log.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            except Exception as e:
                logger.error(f"Error formatting last log time: {str(e)}")
                last_log_time = str(last_log.timestamp)
        else:
            last_log_time = 'N/A'
        
        # Calculate percentages for chart
        if total_count > 0:
            info_percent = round((info_count / total_count) * 100)
            warning_percent = round((warning_count / total_count) * 100)
            error_percent = round((error_count / total_count) * 100)
            debug_percent = round((debug_count / total_count) * 100)
        else:
            info_percent = warning_percent = error_percent = debug_percent = 0
        
        # Update system log statistics
        context['system_log_stats'] = {
            'info_count': info_count,
            'info_percent': info_percent,
            'warning_count': warning_count,
            'warning_percent': warning_percent,
            'error_count': error_count,
            'error_percent': error_percent,
            'debug_count': debug_count,
            'debug_percent': debug_percent,
            'total_count': total_count,
            'source_count': source_count,
            'last_log_time': last_log_time
        }
        
        # Calculate dispensing statistics
        success_count = db.session.query(func.count(DispensingEvent.id)).filter(DispensingEvent.successful == True).scalar() or 0
        failure_count = db.session.query(func.count(DispensingEvent.id)).filter(DispensingEvent.successful == False).scalar() or 0
        total_dispensing_count = success_count + failure_count
        
        # Calculate beverage type counts
        beer_count = db.session.query(func.count(DispensingEvent.id)).filter(DispensingEvent.beverage_type == 'beer').scalar() or 0
        kofola_count = db.session.query(func.count(DispensingEvent.id)).filter(DispensingEvent.beverage_type == 'kofola').scalar() or 0
        birel_count = db.session.query(func.count(DispensingEvent.id)).filter(DispensingEvent.beverage_type == 'birel').scalar() or 0
        
        # Calculate total volume and average size
        total_volume = db.session.query(func.sum(DispensingEvent.size_ml)).scalar() or 0
        avg_size = db.session.query(func.avg(DispensingEvent.size_ml)).scalar() or 0
        
        # Calculate average duration
        avg_duration = db.session.query(func.avg(DispensingEvent.duration_seconds)).filter(DispensingEvent.duration_seconds != None).scalar() or 0
        
        # Get last dispensing time
        last_dispensing = DispensingEvent.query.order_by(DispensingEvent.timestamp.desc()).first()
        if last_dispensing:
            try:
                if hasattr(last_dispensing, 'to_dict'):
                    last_dispensing_dict = last_dispensing.to_dict()
                    if isinstance(last_dispensing_dict.get('timestamp'), str):
                        last_dispensed = last_dispensing_dict.get('timestamp')
                    else:
                        last_dispensed = last_dispensing.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    last_dispensed = last_dispensing.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            except Exception as e:
                logger.error(f"Error formatting last dispensing time: {str(e)}")
                last_dispensed = str(last_dispensing.timestamp)
        else:
            last_dispensed = 'N/A'
        
        # Calculate percentages for chart
        if total_dispensing_count > 0:
            success_percent = round((success_count / total_dispensing_count) * 100)
            failure_percent = round((failure_count / total_dispensing_count) * 100)
            
            beer_percent = round((beer_count / total_dispensing_count) * 100)
            kofola_percent = round((kofola_count / total_dispensing_count) * 100)
            birel_percent = round((birel_count / total_dispensing_count) * 100)
        else:
            success_percent = failure_percent = beer_percent = kofola_percent = birel_percent = 0
        
        # Update dispensing statistics
        context['dispensing_stats'] = {
            'success_count': success_count,
            'success_percent': success_percent,
            'failure_count': failure_count,
            'failure_percent': failure_percent,
            'beer_count': beer_count,
            'beer_percent': beer_percent,
            'kofola_count': kofola_count,
            'kofola_percent': kofola_percent,
            'birel_count': birel_count,
            'birel_percent': birel_percent,
            'total_volume': total_volume,
            'avg_size': round(avg_size, 1) if avg_size else 0,
            'last_dispensed': last_dispensed,
            'avg_duration': round(avg_duration, 2) if avg_duration else 0
        }
        
        # Add server time
        context['now'] = time.strftime('%Y-%m-%d %H:%M:%S')
        
    except Exception as e:
        logger.error(f"Error retrieving logs: {str(e)}")
        context['error'] = f"Error retrieving logs: {str(e)}"
    
    return render_template('admin_logs.html', **context)

@app.route('/api/log', methods=['POST'])
def api_log():
    """API endpoint to add log entries from JavaScript."""
    from web_interface.utils.db_logger import log_to_db
    
    # Get JSON data from request
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    # Extract log data
    level = data.get('level', 'INFO').upper()
    source = data.get('source', 'client')
    message = data.get('message', '')
    environment = data.get('environment', None)
    
    # Validate required fields
    if not message:
        return jsonify({"success": False, "message": "Log message is required"}), 400
    
    # Validate log level
    valid_levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG']
    if level not in valid_levels:
        level = 'INFO'  # Default to INFO for invalid levels
    
    try:
        # Log to database
        log_to_db(level, source, message, environment)
        return jsonify({"success": True, "message": "Log entry created"})
    except Exception as e:
        logger.error(f"Error creating log entry: {str(e)}")
        return jsonify({"success": False, "message": f"Error creating log entry: {str(e)}"}), 500
