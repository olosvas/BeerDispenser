"""
Routes for the beer dispensing system web interface.
"""
import logging
import time
from flask import render_template, request, jsonify, redirect, url_for, session
from web_interface.app import app

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
    return redirect(url_for('customer'))


@app.route('/customer')
def customer():
    """Render the customer ordering interface."""
    if _controller is None:
        return render_template('customer.html', error="System not available")
        
    system_state = _controller.get_system_state()
    # Only show customer interface if system is in idle state
    if system_state['state'] != 'idle' and system_state['state'] != 'error':
        return render_template('customer.html', 
                              error="System is currently busy. Please wait a moment.",
                              state=system_state)
    
    return render_template('customer.html', state=system_state)


@app.route('/admin')
def admin():
    """Render the admin page."""
    if _controller is None:
        return render_template('index.html', error="System controller not initialized")
        
    system_state = _controller.get_system_state()
    return render_template('index.html', state=system_state)


@app.route('/status')
def status():
    """Display system status."""
    if _controller is None:
        return render_template('status.html', error="System controller not initialized")
        
    system_state = _controller.get_system_state()
    error_history = _controller.error_handler.get_error_history()
    
    return render_template('status.html', 
                          state=system_state, 
                          errors=error_history)


@app.route('/control')
def control():
    """Display system control interface."""
    if _controller is None:
        return render_template('control.html', error="System controller not initialized")
        
    system_state = _controller.get_system_state()
    return render_template('control.html', state=system_state)


@app.route('/api/state')
def api_state():
    """API endpoint to get current system state."""
    if _controller is None:
        return jsonify({'error': 'System controller not initialized'}), 500
        
    system_state = _controller.get_system_state()
    return jsonify(system_state)


@app.route('/api/dispense', methods=['POST'])
def api_dispense():
    """API endpoint to trigger beverage dispensing."""
    if _controller is None:
        return jsonify({'error': 'System controller not initialized'}), 500
    
    # Get parameters
    try:
        data = request.json
        volume_ml = data.get('volume_ml')
        beverage_type = data.get('beverage_type', 'beer')  # Default to beer if not specified
        
        if volume_ml is not None:
            volume_ml = float(volume_ml)
            
        # Validate beverage type
        from config import BEVERAGE_TYPES, BEVERAGE_POUR_SETTINGS
        if beverage_type not in BEVERAGE_TYPES:
            return jsonify({'error': f'Invalid beverage type. Supported types: {", ".join(BEVERAGE_TYPES)}'}), 400
        
        # Check if age verification is required for this beverage
        requires_verification = BEVERAGE_POUR_SETTINGS[beverage_type].get('REQUIRES_AGE_VERIFICATION', True)
        
        # If this is an alcoholic beverage that requires age verification, check if the user has verified their age
        if requires_verification and not session.get('age_verified'):
            logger.info(f"Age verification required for {beverage_type}")
            return jsonify({
                'success': False,
                'message': f'Age verification required for {BEVERAGE_POUR_SETTINGS[beverage_type]["NAME"]}',
                'requires_verification': True
            }), 403
            
        # If this beverage doesn't require age verification, we can proceed
        logger.info(f"No age verification needed for {beverage_type}")
            
    except Exception as e:
        logger.error(f"Error parsing dispense request: {str(e)}")
        return jsonify({'error': 'Invalid parameters'}), 400
    
    # Start dispensing operation
    success = _controller.dispense_beer(volume_ml=volume_ml, beverage_type=beverage_type)
    
    if success:
        return jsonify({
            'success': True, 
            'message': f'Dispensing {beverage_type} ({volume_ml}ml) started'
        })
    else:
        return jsonify({
            'success': False, 
            'message': 'Could not start dispensing operation'
        }), 409


@app.route('/api/stop', methods=['POST'])
def api_stop():
    """API endpoint to stop any ongoing operation."""
    if _controller is None:
        return jsonify({'error': 'System controller not initialized'}), 500
    
    success = _controller.stop_operation()
    
    if success:
        return jsonify({'status': 'success', 'message': 'Operation stopped'})
    else:
        return jsonify({'status': 'error', 'message': 'Failed to stop operation'}), 500


