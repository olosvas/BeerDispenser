"""
Routes for the beer dispensing system web interface.
"""
import logging
import time
from flask import render_template, request, jsonify, redirect, url_for, session
from web_interface.app import app

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
        state['state'] = _controller.get_current_state().lower()
        
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
    
    return render_template('admin.html', state=state)


@app.route('/control')
def control():
    """Control panel for the beer dispensing system."""
    return render_template('control.html')


@app.route('/status')
def status():
    """System status page."""
    return render_template('status.html')


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


@app.route('/api/system/status')
def system_status():
    """Get system status information."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Use get_system_state instead of get_system_status
    status = _controller.get_system_state()
    
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
        success, message = _controller.dispense_sequence.execute_full_sequence(
            volume_ml=volume_ml,
            beverage_type=beverage_type
        )
        
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
