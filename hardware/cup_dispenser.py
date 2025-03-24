"""
Cup dispenser control module that manages cup storage and retrieval.
"""
import time
import logging
import RPi.GPIO as GPIO
from config import GPIO_PINS, CUP_SETTINGS

logger = logging.getLogger(__name__)

class CupDispenser:
    """Controls the mechanisms for dispensing cups."""
    
    def __init__(self):
        """Initialize the cup dispenser hardware components."""
        self.motor_pin = GPIO_PINS['CUP_DISPENSER_MOTOR']
        self.servo_pin = GPIO_PINS['CUP_DISPENSER_SERVO']
        self.position_sensor_pin = GPIO_PINS['CUP_POSITION_SENSOR']
        self.initialized = False
        self.dispense_delay = CUP_SETTINGS['DISPENSE_DELAY_SEC']
        self.detection_timeout = CUP_SETTINGS['DETECTION_TIMEOUT_SEC']
        
    def initialize(self):
        """Set up GPIO for the cup dispenser."""
        try:
            # Setup GPIO mode
            GPIO.setmode(GPIO.BCM)
            
            # Setup motor pin as output
            GPIO.setup(self.motor_pin, GPIO.OUT)
            GPIO.output(self.motor_pin, GPIO.LOW)
            
            # Setup servo pin as PWM output
            GPIO.setup(self.servo_pin, GPIO.OUT)
            self.servo_pwm = GPIO.PWM(self.servo_pin, 50)  # 50Hz frequency
            self.servo_pwm.start(0)  # Start with 0% duty cycle
            
            # Setup position sensor as input with pull-up
            GPIO.setup(self.position_sensor_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            
            self.initialized = True
            logger.info("Cup dispenser initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize cup dispenser: {e}")
            return False
            
    def dispense_cup(self):
        """
        Dispense a single cup and position it under the beer tap.
        
        Returns:
            bool: True if cup was successfully dispensed and positioned, False otherwise
        """
        if not self.initialized:
            if not self.initialize():
                return False
        
        try:
            logger.info("Starting cup dispensing sequence")
            
            # Activate the cup release mechanism (servo)
            self._set_servo_angle(90)  # Open the cup release mechanism
            time.sleep(0.5)
            self._set_servo_angle(0)   # Close the cup release mechanism
            
            # Wait for cup to drop
            time.sleep(self.dispense_delay)
            
            # Activate motor to move cup to position
            GPIO.output(self.motor_pin, GPIO.HIGH)
            
            # Wait for position sensor to detect cup or timeout
            start_time = time.time()
            cup_detected = False
            
            while (time.time() - start_time) < self.detection_timeout:
                if GPIO.input(self.position_sensor_pin) == GPIO.LOW:  # Cup detected (sensor triggered)
                    cup_detected = True
                    break
                time.sleep(0.1)
            
            # Stop the motor
            GPIO.output(self.motor_pin, GPIO.LOW)
            
            if cup_detected:
                logger.info("Cup successfully dispensed and positioned")
                return True
            else:
                logger.error("Cup positioning timeout - cup not detected at the target position")
                return False
                
        except Exception as e:
            logger.error(f"Error during cup dispensing: {e}")
            # Safety: ensure motor is stopped
            GPIO.output(self.motor_pin, GPIO.LOW)
            return False
    
    def _set_servo_angle(self, angle):
        """
        Set the servo to a specific angle.
        
        Args:
            angle (int): The angle to set (0-180 degrees)
        """
        # Convert angle to duty cycle (typically 2.5% - 12.5%)
        duty_cycle = 2.5 + (angle / 180.0) * 10.0
        self.servo_pwm.ChangeDutyCycle(duty_cycle)
        time.sleep(0.3)  # Allow time for servo to move
        
    def cleanup(self):
        """Release resources and clean up GPIO pins."""
        if self.initialized:
            self.servo_pwm.stop()
            GPIO.cleanup([self.motor_pin, self.servo_pin, self.position_sensor_pin])
            self.initialized = False
            logger.info("Cup dispenser resources cleaned up")
