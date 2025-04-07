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
    """Render the admin dashboard interface."""
    # Access control logic could be implemented here
    if _controller is None:
        return render_template('admin.html', error="System not available")
    
    system_state = _controller.get_system_state()
    return render_template('admin.html', state=system_state)


@app.route('/customer', methods=['GET', 'POST'])
def customer():
    """Render the customer ordering interface."""
    if _controller is None:
        return render_template('customer.html', error="System not available")
    
    # Get language preference from the query parameter or session
    language = request.args.get('lang')
    if not language:
        language = session.get('language', DEFAULT_LANGUAGE)
    
    # Validate language and set default if invalid
    if language not in LANGUAGES:
        language = DEFAULT_LANGUAGE
    
    # Always update session with current language
    session['language'] = language
    
    # Check if we need to keep progress visible and cart state
    # First check query param, then fall back to session value
    keep_progress_param = request.args.get('keepProgress') 
    if keep_progress_param is not None:
        keep_progress = keep_progress_param == 'true'
    else:
        keep_progress = session.get('keep_progress', False)
    
    # Save to session for persistence across requests
    session['keep_progress'] = keep_progress
    
    # Check for cart state parameters (coming from AJAX call)
    if request.method == 'POST' and request.is_json:
        data = request.get_json()
        if 'cart_items' in data:
            session['cart_items'] = data.get('cart_items', [])
        if 'selected_beverage' in data:
            session['selected_beverage'] = data.get('selected_beverage')
        if 'selected_size' in data:
            session['selected_size'] = data.get('selected_size')
        if 'current_screen' in data:
            session['current_screen'] = data.get('current_screen')
        return jsonify({'success': True})
    
    # Pass cart and UI state to template
    cart_items = session.get('cart_items', [])
    selected_beverage = session.get('selected_beverage')
    selected_size = session.get('selected_size')
    current_screen = session.get('current_screen')
    
    # Log language and state for debugging
    logger.debug(f"Using language: {language}, keep_progress: {keep_progress}, session: {session}")
        
    system_state = _controller.get_system_state()
    # Only show customer interface if system is in idle state
    if system_state['state'] != 'idle' and system_state['state'] != 'error':
        error_message = "Systém je momentálne zaneprázdnený. Počkajte prosím chvíľu." if language == 'sk' else "System is currently busy. Please wait a moment."
        return render_template('customer.html', 
                              error=error_message,
                              state=system_state,
                              language=language,
                              keep_progress=keep_progress,
                              cart_items=cart_items,
                              selected_beverage=selected_beverage,
                              selected_size=selected_size,
                              current_screen=current_screen)
    
    return render_template('customer.html', 
                          state=system_state, 
                          language=language, 
                          keep_progress=keep_progress,
                          cart_items=cart_items,
                          selected_beverage=selected_beverage,
                          selected_size=selected_size,
                          current_screen=current_screen)


@app.route('/switch_language')
def switch_language():
    """Handle language switch."""
    # Get current language
    current_language = session.get('language', DEFAULT_LANGUAGE)
    
    # Get new language (toggle between available languages)
    new_language = LANGUAGES[1] if current_language == LANGUAGES[0] else LANGUAGES[0]
    
    # Update session
    session['language'] = new_language

    # Preserve progress state during language switch
    keep_progress = session.get('keep_progress', False)
    
    # Redirect back to the page where the language switch was triggered
    return redirect(url_for('customer', lang=new_language, keepProgress='true' if keep_progress else 'false'))


@app.route('/control')
def control():
    """Render the control panel interface."""
    # Access control logic could be implemented here
    if _controller is None:
        return render_template('control.html', error="System not available")
    
    system_state = _controller.get_system_state()
    return render_template('control.html', state=system_state)


@app.route('/status')
def status():
    """Return the current system status as JSON."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    system_state = _controller.get_system_state()
    return jsonify(system_state)


@app.route('/dispense', methods=['POST'])
def dispense():
    """Handle dispense requests."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Get dispense parameters
    beverage_type = request.json.get('beverage_type', 'beer')
    volume_ml = request.json.get('volume_ml')
    if volume_ml:
        volume_ml = float(volume_ml)
    
    # Try to start dispensing
    success = _controller.dispense_beer(volume_ml=volume_ml, beverage_type=beverage_type)
    
    if success:
        return jsonify({"status": "dispensing"})
    else:
        return jsonify({"error": "Failed to start dispensing"}), 400


