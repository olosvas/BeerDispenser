"""
Main module for the automated beer dispensing system.

This script initializes the hardware components and provides a Flask application
for monitoring and controlling the beer dispensing system.
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
from config import WEB_INTERFACE

# Global variables
controller = None

# Make app available for Gunicorn
application = app
# This is the object that Gunicorn looks for by default
app = application

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

def main():
    """Main entry point for the beer dispensing system."""
    logger.info("Starting automated beer dispensing system")
    
    # Initialize hardware and controllers
    if not initialize_system():
        sys.exit(1)
    
    try:
        # Start web interface in the main thread
        logger.info("Starting web interface")
        app.run(
            host=WEB_INTERFACE['HOST'],
            port=WEB_INTERFACE['PORT'],
            debug=WEB_INTERFACE['DEBUG']
        )
        
    except Exception as e:
        logger.error(f"Error during system operation: {e}")
        if controller:
            controller.shutdown()
        GPIO.cleanup()
        sys.exit(1)

# Initialize the system when this module is imported by Gunicorn
try:
    initialize_system()
except Exception as e:
    logger.error(f"Error during system initialization: {e}")
    # We'll continue anyway for the web interface
    # This allows the web interface to show an error status

if __name__ == "__main__":
    main()
