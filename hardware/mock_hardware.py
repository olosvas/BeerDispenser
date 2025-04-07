"""
Mock implementations of hardware components for simulation purposes.
This module provides mock versions of hardware interfaces
that can be used without actual Raspberry Pi hardware.
"""
import time
import random
import logging
import threading
from config import (
    BEVERAGE_TYPES,
    BEVERAGE_POUR_SETTINGS,
    BEER_POUR_SETTINGS,
    CUP_SETTINGS,
    DELIVERY_SETTINGS
)

logger = logging.getLogger(__name__)

class MockCupDispenser:
    """Mock implementation of cup dispenser hardware."""
    
    def __init__(self):
        """Initialize the mock cup dispenser."""
        self.initialized = False
        self.servo_angle = 0
        logger.debug("Mock cup dispenser initialized")
    
    def initialize(self):
        """Set up the mock cup dispenser."""
        self.initialized = True
        return True
    
    def dispense_cup(self):
        """Simulate dispensing a cup."""
        if not self.initialized:
            logger.error("Cup dispenser not initialized")
            return False
        
        # Simulate dispensing time
        time.sleep(CUP_SETTINGS['DISPENSE_DELAY_SEC'])
        
        # Simulate success rate (90% success)
        success = random.random() < 0.9
        if success:
            logger.debug("Cup dispensed successfully")
        else:
            logger.error("Failed to dispense cup")
        
        return success
    
    def _set_servo_angle(self, angle):
        """Simulate setting servo angle."""
        self.servo_angle = angle
        logger.debug(f"Servo set to {angle} degrees")
    
    def cleanup(self):
        """Release mock resources."""
        self.initialized = False
        logger.debug("Cup dispenser cleaned up")
        return True


class MockBeerDispenser:
    """Mock implementation of beverage dispenser hardware."""
    
    def __init__(self):
        """Initialize the mock beverage dispenser."""
        self.initialized = False
        self.valve_open = {
            'beer': False,
            'kofola': False,
            'birel': False
        }
        self.pouring = False
        self.flow_count = 0
        self.current_beverage = 'beer'  # Default beverage type
        self.pour_thread = None
        self.stop_pouring = False
        logger.debug("Mock beer dispenser initialized")
    
    def initialize(self):
        """Set up the mock beverage dispenser."""
        self.initialized = True
        return True
    
    def _flow_sensor_callback(self, channel):
        """Simulate flow sensor pulse."""
        self.flow_count += 1
    
    def pour_beer(self, volume_ml=None, beverage_type=None):
        """
        Simulate pouring a beverage.
        
        Args:
            volume_ml (float, optional): Volume to pour in milliliters.
            beverage_type (str, optional): Type of beverage to pour ('beer', 'kofola', or 'birel').
        
        Returns:
            bool: True if pouring started successfully, False otherwise
        """
        if not self.initialized:
            logger.error("Beverage dispenser not initialized")
            return False
        
        if self.pouring:
            logger.error("Already pouring a beverage")
            return False
        
        # Set current beverage type
        if beverage_type and beverage_type in BEVERAGE_TYPES:
            self.current_beverage = beverage_type
        
        # Get settings for the current beverage
        settings = BEVERAGE_POUR_SETTINGS[self.current_beverage]
        
        # Use specified volume or default
        volume = volume_ml if volume_ml is not None else settings['DEFAULT_VOLUME_ML']
        
        # Reset flow count and set pouring state
        self.flow_count = 0
        self.pouring = True
        self.stop_pouring = False
        
        # Create thread to simulate pouring
        self.pour_thread = threading.Thread(target=self._pour_simulation, args=(volume,))
        self.pour_thread.daemon = True
        self.pour_thread.start()
        
        # Simulate success rate (95% success)
        success = random.random() < 0.95
        
        if not success:
            self.stop_pour()
            logger.error(f"Failed to start {settings['NAME']} pour")
        else:
            logger.debug(f"Pouring {volume}ml of {settings['NAME']}")
        
        return success
    
    def _pour_simulation(self, volume):
        """Simulate the pouring process in a separate thread."""
        # Get settings for the current beverage
        settings = BEVERAGE_POUR_SETTINGS[self.current_beverage]
        
        # Simulate valve opening
        self.valve_open[self.current_beverage] = True
        
        # Calculate pour time based on volume and flow rate
        flow_rate = settings['FLOW_RATE_ML_PER_SEC']
        pour_time = volume / flow_rate
        
        # Simulate slow pour for foam control
        slow_threshold = volume * settings['SLOW_POUR_THRESHOLD']
        slow_rate = settings['SLOW_POUR_RATE']
        
        start_time = time.time()
        elapsed = 0
        poured = 0
        
        # Simulation loop
        while poured < volume and not self.stop_pouring:
            elapsed = time.time() - start_time
            
            # Calculate amount poured so far
            if poured < slow_threshold:
                # Normal flow rate
                poured = elapsed * flow_rate
            else:
                # Slow pour rate for foam control
                normal_pour_time = slow_threshold / flow_rate
                slow_pour_elapsed = elapsed - normal_pour_time
                poured = slow_threshold + (slow_pour_elapsed * flow_rate * slow_rate)
            
            # Simulate flow sensor pulses
            pulses_per_ml = random.uniform(1.0, 1.2)  # Simulate some variability
            self.flow_count = int(poured * pulses_per_ml)
            
            # Sleep a short time to reduce CPU usage
            time.sleep(0.1)
        
        # Pouring complete or stopped
        self.valve_open[self.current_beverage] = False
        self.pouring = False
        
        if not self.stop_pouring:
            logger.debug(f"Pour complete: {poured:.1f}ml in {elapsed:.1f} seconds")
        else:
            logger.debug(f"Pour stopped: {poured:.1f}ml in {elapsed:.1f} seconds")
    
    def _start_slow_pour(self):
        """Simulate switching to slow pour mode."""
        logger.debug("Switching to slow pour mode")
    
    def stop_pour(self):
        """Simulate emergency stop for pouring."""
        if self.pouring:
            self.stop_pouring = True
            logger.debug(f"{BEVERAGE_POUR_SETTINGS[self.current_beverage]['NAME']} pour stopped")
            if self.pour_thread and self.pour_thread.is_alive():
                self.pour_thread.join(1.0)  # Wait for pour thread to finish
            self.valve_open[self.current_beverage] = False
            self.pouring = False
            return True
        return False
    
    def get_beer_temperature(self):
        """Simulate reading the beverage temperature."""
        # Get settings for the current beverage
        settings = BEVERAGE_POUR_SETTINGS[self.current_beverage]
        
        # Generate random temperature between min and max for this beverage
        temp = random.uniform(settings['TEMPERATURE_MIN'], settings['TEMPERATURE_MAX'])
        logger.debug(f"Beer temperature: {temp:.1f}°C")
        return temp
    
    def set_beverage_type(self, beverage_type):
        """
        Set the current beverage type.
        
        Args:
            beverage_type (str): Type of beverage ('beer', 'kofola', or 'birel')
            
        Returns:
            bool: True if successfully set, False otherwise
        """
        if beverage_type in BEVERAGE_TYPES:
            self.current_beverage = beverage_type
            return True
        return False
    
    def get_current_beverage(self):
        """
        Get the current beverage type.
        
        Returns:
            str: Current beverage type
        """
        return self.current_beverage
    
    def cleanup(self):
        """Release mock resources."""
        self.stop_pour()
        self.initialized = False
        logger.debug("Beverage dispenser cleaned up")
        return True


