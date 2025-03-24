"""
Sensor management module for monitoring the beer dispensing system.
"""
import time
import logging
import threading
import RPi.GPIO as GPIO
from config import GPIO_PINS

logger = logging.getLogger(__name__)

class WeightSensor:
    """HX711 weight sensor integration for monitoring cup weight."""
    
    def __init__(self):
        """Initialize the weight sensor hardware connection."""
        self.data_pin = GPIO_PINS['WEIGHT_SENSOR_DATA']
        self.clock_pin = GPIO_PINS['WEIGHT_SENSOR_CLK']
        self.initialized = False
        self.reference_unit = 1  # Calibration value, needs adjustment for actual hardware
        
    def initialize(self):
        """Set up GPIO for the weight sensor (HX711)."""
        try:
            # Setup GPIO mode if not already set
            if GPIO.getmode() != GPIO.BCM:
                GPIO.setmode(GPIO.BCM)
            
            # Setup pins
            GPIO.setup(self.data_pin, GPIO.IN)
            GPIO.setup(self.clock_pin, GPIO.OUT)
            
            # Reset the HX711
            GPIO.output(self.clock_pin, GPIO.HIGH)
            time.sleep(0.1)
            GPIO.output(self.clock_pin, GPIO.LOW)
            
            # Wait for the HX711 to settle
            time.sleep(0.5)
            
            self.initialized = True
            logger.info("Weight sensor initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize weight sensor: {e}")
            return False
    
    def _read_raw_value(self):
        """
        Read a raw value from the HX711 weight sensor.
        
        This is a simplified implementation for demonstration.
        A proper library like hx711py should be used in production.
        
        Returns:
            int: Raw value read from the sensor
        """
        # Wait for the sensor to be ready
        while GPIO.input(self.data_pin) == GPIO.HIGH:
            pass
            
        # Read 24 bits of data
        count = 0
        for i in range(24):
            GPIO.output(self.clock_pin, GPIO.HIGH)
            time.sleep(0.000001)  # 1µs delay
            count = count << 1
            
            GPIO.output(self.clock_pin, GPIO.LOW)
            time.sleep(0.000001)  # 1µs delay
            
            if GPIO.input(self.data_pin) == GPIO.HIGH:
                count += 1
        
        # Set the channel and gain by pulsing the clock pin an additional time
        GPIO.output(self.clock_pin, GPIO.HIGH)
        time.sleep(0.000001)  # 1µs delay
        GPIO.output(self.clock_pin, GPIO.LOW)
        
        # 2's complement for negative values
        if count & 0x800000:
            count = count - (1 << 24)
        
        return count
    
    def get_weight(self):
        """
        Get the current weight reading in grams.
        
        Returns:
            float: Weight in grams or None if error
        """
        if not self.initialized:
            if not self.initialize():
                return None
        
        try:
            # Read multiple times and average for stability
            readings = []
            for _ in range(5):  # Take 5 readings
                readings.append(self._read_raw_value())
                time.sleep(0.1)
            
            # Remove outliers (optional improvement)
            readings.sort()
            if len(readings) >= 5:
                readings = readings[1:-1]  # Remove highest and lowest
            
            # Average the readings
            avg_reading = sum(readings) / len(readings)
            
            # Apply calibration factor
            weight = avg_reading / self.reference_unit
            
            logger.debug(f"Current weight reading: {weight}g")
            return weight
        except Exception as e:
            logger.error(f"Error reading weight: {e}")
            return None
    
    def tare(self):
        """
        Tare the scale (set current weight as zero reference).
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.initialized:
            if not self.initialize():
                return False
        
        try:
            # Read multiple times and average for stable tare value
            readings = []
            for _ in range(10):  # Take 10 readings for better accuracy
                readings.append(self._read_raw_value())
                time.sleep(0.1)
            
            # Average the readings
            tare_value = sum(readings) / len(readings)
            
            # Store as offset
            self.tare_offset = tare_value
            logger.info("Scale tared successfully")
            return True
        except Exception as e:
            logger.error(f"Error during tare: {e}")
            return False
    
    def cleanup(self):
        """Release resources and clean up GPIO pins."""
        if self.initialized:
            GPIO.cleanup([self.data_pin, self.clock_pin])
            self.initialized = False
            logger.info("Weight sensor resources cleaned up")


class SystemMonitor:
    """Monitor system state and sensor values."""
    
    def __init__(self):
        """Initialize the system monitoring."""
        self.weight_sensor = WeightSensor()
        self.monitoring_thread = None
        self.monitoring_active = False
        self.sensor_data = {
            'weight': 0,
            'cup_present': False,
            'beer_temperature': 0,
            'last_update': 0
        }
        self.data_lock = threading.Lock()
    
    def start_monitoring(self, interval=1.0):
        """
        Start continuous monitoring of sensors.
        
        Args:
            interval (float): Polling interval in seconds
        
        Returns:
            bool: True if monitoring started successfully, False otherwise
        """
        if self.monitoring_active:
            logger.info("Monitoring already active")
            return True
        
        try:
            # Initialize sensors
            if not self.weight_sensor.initialize():
                return False
            
            # Start monitoring thread
            self.monitoring_active = True
            self.monitoring_thread = threading.Thread(
                target=self._monitoring_loop,
                args=(interval,),
                daemon=True
            )
            self.monitoring_thread.start()
            logger.info(f"System monitoring started with {interval}s interval")
            return True
        except Exception as e:
            logger.error(f"Failed to start monitoring: {e}")
            self.monitoring_active = False
            return False
    
    def _monitoring_loop(self, interval):
        """Background thread for continuous sensor monitoring."""
        while self.monitoring_active:
            try:
                # Read weight sensor
                weight = self.weight_sensor.get_weight()
                
                # Read cup presence sensors
                cup_present = GPIO.input(GPIO_PINS['CUP_POSITION_SENSOR']) == GPIO.LOW
                
                # Update the sensor data dictionary
                with self.data_lock:
                    self.sensor_data['weight'] = weight if weight is not None else self.sensor_data['weight']
                    self.sensor_data['cup_present'] = cup_present
                    self.sensor_data['last_update'] = time.time()
                
                # Sleep for the specified interval
                time.sleep(interval)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(interval)  # Continue monitoring despite errors
    
    def get_sensor_data(self):
        """
        Get the latest sensor readings.
        
        Returns:
            dict: Current sensor values
        """
        with self.data_lock:
            # Return a copy to avoid threading issues
            return dict(self.sensor_data)
    
    def stop_monitoring(self):
        """Stop the monitoring thread and clean up."""
        self.monitoring_active = False
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            self.monitoring_thread.join(timeout=2.0)
        
        # Clean up sensors
        self.weight_sensor.cleanup()
        logger.info("System monitoring stopped")
