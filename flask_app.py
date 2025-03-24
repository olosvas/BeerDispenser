"""
Flask application module for the automated beer dispensing system.

This initializes the hardware components, controllers, and sets up the Flask routes.
"""
import os
import time
import logging
import signal
import sys

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Determine whether to use real GPIO or mock implementation
USE_REAL_GPIO = os.environ.get('USE_REAL_GPIO', '0') == '1'

# Import appropriate GPIO library
if USE_REAL_GPIO:
    try:
        import RPi.GPIO as GPIO
        print("Using real Raspberry Pi GPIO")
    except ImportError:
        print("Cannot import RPi.GPIO, falling back to mock implementation")
        import mock_gpio as GPIO
else:
    import mock_gpio as GPIO
    print("Using mock GPIO implementation for simulation")

from controllers.main_controller import MainController
from web_interface.app import app
from web_interface.routes import set_controller

# Global variables
controller = None

def signal_handler(sig, frame):
    """Handle shutdown signals gracefully."""
    logger.info("Shutdown signal received, cleaning up...")
    if controller:
        controller.shutdown()
    GPIO.cleanup()
    sys.exit(0)

def initialize_system():
    """Initialize the beer dispensing system."""
    global controller
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Create and initialize system controller
    controller = MainController()
    
    if not controller.initialize_system():
        logger.error("Failed to initialize system, exiting...")
        return False
    
    # Pass controller to web interface
    set_controller(controller)
    
    logger.info("System initialization complete")
    return True

# Initialize the system controller
if not initialize_system():
    logger.error("System initialization failed")
    # We'll continue anyway for the web interface
    # This allows the web interface to show an error status

# Set default secret key if not provided
if not app.secret_key:
    app.secret_key = 'beer_dispenser_dev_key'
    logger.warning("Using default development secret key")

# This allows the file to be imported by gunicorn
if __name__ == '__main__':
    # Start the web interface if run directly
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)