class MockCupDelivery:
    """Mock implementation of cup delivery hardware."""
    
    def __init__(self):
        """Initialize the mock cup delivery system."""
        self.initialized = False
        self.conveyor_running = False
        self.conveyor_speed = 0
        self.delivery_thread = None
        self.stop_conveyor_flag = False
        logger.debug("Mock cup delivery initialized")
    
    def initialize(self):
        """Set up the mock cup delivery system."""
        self.initialized = True
        return True
    
    def deliver_cup(self):
        """Simulate moving a filled cup to the pickup location."""
        if not self.initialized:
            logger.error("Cup delivery system not initialized")
            return False
        
        if self.conveyor_running:
            logger.error("Delivery system already in use")
            return False
        
        # Use default speed and timeout from settings
        speed = DELIVERY_SETTINGS['CONVEYOR_SPEED']
        timeout = DELIVERY_SETTINGS['DELIVERY_TIMEOUT_SEC']
        
        # Start simulated delivery
        result = self.move_conveyor(speed, timeout)
        
        if result:
            logger.debug("Cup delivered successfully")
        else:
            logger.error("Failed to deliver cup")
        
        return result
    
    def move_conveyor(self, speed=None, duration=None):
        """Simulate manual control of the conveyor."""
        if not self.initialized:
            logger.error("Cup delivery system not initialized")
            return False
        
        if self.conveyor_running:
            logger.error("Conveyor already running")
            return False
        
        # Use defaults if not specified
        actual_speed = speed if speed is not None else DELIVERY_SETTINGS['CONVEYOR_SPEED']
        
        # Reset stop flag
        self.stop_conveyor_flag = False
        self.conveyor_running = True
        self.conveyor_speed = actual_speed
        
        if duration is not None:
            # Start a thread to run for the specified duration
            self.delivery_thread = threading.Thread(
                target=self._timed_conveyor_run,
                args=(duration,)
            )
            self.delivery_thread.daemon = True
            self.delivery_thread.start()
        
        # Simulate success rate (93% success)
        success = random.random() < 0.93
        
        if not success:
            self.stop_conveyor()
            logger.error("Failed to start conveyor")
        else:
            logger.debug(f"Conveyor started at speed {actual_speed}%")
        
        return success
    
    def _timed_conveyor_run(self, duration):
        """Simulate running the conveyor for a specific duration."""
        time.sleep(duration)
        if not self.stop_conveyor_flag:
            self.conveyor_running = False
            self.conveyor_speed = 0
            logger.debug(f"Conveyor stopped after {duration} seconds")
    
    def stop_conveyor(self):
        """Simulate stopping the conveyor."""
        if self.conveyor_running:
            self.stop_conveyor_flag = True
            self.conveyor_running = False
            self.conveyor_speed = 0
            logger.debug("Conveyor stopped")
            return True
        return False
    
    def cleanup(self):
        """Release mock resources."""
        self.stop_conveyor()
        self.initialized = False
        logger.debug("Cup delivery system cleaned up")
        return True


