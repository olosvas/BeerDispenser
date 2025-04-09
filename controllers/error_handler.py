"""
Error handling module for the beer dispensing system.
"""
import time
import logging
import threading
from queue import Queue, Empty

logger = logging.getLogger(__name__)

class ErrorHandler:
    """Handles errors and provides retry and reporting functionality."""
    
    def __init__(self, max_errors=100):
        """
        Initialize the error handler.
        
        Args:
            max_errors (int): Maximum number of errors to store in history
        """
        self.error_queue = Queue()
        self.error_history = []
        self.max_errors = max_errors
        self.error_lock = threading.Lock()
        
        # Start error processing thread
        self.processing = True
        self.process_thread = threading.Thread(
            target=self._process_errors,
            daemon=True
        )
        self.process_thread.start()
    
    def handle_error(self, error_message, error_code=None, component=None):
        """
        Handle an error by recording it and triggering appropriate response.
        
        Args:
            error_message (str): Description of the error
            error_code (str, optional): Error code for categorization
            component (str, optional): Component where error occurred
        """
        # Log the error
        if component:
            logger.error(f"ERROR in {component}: {error_message}")
        else:
            logger.error(f"ERROR: {error_message}")
        
        # Create error record
        error_record = {
            'timestamp': time.time(),
            'message': error_message,
            'code': error_code,
            'component': component,
            'processed': False
        }
        
        # Add to error queue for processing
        self.error_queue.put(error_record)
        
        # Add to history with thread safety
        with self.error_lock:
            self.error_history.append(error_record)
            # Trim history if too long
            if len(self.error_history) > self.max_errors:
                self.error_history = self.error_history[-self.max_errors:]
    
    def _process_errors(self):
        """Background thread for processing errors from the queue."""
        while self.processing:
            try:
                # Try to get an error with a timeout to allow clean shutdown
                try:
                    error = self.error_queue.get(timeout=1.0)
                except Empty:
                    continue
                
                # Mark as processed
                error['processed'] = True
                
                # Update in history with thread safety
                with self.error_lock:
                    for i, hist_error in enumerate(self.error_history):
                        if (hist_error['timestamp'] == error['timestamp'] and 
                            hist_error['message'] == error['message']):
                            self.error_history[i] = error
                            break
                
                # Signal task done
                self.error_queue.task_done()
                
            except Exception as e:
                logger.error(f"Error in error processing thread: {e}")
    
    def log_error(self, message, component=None):
        """
        Log an error without triggering the full error handling process.
        
        Args:
            message (str): Error message
            component (str, optional): Component where error occurred
        """
        if component:
            logger.error(f"{component}: {message}")
        else:
            logger.error(message)
    
    def get_error_history(self):
        """
        Get the history of errors.
        
        Returns:
            list: Copy of error history list
        """
        with self.error_lock:
            # Return a copy to avoid threading issues
            return list(self.error_history)
    
    def stop(self):
        """Stop the error processing thread."""
        self.processing = False
        if self.process_thread.is_alive():
            self.process_thread.join(timeout=2.0)
