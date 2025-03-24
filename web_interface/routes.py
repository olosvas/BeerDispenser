"""
Routes for the beer dispensing system web interface.
"""
import logging
from flask import render_template, request, jsonify, redirect, url_for
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
    """Render the home page."""
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
