"""
Dispense sequence module that manages the beer dispensing steps.
"""
import logging
from config import ERROR_SETTINGS

logger = logging.getLogger(__name__)

class DispenseSequenceManager:
    """Manages the beer dispensing sequence with error handling and retries."""
    
    def __init__(self, cup_dispenser, beer_dispenser, cup_delivery, error_handler):
        """
        Initialize the dispense sequence manager.
        
        Args:
            cup_dispenser: Cup dispenser instance
            beer_dispenser: Beer dispenser instance
            cup_delivery: Cup delivery instance
            error_handler: Error handler instance
        """
        self.cup_dispenser = cup_dispenser
        self.beer_dispenser = beer_dispenser
        self.cup_delivery = cup_delivery
        self.error_handler = error_handler
        
        self.max_retries = ERROR_SETTINGS['MAX_RETRIES']
        self.retry_delay = ERROR_SETTINGS['RETRY_DELAY_SEC']
    
    def dispense_cup_with_retry(self):
        """
        Attempt to dispense a cup with retries on failure.
        
        Returns:
            bool: True if successful, False if all retries failed
        """
        for attempt in range(1, self.max_retries + 1):
            logger.info(f"Cup dispensing attempt {attempt}/{self.max_retries}")
            if self.cup_dispenser.dispense_cup():
                return True
            else:
                if attempt < self.max_retries:
                    error_msg = f"Cup dispensing failed, retrying... (attempt {attempt}/{self.max_retries})"
                    self.error_handler.log_error(error_msg)
                    import time
                    time.sleep(self.retry_delay)
                else:
                    self.error_handler.handle_error("Cup dispensing failed after maximum retries")
        return False
    
    def pour_beer_with_retry(self, volume_ml=None):
        """
        Attempt to pour beer with retries on failure.
        
        Args:
            volume_ml (float, optional): Volume to pour in milliliters.
        
        Returns:
            bool: True if successful, False if all retries failed
        """
        for attempt in range(1, self.max_retries + 1):
            logger.info(f"Beer pouring attempt {attempt}/{self.max_retries}")
            if self.beer_dispenser.pour_beer(volume_ml):
                return True
            else:
                if attempt < self.max_retries:
                    error_msg = f"Beer pouring failed, retrying... (attempt {attempt}/{self.max_retries})"
                    self.error_handler.log_error(error_msg)
                    import time
                    time.sleep(self.retry_delay)
                else:
                    self.error_handler.handle_error("Beer pouring failed after maximum retries")
        return False
    
    def deliver_cup_with_retry(self):
        """
        Attempt to deliver cup with retries on failure.
        
        Returns:
            bool: True if successful, False if all retries failed
        """
        for attempt in range(1, self.max_retries + 1):
            logger.info(f"Cup delivery attempt {attempt}/{self.max_retries}")
            if self.cup_delivery.deliver_cup():
                return True
            else:
                if attempt < self.max_retries:
                    error_msg = f"Cup delivery failed, retrying... (attempt {attempt}/{self.max_retries})"
                    self.error_handler.log_error(error_msg)
                    import time
                    time.sleep(self.retry_delay)
                else:
                    self.error_handler.handle_error("Cup delivery failed after maximum retries")
        return False
    
    def execute_full_sequence(self, volume_ml=None, beverage_type=None):
        """
        Execute the complete beverage dispensing sequence with error handling.
        
        Args:
            volume_ml (float, optional): Volume to pour in milliliters.
            beverage_type (str, optional): Type of beverage to pour ('beer', 'kofola', or 'birel').
            
        Returns:
            bool: True if all steps were successful, False otherwise
            str: Error message if a step failed, or None if successful
        """
        # Set beverage type if provided
        if beverage_type and hasattr(self.beer_dispenser, 'set_beverage_type'):
            self.beer_dispenser.set_beverage_type(beverage_type)
            beverage_name = beverage_type.capitalize()
        else:
            beverage_name = "Beer"
        
        # Step 1: Dispense cup
        if not self.dispense_cup_with_retry():
            return False, "Failed to dispense cup after multiple attempts"
        
        # Step 2: Pour beverage
        if not self.pour_beer_with_retry(volume_ml):
            return False, f"Failed to pour {beverage_name.lower()} after multiple attempts"
        
        # Step 3: Deliver cup
        if not self.deliver_cup_with_retry():
            return False, "Failed to deliver cup after multiple attempts"
        
        # All steps successful
        return True, None
