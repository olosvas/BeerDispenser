"""
Main controller module that coordinates all system components.
"""
import time
import logging
import threading
from hardware import CupDispenser, BeerDispenser, CupDelivery, SystemMonitor
from controllers.error_handler import ErrorHandler
from config import SYSTEM_STATES, BEVERAGE_POUR_SETTINGS, BEVERAGE_TYPES

logger = logging.getLogger(__name__)

class MainController:
    """Main controller for the automated beer dispensing system."""
    
    def __init__(self):
        """Initialize the main controller and hardware components."""
        # Initialize hardware components
        self.cup_dispenser = CupDispenser()
        self.beer_dispenser = BeerDispenser()
        self.cup_delivery = CupDelivery()
        self.system_monitor = SystemMonitor()
        
        # Initialize error handler
        self.error_handler = ErrorHandler()
        
        # System state
        self.current_state = SYSTEM_STATES['IDLE']
        self.state_lock = threading.Lock()
        self.operation_thread = None
        
        # Statistics
        self.stats = {
            'cups_dispensed': 0,
            'beers_poured': 0,
            'total_volume_ml': 0,
            'errors': 0,
            'last_operation_time': 0
        }
        self.stats_lock = threading.Lock()
    
    def initialize_system(self):
        """
        Initialize all hardware components and start system monitoring.
        
        Returns:
            bool: True if initialization was successful, False otherwise
        """
        try:
            logger.info("Initializing system...")
            
            # Initialize hardware components
            if not self.cup_dispenser.initialize():
                logger.error("Cup dispenser initialization failed")
                return False
            
            if not self.beer_dispenser.initialize():
                logger.error("Beer dispenser initialization failed")
                return False
            
            if not self.cup_delivery.initialize():
                logger.error("Cup delivery initialization failed")
                return False
            
            # Start system monitoring
            if not self.system_monitor.start_monitoring():
                logger.error("System monitoring initialization failed")
                return False
            
            logger.info("System initialization complete")
            return True
            
        except Exception as e:
            logger.error(f"System initialization error: {e}")
            return False
    
    def get_current_state(self):
        """
        Get the current state name of the system.
        
        Returns:
            str: Current state name
        """
        with self.state_lock:
            return self.current_state
    
    def get_system_state(self):
        """
        Get the current state of the system with detailed information.
        
        Returns:
            dict: Current state information
        """
        with self.state_lock:
            state = self.current_state
        
        with self.stats_lock:
            stats_copy = dict(self.stats)
        
        # Get sensor data
        sensor_data = self.system_monitor.get_sensor_data()
        
        # Get the current beverage type if available
        current_beverage = None
        if hasattr(self.beer_dispenser, 'get_current_beverage'):
            current_beverage = self.beer_dispenser.get_current_beverage()
        
        # Combine all information
        state_info = {
            'state': state,
            'stats': stats_copy,
            'sensors': sensor_data,
            'beer_temp': self.beer_dispenser.get_beer_temperature(),
            'current_beverage': current_beverage or 'beer'
        }
        
        return state_info
    
    def _set_state(self, new_state):
        """
        Update the system state with thread safety.
        
        Args:
            new_state (str): New state to set
        """
        with self.state_lock:
            previous_state = self.current_state
            self.current_state = new_state
        
        logger.info(f"System state changed: {previous_state} -> {new_state}")
    
    def dispense_beer(self, volume_ml=None, beverage_type=None):
        """
        Start the beverage dispensing sequence in a separate thread.
        
        Args:
            volume_ml (float, optional): Volume to pour in milliliters.
            beverage_type (str, optional): Type of beverage to pour ('beer', 'kofola', or 'birel').
        
        Returns:
            bool: True if operation started successfully, False otherwise
        """
        # Check if system is already in operation
        with self.state_lock:
            if self.current_state != SYSTEM_STATES['IDLE']:
                logger.warning(f"Cannot start operation while in {self.current_state} state")
                return False
        
        # Start operation in a separate thread
        self.operation_thread = threading.Thread(
            target=self._dispense_sequence,
            args=(volume_ml, beverage_type),
            daemon=True
        )
        self.operation_thread.start()
        return True
    
    def _dispense_sequence(self, volume_ml=None, beverage_type=None):
        """
        Execute the complete beverage dispensing sequence.
        
        Args:
            volume_ml (float, optional): Volume to pour in milliliters.
            beverage_type (str, optional): Type of beverage to pour ('beer', 'kofola', or 'birel').
        """
        start_time = time.time()
        success = False
        
        # If beverage type is provided, set it in the beer dispenser
        if beverage_type and hasattr(self.beer_dispenser, 'set_beverage_type'):
            self.beer_dispenser.set_beverage_type(beverage_type)
        
        try:
            # 1. Dispense cup
            self._set_state(SYSTEM_STATES['DISPENSING_CUP'])
            if not self.cup_dispenser.dispense_cup():
                raise Exception("Cup dispensing failed")
            
            # Update statistics
            with self.stats_lock:
                self.stats['cups_dispensed'] += 1
            
            # 2. Pour beverage
            self._set_state(SYSTEM_STATES['POURING_BEER'])  # 'POURING_BEER' is mapped to 'pouring_beverage' in config
            if not self.beer_dispenser.pour_beer(volume_ml, beverage_type):
                current_beverage_type = beverage_type or 'beer'
                raise Exception(f"{BEVERAGE_POUR_SETTINGS[current_beverage_type]['NAME']} pouring failed")
            
            # Update statistics
            current_beverage_type = beverage_type or 'beer'
            actual_volume = volume_ml if volume_ml is not None else BEVERAGE_POUR_SETTINGS[current_beverage_type]['DEFAULT_VOLUME_ML']
            
            with self.stats_lock:
                self.stats['beers_poured'] += 1
                self.stats['total_volume_ml'] += actual_volume
            
            # 3. Deliver cup
            self._set_state(SYSTEM_STATES['DELIVERING_CUP'])
            if not self.cup_delivery.deliver_cup():
                raise Exception("Cup delivery failed")
            
            # Sequence completed successfully
            success = True
            
        except Exception as e:
            logger.error(f"Error in dispensing sequence: {e}")
            self._set_state(SYSTEM_STATES['ERROR'])
            
            # Handle the error
            self.error_handler.handle_error(str(e))
            
            # Update error statistics
            with self.stats_lock:
                self.stats['errors'] += 1
        
        finally:
            # Return to idle state if not in error state
            if self.current_state != SYSTEM_STATES['ERROR']:
                self._set_state(SYSTEM_STATES['IDLE'])
            
            # Update operation time
            operation_time = time.time() - start_time
            with self.stats_lock:
                self.stats['last_operation_time'] = int(operation_time)
            
            logger.info(f"Dispensing sequence completed in {operation_time:.2f}s - Success: {success}")
    
    def stop_operation(self):
        """
        Emergency stop for any ongoing operation.
        
        Returns:
            bool: True if stop was successful, False otherwise
        """
        try:
            logger.warning("Emergency stop triggered")
            
            # Stop beer dispensing
            self.beer_dispenser.stop_pour()
            
            # Stop cup delivery
            self.cup_delivery.stop_conveyor()
            
            # Set state to idle
            self._set_state(SYSTEM_STATES['IDLE'])
            
            return True
        except Exception as e:
            logger.error(f"Error during emergency stop: {e}")
            return False
    
    def enter_maintenance_mode(self):
        """
        Put the system into maintenance mode.
        
        Returns:
            bool: True if mode change was successful, False otherwise
        """
        with self.state_lock:
            if self.current_state not in [SYSTEM_STATES['IDLE'], SYSTEM_STATES['ERROR']]:
                logger.warning(f"Cannot enter maintenance mode while in {self.current_state} state")
                return False
            
            self._set_state(SYSTEM_STATES['MAINTENANCE'])
            return True
    
    def exit_maintenance_mode(self):
        """
        Exit maintenance mode.
        
        Returns:
            bool: True if mode change was successful, False otherwise
        """
        with self.state_lock:
            if self.current_state != SYSTEM_STATES['MAINTENANCE']:
                logger.warning("System not in maintenance mode")
                return False
            
            self._set_state(SYSTEM_STATES['IDLE'])
            return True
    
    def reset_system(self):
        """
        Reset the system to an idle state.
        
        Returns:
            bool: True if reset was successful, False otherwise
        """
        try:
            logger.info("System reset initiated")
            
            # Stop any ongoing operations
            self.stop_operation()
            
            # Reset error state if applicable
            if self.current_state == SYSTEM_STATES['ERROR']:
                self._set_state(SYSTEM_STATES['IDLE'])
                
            # Reset statistics
            with self.stats_lock:
                self.stats['errors'] = 0
                # Avoid setting None to numeric fields
                if 'last_error' in self.stats:
                    self.stats.pop('last_error', None)
                if 'last_error_time' in self.stats:
                    self.stats.pop('last_error_time', None)
                
            # Clear error history if the method exists
            if hasattr(self.error_handler, 'clear_error_history'):
                self.error_handler.clear_error_history()
            # Alternative approach if method doesn't exist
            elif hasattr(self.error_handler, 'error_history'):
                self.error_handler.error_history = []
            
            logger.info("System reset complete")
            return True
        except Exception as e:
            logger.error(f"Error during system reset: {e}")
            return False
            
    def shutdown(self):
        """
        Properly shut down all system components.
        
        Returns:
            bool: True if shutdown was successful, False otherwise
        """
        try:
            logger.info("System shutdown initiated")
            
            # Stop any ongoing operations
            self.stop_operation()
            
            # Stop monitoring
            self.system_monitor.stop_monitoring()
            
            # Clean up hardware resources
            self.cup_dispenser.cleanup()
            self.beer_dispenser.cleanup()
            self.cup_delivery.cleanup()
            
            logger.info("System shutdown complete")
            return True
        except Exception as e:
            logger.error(f"Error during system shutdown: {e}")
            return False
