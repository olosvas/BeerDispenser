"""
Beer dispensing control module that manages flow control and beer pouring.
"""
import time
import threading
import logging
import RPi.GPIO as GPIO
from config import GPIO_PINS, BEER_POUR_SETTINGS

logger = logging.getLogger(__name__)

class BeerDispenser:
    """Controls the mechanisms for dispensing beer."""
    
    def __init__(self):
        """Initialize the beer dispenser hardware components."""
        self.valve_pin = GPIO_PINS['BEER_VALVE']
        self.flow_sensor_pin = GPIO_PINS['BEER_FLOW_SENSOR']
        self.level_sensor_pin = GPIO_PINS['BEER_LEVEL_SENSOR']
        self.temperature_sensor_pin = GPIO_PINS['TEMPERATURE_SENSOR']
        
        self.default_volume = BEER_POUR_SETTINGS['DEFAULT_VOLUME_ML']
        self.flow_rate = BEER_POUR_SETTINGS['FLOW_RATE_ML_PER_SEC']
        self.foam_headspace = BEER_POUR_SETTINGS['FOAM_HEADSPACE_ML']
        self.slow_pour_threshold = BEER_POUR_SETTINGS['SLOW_POUR_THRESHOLD']
        self.slow_pour_rate = BEER_POUR_SETTINGS['SLOW_POUR_RATE']
        
        self.initialized = False
        self.pouring = False
        self.flow_count = 0
        self.flow_lock = threading.Lock()
        
    def initialize(self):
        """Set up GPIO for the beer dispenser."""
        try:
            # Setup GPIO mode if not already set
            if GPIO.getmode() != GPIO.BCM:
                GPIO.setmode(GPIO.BCM)
            
            # Setup valve pin as output
            GPIO.setup(self.valve_pin, GPIO.OUT)
            GPIO.output(self.valve_pin, GPIO.LOW)  # Ensure valve is closed
            
            # Setup flow sensor as input with pull-up and interrupt
            GPIO.setup(self.flow_sensor_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            GPIO.add_event_detect(self.flow_sensor_pin, GPIO.FALLING, 
                                 callback=self._flow_sensor_callback, bouncetime=1)
            
            # Setup level sensor as input
            GPIO.setup(self.level_sensor_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            
            # Setup temperature sensor (assuming it's a digital sensor using GPIO)
            GPIO.setup(self.temperature_sensor_pin, GPIO.IN)
            
            self.initialized = True
            logger.info("Beer dispenser initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize beer dispenser: {e}")
            return False
    
    def _flow_sensor_callback(self, channel):
        """Callback for flow sensor pulses."""
        with self.flow_lock:
            self.flow_count += 1
    
    def pour_beer(self, volume_ml=None):
        """
        Pour a specified volume of beer.
        
        Args:
            volume_ml (float, optional): Volume to pour in milliliters.
                                         Uses default if None.
        
        Returns:
            bool: True if beer was successfully poured, False otherwise
        """
        if not self.initialized:
            if not self.initialize():
                return False
        
        volume = volume_ml if volume_ml is not None else self.default_volume
        target_volume = volume - self.foam_headspace
        
        try:
            logger.info(f"Starting beer pour: {volume}ml (target: {target_volume}ml)")
            
            # Reset flow counter
            with self.flow_lock:
                self.flow_count = 0
            
            self.pouring = True
            
            # Open valve to start pouring
            GPIO.output(self.valve_pin, GPIO.HIGH)
            
            # Monitor the pour
            start_time = time.time()
            slow_pour_started = False
            
            # Calculate the approximate number of pulses for the target volume
            # This would need calibration for the actual flow sensor
            # Assuming 2.25ml per pulse (common in many flow sensors)
            ml_per_pulse = 2.25
            target_pulses = target_volume / ml_per_pulse
            slow_pour_pulses = target_pulses * self.slow_pour_threshold
            
            while self.pouring:
                current_pulses = 0
                with self.flow_lock:
                    current_pulses = self.flow_count
                
                # Calculate current volume
                current_volume = current_pulses * ml_per_pulse
                
                # Check if we should switch to slow pour
                if not slow_pour_started and current_pulses >= slow_pour_pulses:
                    logger.debug("Switching to slow pour")
                    # Implement PWM or pulse the valve for slower flow
                    self._start_slow_pour()
                    slow_pour_started = True
                
                # Check if we've reached the target
                if current_volume >= target_volume:
                    logger.info(f"Target volume reached: {current_volume}ml")
                    break
                
                # Check for level sensor trigger (backup mechanism)
                if GPIO.input(self.level_sensor_pin) == GPIO.LOW:
                    logger.info("Level sensor triggered - cup near full")
                    break
                
                # Check for timeout or flow issues
                if (time.time() - start_time) > (volume / (self.flow_rate * 0.5)):
                    logger.error("Pour timeout - flow might be impeded")
                    break
                
                # Small delay to prevent CPU hogging
                time.sleep(0.1)
            
            # Close valve
            GPIO.output(self.valve_pin, GPIO.LOW)
            self.pouring = False
            
            # Final volume calculation
            final_volume = 0
            with self.flow_lock:
                final_volume = self.flow_count * ml_per_pulse
            
            logger.info(f"Pour completed: approximately {final_volume}ml dispensed")
            
            # Allow time for foam to settle
            time.sleep(1)
            
            return True
            
        except Exception as e:
            logger.error(f"Error during beer pouring: {e}")
            # Safety: ensure valve is closed
            GPIO.output(self.valve_pin, GPIO.LOW)
            self.pouring = False
            return False
    
    def _start_slow_pour(self):
        """Switch to slow pour mode using PWM."""
        # This would ideally be implemented with proper PWM
        # For simplicity, we'll use a simple on/off pattern
        GPIO.output(self.valve_pin, GPIO.LOW)
        time.sleep(0.1)
        GPIO.output(self.valve_pin, GPIO.HIGH)
    
    def stop_pour(self):
        """Emergency stop for pouring."""
        if self.pouring:
            GPIO.output(self.valve_pin, GPIO.LOW)
            self.pouring = False
            logger.info("Pour stopped manually")
    
    def get_beer_temperature(self):
        """
        Read the current beer temperature.
        
        Returns:
            float: Temperature in Celsius or None if error
        """
        # This is a simplified implementation
        # In reality, this would use a proper temperature sensor library
        try:
            # Simulated temperature reading between 2-8°C
            # In real implementation, this would read actual sensor data
            import random
            temp = round(random.uniform(2, 8), 1)
            logger.debug(f"Current beer temperature: {temp}°C")
            return temp
        except Exception as e:
            logger.error(f"Error reading beer temperature: {e}")
            return None
    
    def cleanup(self):
        """Release resources and clean up GPIO pins."""
        if self.initialized:
            # Stop any ongoing pour
            if self.pouring:
                self.stop_pour()
            
            # Remove event detection
            GPIO.remove_event_detect(self.flow_sensor_pin)
            
            # Clean up pins
            GPIO.cleanup([self.valve_pin, self.flow_sensor_pin, 
                          self.level_sensor_pin, self.temperature_sensor_pin])
            
            self.initialized = False
            logger.info("Beer dispenser resources cleaned up")