class MockWeightSensor:
    """Mock implementation of weight sensor hardware."""
    
    def __init__(self):
        """Initialize the mock weight sensor."""
        self.initialized = False
        self.tare_value = 0.0
        self.simulated_weight = 0.0
        logger.debug("Mock weight sensor initialized")
    
    def initialize(self):
        """Set up the mock weight sensor."""
        self.initialized = True
        # Set a random small tare value
        self.tare_value = random.uniform(0, 5)
        return True
    
    def _read_raw_value(self):
        """Simulate reading a raw value from the sensor."""
        # Add some noise to the reading
        noise = random.uniform(-2, 2)
        return self.simulated_weight + self.tare_value + noise
    
    def get_weight(self):
        """Simulate getting the current weight reading in grams."""
        if not self.initialized:
            logger.error("Weight sensor not initialized")
            return None
        
        raw = self._read_raw_value()
        # Simulate calibration factor
        weight = raw * 0.1
        
        logger.debug(f"Weight reading: {weight:.1f}g")
        return weight
    
    def tare(self):
        """Simulate taring the scale."""
        if not self.initialized:
            logger.error("Weight sensor not initialized")
            return False
        
        # Set a new random small tare value
        self.tare_value = random.uniform(0, 5)
        logger.debug("Weight sensor tared")
        return True
    
    def cleanup(self):
        """Release mock resources."""
        self.initialized = False
        logger.debug("Weight sensor cleaned up")
        return True


class MockSystemMonitor:
    """Mock implementation of system monitoring."""
    
    def __init__(self):
        """Initialize the mock system monitoring."""
        self.monitoring = False
        self.monitor_thread = None
        self.stop_monitoring_flag = False
        self.sensor_data = {
            'cup_present': False,
            'weight': 0,
            'last_update': time.time()
        }
        self.weight_sensor = MockWeightSensor()
        logger.debug("Mock system monitor initialized")
    
    def start_monitoring(self, interval=1.0):
        """Simulate starting continuous monitoring of sensors."""
        if self.monitoring:
            logger.error("Monitoring already active")
            return False
        
        # Initialize weight sensor
        if not self.weight_sensor.initialized:
            self.weight_sensor.initialize()
        
        # Reset stop flag
        self.stop_monitoring_flag = False
        self.monitoring = True
        
        # Start monitoring thread
        self.monitor_thread = threading.Thread(
            target=self._monitoring_loop,
            args=(interval,)
        )
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        
        logger.debug(f"System monitoring started with interval {interval}s")
        return True
    
    def _monitoring_loop(self, interval):
        """Simulate background thread for continuous sensor monitoring."""
        while not self.stop_monitoring_flag:
            # Simulate cup presence (change occasionally)
            if random.random() < 0.1:
                self.sensor_data['cup_present'] = random.choice([True, False])
            
            # Simulate weight changes
            if self.sensor_data['cup_present']:
                # If cup present, simulate filled or filling cup
                if random.random() < 0.3:
                    # Gradually increase weight to simulate filling
                    target_weight = random.uniform(400, 550)
                    current_weight = self.sensor_data['weight']
                    
                    # Move towards target weight
                    self.sensor_data['weight'] += (target_weight - current_weight) * 0.2
            else:
                # If no cup, weight should be near zero
                self.sensor_data['weight'] = random.uniform(0, 5)
            
            # Update the weight sensor's simulated weight
            self.weight_sensor.simulated_weight = self.sensor_data['weight']
            
            # Update last update timestamp
            self.sensor_data['last_update'] = time.time()
            
            # Sleep for the specified interval
            time.sleep(interval)
        
        # Monitoring stopped
        self.monitoring = False
        logger.debug("System monitoring stopped")
    
    def get_sensor_data(self):
        """Simulate getting the latest sensor readings."""
        # Return a copy of the sensor data
        return dict(self.sensor_data)
    
    def stop_monitoring(self):
        """Simulate stopping the monitoring thread."""
        if self.monitoring:
            self.stop_monitoring_flag = True
            logger.debug("Requesting monitoring stop")
            if self.monitor_thread and self.monitor_thread.is_alive():
                self.monitor_thread.join(2.0)  # Wait for thread to finish
            
            # Clean up weight sensor
            self.weight_sensor.cleanup()
            
            return True
        return False