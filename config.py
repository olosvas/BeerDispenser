"""
Configuration settings for the automated beer dispensing system.
"""
import os
import logging

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# GPIO Pin Configuration
# These pin numbers should be adjusted based on actual hardware connections
GPIO_PINS = {
    # Cup dispenser motor pins
    'CUP_DISPENSER_MOTOR': 17,
    'CUP_DISPENSER_SERVO': 18,
    
    # Beer dispenser control pins
    'BEER_VALVE': 22,
    'BEER_FLOW_SENSOR': 23,
    
    # Cup delivery system pins
    'DELIVERY_MOTOR_1': 24,
    'DELIVERY_MOTOR_2': 25,
    
    # Sensor pins
    'CUP_POSITION_SENSOR': 4,
    'BEER_LEVEL_SENSOR': 5,
    'DELIVERY_POSITION_SENSOR': 6,
    'TEMPERATURE_SENSOR': 12,
    'WEIGHT_SENSOR_DATA': 13,
    'WEIGHT_SENSOR_CLK': 19
}

# System parameters
BEER_POUR_SETTINGS = {
    'DEFAULT_VOLUME_ML': 500,  # Default volume in milliliters
    'FLOW_RATE_ML_PER_SEC': 40,  # Approximate flow rate 
    'FOAM_HEADSPACE_ML': 50,  # Space to leave for foam
    'SLOW_POUR_THRESHOLD': 0.8,  # Percentage of fill at which to slow pour
    'SLOW_POUR_RATE': 0.3,  # Slow pour rate as a fraction of normal rate
}

CUP_SETTINGS = {
    'DISPENSE_DELAY_SEC': 2,  # Time to wait for cup to drop
    'DETECTION_TIMEOUT_SEC': 5,  # Maximum time to wait for cup detection
}

DELIVERY_SETTINGS = {
    'CONVEYOR_SPEED': 50,  # Speed percentage (0-100)
    'DELIVERY_TIMEOUT_SEC': 10,  # Maximum time for delivery
}

# Error handling settings
ERROR_SETTINGS = {
    'MAX_RETRIES': 3,  # Maximum number of retry attempts
    'RETRY_DELAY_SEC': 2,  # Delay between retry attempts
}

# Web interface settings
WEB_INTERFACE = {
    'PORT': int(os.environ.get('PORT', 5000)),
    'HOST': '0.0.0.0',
    'DEBUG': True
}

# System state 
SYSTEM_STATES = {
    'IDLE': 'idle',
    'DISPENSING_CUP': 'dispensing_cup',
    'POURING_BEER': 'pouring_beer',
    'DELIVERING_CUP': 'delivering_cup',
    'ERROR': 'error',
    'MAINTENANCE': 'maintenance'
}
