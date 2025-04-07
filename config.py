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
    
    # Beverage dispenser control pins
    'BEER_VALVE': 22,
    'KOFOLA_VALVE': 26,
    'BIREL_VALVE': 27,
    'FLOW_SENSOR': 23,
    
    # Cup delivery system pins
    'DELIVERY_MOTOR_1': 24,
    'DELIVERY_MOTOR_2': 25,
    
    # Sensor pins
    'CUP_POSITION_SENSOR': 4,
    'LIQUID_LEVEL_SENSOR': 5,
    'DELIVERY_POSITION_SENSOR': 6,
    'TEMPERATURE_SENSOR': 12,
    'WEIGHT_SENSOR_DATA': 13,
    'WEIGHT_SENSOR_CLK': 19
}

# Beverage type definitions
BEVERAGE_TYPES = ['beer', 'kofola', 'birel']

# System parameters for each beverage type
BEVERAGE_POUR_SETTINGS = {
    'beer': {
        'NAME': 'Beer',
        'DEFAULT_VOLUME_ML': 500,  # Default volume in milliliters
        'FLOW_RATE_ML_PER_SEC': 40,  # Approximate flow rate 
        'FOAM_HEADSPACE_ML': 50,  # Space to leave for foam
        'SLOW_POUR_THRESHOLD': 0.8,  # Percentage of fill at which to slow pour
        'SLOW_POUR_RATE': 0.3,  # Slow pour rate as a fraction of normal rate
        'TEMPERATURE_MIN': 4.0,  # Minimum ideal temperature (°C)
        'TEMPERATURE_MAX': 7.0,  # Maximum ideal temperature (°C)
        'COLOR': '#FFA500',  # Amber color for beer
        'ICON': 'beer'  # Font Awesome icon name
    },
    'kofola': {
        'NAME': 'Kofola',
        'DEFAULT_VOLUME_ML': 400,  # Default volume in milliliters
        'FLOW_RATE_ML_PER_SEC': 50,  # Approximate flow rate 
        'FOAM_HEADSPACE_ML': 30,  # Space to leave for foam
        'SLOW_POUR_THRESHOLD': 0.9,  # Percentage of fill at which to slow pour
        'SLOW_POUR_RATE': 0.4,  # Slow pour rate as a fraction of normal rate
        'TEMPERATURE_MIN': 3.0,  # Minimum ideal temperature (°C)
        'TEMPERATURE_MAX': 5.0,  # Maximum ideal temperature (°C)
        'COLOR': '#4B2D1A',  # Dark brown color for Kofola
        'ICON': 'glass-water'  # Font Awesome icon name
    },
    'birel': {
        'NAME': 'Birel',
        'DEFAULT_VOLUME_ML': 500,  # Default volume in milliliters
        'FLOW_RATE_ML_PER_SEC': 45,  # Approximate flow rate 
        'FOAM_HEADSPACE_ML': 40,  # Space to leave for foam
        'SLOW_POUR_THRESHOLD': 0.85,  # Percentage of fill at which to slow pour
        'SLOW_POUR_RATE': 0.35,  # Slow pour rate as a fraction of normal rate
        'TEMPERATURE_MIN': 4.0,  # Minimum ideal temperature (°C)
        'TEMPERATURE_MAX': 6.5,  # Maximum ideal temperature (°C)
        'COLOR': '#FFC857',  # Lighter amber color for Birel
        'ICON': 'beer-mug-empty'  # Font Awesome icon name
    }
}

# For backward compatibility
BEER_POUR_SETTINGS = BEVERAGE_POUR_SETTINGS['beer']

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
    'POURING_BEER': 'pouring_beverage',  # Generic name for pouring any beverage
    'DELIVERING_CUP': 'delivering_cup',
    'ERROR': 'error',
    'MAINTENANCE': 'maintenance'
}
