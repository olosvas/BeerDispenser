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
    """API endpoint to trigger beer dispensing."""
    if _controller is None:
        return jsonify({'error': 'System controller not initialized'}), 500
    
    # Get volume parameter if provided
    try:
        volume = request.json.get('volume')
        if volume is not None:
            volume = float(volume)
    except:
        return jsonify({'error': 'Invalid volume parameter'}), 400
    
    # Start dispensing operation
    success = _controller.dispense_beer(volume)
    
    if success:
        return jsonify({'status': 'success', 'message': 'Dispensing operation started'})
    else:
        return jsonify({'status': 'error', 'message': 'Could not start dispensing operation'}), 409


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
    """API endpoint to verify customer age for beer dispensing."""
    if _controller is None:
        return jsonify({'error': 'System controller not initialized'}), 500
    
    # Get verification data
    try:
        data = request.json
        
        # Check if this is a manual verification or scan verification
        verification_method = data.get('method', 'manual')
        
        if verification_method == 'manual':
            fullname = data.get('fullname')
            birthdate = data.get('birthdate')
            id_number = data.get('id_number')
            
            # Validate required fields
            if not all([fullname, birthdate, id_number]):
                return jsonify({'status': 'error', 'message': 'All fields are required'}), 400
            
            # Parse birthdate
            from datetime import datetime
            try:
                birth_date = datetime.strptime(birthdate, '%Y-%m-%d')
                today = datetime.now()
                age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                
                # Check legal drinking age (21)
                if age < 21:
                    return jsonify({
                        'status': 'error', 
                        'message': 'You must be at least 21 years old to order beer.',
                        'verified': False
                    }), 403
                    
                # Store verification in session
                session['age_verified'] = True
                session['fullname'] = fullname
                
                # In a real system, we'd log the verification for legal purposes
                logger.info(f"Age verification successful for {fullname} (ID: {id_number}, Age: {age})")
                
                # Update verification stats
                with _controller.stats_lock:
                    _controller.stats['verifications'] += 1
                
                return jsonify({
                    'status': 'success',
                    'message': 'Age verification successful',
                    'verified': True,
                    'age': age
                })
                
            except ValueError:
                return jsonify({'status': 'error', 'message': 'Invalid date format'}), 400
                
        elif verification_method == 'scan':
            # Get the image data (base64 encoded)
            image_data = data.get('image_data')
            if not image_data:
                return jsonify({'status': 'error', 'message': 'No image data provided'}), 400
            
            # Decode base64 image
            import base64
            try:
                # Strip out the data URL header if present
                if 'base64,' in image_data:
                    image_data = image_data.split('base64,')[1]
                
                image_bytes = base64.b64decode(image_data)
                
                # Scan the ID
                id_data = _controller.id_scanner.scan_id(image_data=image_bytes)
                
                if not id_data:
                    return jsonify({
                        'status': 'error',
                        'message': 'Could not scan ID. Please try again or use manual verification.',
                        'verified': False
                    }), 400
                
                # Verify age from ID data
                verification_result = _controller.id_scanner.verify_age(id_data)
                
                if verification_result['verified']:
                    # Store verification in session
                    session['age_verified'] = True
                    session['id_type'] = id_data.get('id_type', 'Unknown ID')
                    
                    # Update verification stats
                    with _controller.stats_lock:
                        _controller.stats['verifications'] += 1
                    
                    # Log successful verification
                    logger.info(f"Age verification successful via scan: {id_data.get('id_type')}, Age: {verification_result.get('age')}")
                    
                    return jsonify({
                        'status': 'success',
                        'message': 'Age verification successful',
                        'verified': True,
                        'age': verification_result.get('age'),
                        'id_type': id_data.get('id_type', 'Unknown ID')
                    })
                else:
                    return jsonify({
                        'status': 'error',
                        'message': verification_result.get('message', 'Age verification failed'),
                        'verified': False
                    }), 403
            
            except Exception as e:
                logger.error(f"Error processing ID scan: {e}")
                return jsonify({
                    'status': 'error', 
                    'message': 'Error processing ID scan. Please try again or use manual verification.',
                    'verified': False
                }), 500
        
        else:
            return jsonify({'status': 'error', 'message': 'Invalid verification method'}), 400
            
    except Exception as e:
        logger.error(f"Error during age verification: {e}")
        return jsonify({'status': 'error', 'message': 'Verification failed'}), 500
