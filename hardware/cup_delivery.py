"""
Cup delivery control module for moving filled cups to the delivery station.
"""
import time
import logging
import RPi.GPIO as GPIO
from config import GPIO_PINS, DELIVERY_SETTINGS

logger = logging.getLogger(__name__)

class CupDelivery:
    """Controls the mechanisms for delivering filled cups to the pickup location."""
    
    def __init__(self):
        """Initialize the cup delivery hardware components."""
        self.motor1_pin = GPIO_PINS['DELIVERY_MOTOR_1']
        self.motor2_pin = GPIO_PINS['DELIVERY_MOTOR_2']
        self.position_sensor_pin = GPIO_PINS['DELIVERY_POSITION_SENSOR']
        
        self.conveyor_speed = DELIVERY_SETTINGS['CONVEYOR_SPEED']
        self.delivery_timeout = DELIVERY_SETTINGS['DELIVERY_TIMEOUT_SEC']
        
        self.initialized = False
        self.motor_pwm1 = None
        self.motor_pwm2 = None
        
    def initialize(self):
        """Set up GPIO for the cup delivery system."""
        try:
            # Setup GPIO mode if not already set
            if GPIO.getmode() != GPIO.BCM:
                GPIO.setmode(GPIO.BCM)
            
            # Setup motor pins as output
            GPIO.setup(self.motor1_pin, GPIO.OUT)
            GPIO.setup(self.motor2_pin, GPIO.OUT)
            
            # Initialize PWM for motor speed control
            self.motor_pwm1 = GPIO.PWM(self.motor1_pin, 100)  # 100Hz frequency
            self.motor_pwm2 = GPIO.PWM(self.motor2_pin, 100)
            
            # Start PWM with 0% duty cycle (stopped)
            self.motor_pwm1.start(0)
            self.motor_pwm2.start(0)
            
            # Setup position sensor as input
            GPIO.setup(self.position_sensor_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            
            self.initialized = True
            logger.info("Cup delivery system initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize cup delivery system: {e}")
            return False
    
    def deliver_cup(self):
        """
        Move the filled cup from the dispensing position to the pickup location.
        
        Returns:
            bool: True if cup was successfully delivered, False otherwise
        """
        if not self.initialized:
            if not self.initialize():
                return False
        
        try:
            logger.info("Starting cup delivery sequence")
            
            # Start the conveyor motors at specified speed
            self.motor_pwm1.ChangeDutyCycle(self.conveyor_speed)
            self.motor_pwm2.ChangeDutyCycle(self.conveyor_speed)
            
            # Wait for position sensor to detect cup at delivery position or timeout
            start_time = time.time()
            cup_delivered = False
            
            while (time.time() - start_time) < self.delivery_timeout:
                if GPIO.input(self.position_sensor_pin) == GPIO.LOW:  # Cup detected at delivery position
                    cup_delivered = True
                    break
                time.sleep(0.1)
            
            # Stop the motors
            self.motor_pwm1.ChangeDutyCycle(0)
            self.motor_pwm2.ChangeDutyCycle(0)
            
            if cup_delivered:
                logger.info("Cup successfully delivered to pickup location")
                return True
            else:
                logger.error("Cup delivery timeout - cup not detected at pickup location")
                return False
                
        except Exception as e:
            logger.error(f"Error during cup delivery: {e}")
            # Safety: ensure motors are stopped
            if self.motor_pwm1:
                self.motor_pwm1.ChangeDutyCycle(0)
            if self.motor_pwm2:
                self.motor_pwm2.ChangeDutyCycle(0)
            return False
    
    def move_conveyor(self, speed=None, duration=None):
        """
        Manual control to move the conveyor at specified speed for a duration.
        
        Args:
            speed (int, optional): Speed percentage (0-100). Uses default if None.
            duration (float, optional): Duration in seconds. Runs until stopped if None.
        
        Returns:
            bool: True if operation was successful, False otherwise
        """
        if not self.initialized:
            if not self.initialize():
                return False
        
        try:
            speed_value = speed if speed is not None else self.conveyor_speed
            
            # Set motor speed
            self.motor_pwm1.ChangeDutyCycle(speed_value)
            self.motor_pwm2.ChangeDutyCycle(speed_value)
            
            if duration is not None:
                # Run for specified duration then stop
                time.sleep(duration)
                self.motor_pwm1.ChangeDutyCycle(0)
                self.motor_pwm2.ChangeDutyCycle(0)
            
            return True
            
        except Exception as e:
            logger.error(f"Error controlling conveyor: {e}")
            # Safety: ensure motors are stopped
            if self.motor_pwm1:
                self.motor_pwm1.ChangeDutyCycle(0)
            if self.motor_pwm2:
                self.motor_pwm2.ChangeDutyCycle(0)
            return False
    
    def stop_conveyor(self):
        """Stop the conveyor motors."""
        if self.initialized:
            try:
                self.motor_pwm1.ChangeDutyCycle(0)
                self.motor_pwm2.ChangeDutyCycle(0)
                logger.info("Conveyor stopped")
                return True
            except Exception as e:
                logger.error(f"Error stopping conveyor: {e}")
                return False
        return False
    
    def cleanup(self):
        """Release resources and clean up GPIO pins."""
        if self.initialized:
            # Stop the conveyor
            self.stop_conveyor()
            
            # Clean up PWM resources
            if self.motor_pwm1:
                self.motor_pwm1.stop()
            if self.motor_pwm2:
                self.motor_pwm2.stop()
            
            # Clean up pins
            GPIO.cleanup([self.motor1_pin, self.motor2_pin, self.position_sensor_pin])
            
            self.initialized = False
            logger.info("Cup delivery system resources cleaned up")
