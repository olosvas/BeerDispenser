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
    # Get any persisted keep_progress state
    keep_progress = session.get('keep_progress', False)
    return redirect(url_for('customer', keepProgress='true' if keep_progress else 'false'))


@app.route('/customer')
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
    
    # Check if we need to keep progress visible
    # First check query param, then fall back to session value
    keep_progress_param = request.args.get('keepProgress') 
    if keep_progress_param is not None:
        keep_progress = keep_progress_param == 'true'
    else:
        keep_progress = session.get('keep_progress', False)
    
    # Save to session for persistence across requests
    session['keep_progress'] = keep_progress
    
    # Log language for debugging
    logger.debug(f"Using language: {language}, keep_progress: {keep_progress}, session: {session}")
        
    system_state = _controller.get_system_state()
    # Only show customer interface if system is in idle state
    if system_state['state'] != 'idle' and system_state['state'] != 'error':
        error_message = "Systém je momentálne zaneprázdnený. Počkajte prosím chvíľu." if language == 'sk' else "System is currently busy. Please wait a moment."
        return render_template('customer.html', 
                              error=error_message,
                              state=system_state,
                              language=language,
                              keep_progress=keep_progress)
    
    return render_template('customer.html', state=system_state, language=language, keep_progress=keep_progress)


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