@app.route('/api/maintenance', methods=['POST'])
def api_maintenance():
    """API endpoint to enter or exit maintenance mode."""
    if _controller is None:
        return jsonify({'error': 'System controller not initialized'}), 500
    
    action = request.json.get('action')
    
    if action == 'enter':
        success = _controller.enter_maintenance_mode()
        message = 'Entered maintenance mode'
    elif action == 'exit':
        success = _controller.exit_maintenance_mode()
        message = 'Exited maintenance mode'
    else:
        return jsonify({'error': 'Invalid action parameter'}), 400
    
    if success:
        return jsonify({'status': 'success', 'message': message})
    else:
        return jsonify({'status': 'error', 'message': f'Failed to {action} maintenance mode'}), 409


@app.route('/api/errors')
def api_errors():
    """API endpoint to get error history."""
    if _controller is None:
        return jsonify({'error': 'System controller not initialized'}), 500
    
    error_history = _controller.error_handler.get_error_history()
    return jsonify({'errors': error_history})


@app.route('/api/reset_stats', methods=['POST'])
def api_reset_stats():
    """API endpoint to reset system statistics."""
    if _controller is None:
        return jsonify({'error': 'System controller not initialized'}), 500
    
    # Reset statistics
    with _controller.stats_lock:
        _controller.stats = {
            'cups_dispensed': 0,
            'beers_poured': 0,
            'total_volume_ml': 0,
            'errors': 0,
            'last_operation_time': 0
        }
    
    return jsonify({'status': 'success', 'message': 'Statistics reset successfully'})


@app.route('/api/verify_age', methods=['POST'])
def api_verify_age():
    """API endpoint to verify customer age for beverage dispensing."""
    if _controller is None:
        return jsonify({'error': 'System controller not initialized'}), 500
    
    # Get verification data
    try:
        data = request.json
        id_number = data.get('id_number')
        birth_date = data.get('birth_date')
        beverage_type = data.get('beverage_type', 'beer')  # Default to beer if not specified
        
        # Validate required fields
        if not all([id_number, birth_date]):
            return jsonify({'status': 'error', 'message': 'ID number and birth date are required'}), 400
        
        # Parse birthdate
        from datetime import datetime
        try:
            birth_date_obj = datetime.strptime(birth_date, '%Y-%m-%d')
            today = datetime.now()
            age = today.year - birth_date_obj.year - ((today.month, today.day) < (birth_date_obj.month, birth_date_obj.day))
            
            # Check if the beverage type requires age verification
            from config import BEVERAGE_POUR_SETTINGS
            
            # Get beverage settings
            if beverage_type not in BEVERAGE_POUR_SETTINGS:
                # Default to beer if beverage type is not valid
                beverage_type = 'beer'
                
            beverage_settings = BEVERAGE_POUR_SETTINGS[beverage_type]
            needs_verification = beverage_settings.get('REQUIRES_AGE_VERIFICATION', True)  # Default to requiring verification
            minimum_age = 21 if beverage_type == 'beer' else 18  # Different age limits for different beverages
            
            # For non-alcoholic beverages, no age verification is needed
            if not needs_verification:
                logger.info(f"No age verification needed for {beverage_settings['NAME']}")
                return jsonify({
                    'status': 'success',
                    'message': f"No age verification needed for {beverage_settings['NAME']}",
                    'verified': True,
                })
                
            # Check legal drinking age
            if needs_verification and age < minimum_age:
                return jsonify({
                    'status': 'error', 
                    'message': f'You must be at least {minimum_age} years old to order {beverage_type}.',
                    'verified': False
                }), 403
                
            # Store verification in session
            session['age_verified'] = True
            session['beverage_type'] = beverage_type
            
            # In a real system, we'd log the verification for legal purposes
            logger.info(f"Age verification successful for ID: {id_number}, Age: {age}, Beverage: {beverage_type}")
            
            return jsonify({
                'status': 'success',
                'message': 'Age verification successful',
                'verified': True,
                'age': age,
                'beverage_type': beverage_type
            })
            
        except ValueError:
            return jsonify({'status': 'error', 'message': 'Invalid date format'}), 400
            
    except Exception as e:
        logger.error(f"Error during age verification: {e}")
        return jsonify({'status': 'error', 'message': 'Verification failed'}), 500