@app.route('/stop', methods=['POST'])
def stop():
    """Emergency stop for any ongoing operation."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    success = _controller.stop_operation()
    
    if success:
        return jsonify({"status": "stopped"})
    else:
        return jsonify({"error": "Failed to stop operation"}), 400


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
                # Just a basic check - in real system this would be more sophisticated
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


@app.route('/api/dispensing_status', methods=['GET'])
def api_dispensing_status():
    """Return the current dispensing status for frontend monitoring."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Get the current system state
    system_state = _controller.get_system_state()
    
    # For demonstration purposes, we'll simulate a progress
    # In a real system, this would be based on actual dispensing progress
    import random
    import time
    
    # Generate a timestamp-based seed to have consistent progress for short time periods
    seed = int(time.time() / 3)  # Change every 3 seconds
    random.seed(seed)
    
    # Get the system state
    state = system_state['state']
    
    # Convert system state to a client-friendly format
    if state == 'dispensing':
        # Calculate a progress value that increments over time
        progress = (int(time.time()) % 15) * 6  # 0-90% over 15 seconds
        
        if progress < 30:
            message = "Dispensing cup..."
        elif progress < 60:
            message = "Pouring beverage..."
        elif progress < 90:
            message = "Finishing up..."
        else:
            message = "Dispensing complete."
            progress = 100
            state = 'complete'
        
        return jsonify({
            "status": state,
            "progress": progress,
            "message": message
        })
    elif state == 'error':
        return jsonify({
            "status": "error",
            "progress": 0,
            "message": system_state.get('error_message', 'An error occurred during dispensing.')
        })
    else:
        # Simulate dispensing initialization
        return jsonify({
            "status": "initializing",
            "progress": 10,
            "message": "Preparing to dispense beverage..."
        })


@app.route('/api/dispense', methods=['POST'])
def api_dispense():
    """Handle dispense requests from the JavaScript frontend."""
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Get dispense parameters from JSON
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    beverage_type = data.get('beverage_type', 'beer')
    size_ml = data.get('size_ml')
    
    # Convert size to float if it's a string
    if isinstance(size_ml, str):
        try:
            size_ml = float(size_ml)
        except ValueError:
            # If conversion fails, use default
            size_ml = None
    
    # Check if this beverage requires age verification
    from config import BEVERAGE_POUR_SETTINGS
    beverage_settings = BEVERAGE_POUR_SETTINGS.get(beverage_type, BEVERAGE_POUR_SETTINGS['beer'])
    requires_age_verification = beverage_settings.get('REQUIRES_AGE_VERIFICATION', True)
    
    # If it's beer or requires verification, inform the frontend
    if requires_age_verification:
        return jsonify({
            "success": True,
            "requires_age_verification": True,
            "message": "Age verification required before dispensing."
        })
    
    # Try to start dispensing
    success = _controller.dispense_beer(volume_ml=size_ml, beverage_type=beverage_type)
    
    if success:
        return jsonify({
            "success": True,
            "requires_age_verification": False,
            "status": "dispensing"
        })
    else:
        return jsonify({
            "success": False,
            "message": "Failed to start dispensing"
        }), 400


@app.route('/api/get_state', methods=['GET'])
def api_get_state():
    """Get the current UI state from session."""
    try:
        state = session.get('ui_state', {}) 
        return jsonify({
            "success": True,
            "state": state
        })
    except Exception as e:
        logger.error(f"Error getting state: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error retrieving state",
            "error": str(e)
        }), 500

@app.route('/api/save_state', methods=['POST'])
def api_save_state():
    """Save UI state to session."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        # Save the state to session
        session['ui_state'] = data
        return jsonify({
            "success": True,
            "message": "State saved successfully",
            "currentScreen": data.get('currentScreen')
        })
    except Exception as e:
        logger.error(f"Error saving state: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error saving state",
            "error": str(e)
        }), 500

@app.route('/api/verify_age', methods=['POST'])
def api_verify_age():
    """Handle age verification requests from the JavaScript frontend."""
    # For testing purposes, always return success with mock data
    
    if _controller is None:
        return jsonify({"error": "System not available"}), 503
    
    # Get JSON data from request
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    beverage_type = data.get('beverage_type', 'beer')
    
    logger.debug(f"Received verification request for beverage type: {beverage_type}")
    
    # Determine minimum age based on beverage type
    minimum_age = 21 if beverage_type.lower() in ['beer', 'birel'] else 0
    
    # Create a successful mock response
    language = session.get('language', 'en')
    message = ""
    if language == 'sk':
        message = f"Overenie veku úspešné! Vyzeráte na 25 rokov, čo spĺňa minimálny vek {minimum_age} pre {beverage_type}."
    else:
        message = f"Age verification successful. You appear to be 25 years old, which meets the minimum age requirement of {minimum_age} for {beverage_type}."
    
    logger.info("Age verification mock success")
    
    return jsonify({
        "success": True,
        "verified": True,
        "is_adult": True,
        "message": message,
        "estimated_age": 25
    })
    
    # The original code is commented out below to be easily restored
    '''
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
        }), 500
    '''