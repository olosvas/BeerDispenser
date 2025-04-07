"""
Webcam capture module for image acquisition for age verification.
"""
import os
import cv2
import time
import logging
import base64
import numpy as np
from datetime import datetime

# Set up logging
logger = logging.getLogger(__name__)

class WebcamCapture:
    """Handle webcam capture for age verification."""
    
    def __init__(self, temp_dir="temp_captures"):
        """
        Initialize the webcam capture.
        
        Args:
            temp_dir (str): Directory to store temporary captures
        """
        self.temp_dir = temp_dir
        
        # Create the temporary directory if it doesn't exist
        os.makedirs(self.temp_dir, exist_ok=True)
        
        # Initialize webcam
        self.cap = None
        self.is_initialized = False
        
    def initialize(self):
        """
        Initialize the webcam.
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # In a mock environment, allow initialization but don't actually connect
            if os.environ.get('MOCK_HARDWARE', 'true').lower() == 'true':
                logger.info("Mock webcam initialized")
                self.is_initialized = True
                return True
            
            # Try to initialize the webcam
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                logger.error("Failed to open webcam")
                return False
                
            # Set properties for better quality
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            
            self.is_initialized = True
            logger.info("Webcam initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing webcam: {str(e)}")
            return False
            
    def capture_image(self, save_to_file=False):
        """
        Capture an image from the webcam.
        
        Args:
            save_to_file (bool): Whether to save the image to a file
            
        Returns:
            tuple: (success, image_data) where image_data is bytes if not saved, or path if saved
        """
        # For mock environment, return a placeholder image
        if os.environ.get('MOCK_HARDWARE', 'true').lower() == 'true':
            # Generate a simple test image (gray background with timestamp)
            height, width = 720, 1280
            img = np.ones((height, width, 3), dtype=np.uint8) * 200  # Gray background
            
            # Add text with timestamp
            font = cv2.FONT_HERSHEY_SIMPLEX
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            text = f"MOCK WEBCAM - {timestamp}"
            textsize = cv2.getTextSize(text, font, 1, 2)[0]
            
            # Position text in the center
            textX = (width - textsize[0]) // 2
            textY = (height + textsize[1]) // 2
            
            cv2.putText(img, text, (textX, textY), font, 1, (0, 0, 0), 2)
            
            # Add a face-like circle (very simplified)
            center = (width // 2, height // 3)
            cv2.circle(img, center, 100, (150, 150, 150), -1)  # Head
            
            # Eyes
            eye_y = height // 3 - 20
            left_eye = (width // 2 - 40, eye_y)
            right_eye = (width // 2 + 40, eye_y)
            cv2.circle(img, left_eye, 15, (255, 255, 255), -1)
            cv2.circle(img, right_eye, 15, (255, 255, 255), -1)
            
            # Mouth
            mouth_y = height // 3 + 40
            cv2.ellipse(img, (width // 2, mouth_y), (50, 20), 0, 0, 180, (100, 100, 100), -1)
            
            # Convert to bytes
            _, buffer = cv2.imencode('.jpg', img)
            image_bytes = buffer.tobytes()
            
            if save_to_file:
                # Save to a temporary file
                filename = os.path.join(self.temp_dir, f"mock_capture_{int(time.time())}.jpg")
                with open(filename, 'wb') as f:
                    f.write(image_bytes)
                return True, filename
            else:
                return True, image_bytes
        
        # If not initialized, try to initialize
        if not self.is_initialized:
            success = self.initialize()
            if not success:
                return False, None
                
        try:
            if self.cap is None:
                logger.error("Webcam not initialized")
                return False, None
                
            # Capture a frame
            ret, frame = self.cap.read()
            if not ret:
                logger.error("Failed to capture frame")
                return False, None
                
            # Convert to bytes
            _, buffer = cv2.imencode('.jpg', frame)
            image_bytes = buffer.tobytes()
            
            if save_to_file:
                # Save to a temporary file
                filename = os.path.join(self.temp_dir, f"capture_{int(time.time())}.jpg")
                with open(filename, 'wb') as f:
                    f.write(image_bytes)
                return True, filename
            else:
                return True, image_bytes
                
        except Exception as e:
            logger.error(f"Error capturing image: {str(e)}")
            return False, None
            
    def release(self):
        """Release the webcam resources."""
        if self.cap is not None:
            self.cap.release()
            self.is_initialized = False
            logger.info("Webcam released")
            
    def __del__(self):
        """Destructor to ensure webcam is released."""
        self.release()
        
# Singleton instance for global use
webcam = WebcamCapture()