"""
Age detection module using OpenAI vision capabilities.
"""
import os
import json
import logging
import base64
import openai
from openai import OpenAI

# Set up logging
logger = logging.getLogger(__name__)

# Initialize the OpenAI client
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def encode_image_to_base64(image_path):
    """
    Encode image to base64 string.
    
    Args:
        image_path (str): Path to image file
        
    Returns:
        str: Base64 encoded image
    """
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error encoding image to base64: {str(e)}")
        return None

def encode_image_bytes_to_base64(image_bytes):
    """
    Encode image bytes to base64 string.
    
    Args:
        image_bytes (bytes): Image bytes
        
    Returns:
        str: Base64 encoded image
    """
    try:
        return base64.b64encode(image_bytes).decode('utf-8')
    except Exception as e:
        logger.error(f"Error encoding image bytes to base64: {str(e)}")
        return None

def detect_age_from_image(image_data, image_is_path=False):
    """
    Detect age from an image using OpenAI API.
    
    Args:
        image_data (str or bytes): Path to image file or image bytes
        image_is_path (bool): Whether image_data is a file path or bytes
        
    Returns:
        dict: Detection results containing:
            - estimated_age (int): Estimated age
            - confidence (float): Confidence score between 0-1
            - is_adult (bool): Whether the person appears to be an adult (18+)
            - message (str): Descriptive message about the detection
    """
    # Check if API key is available
    if not OPENAI_API_KEY:
        logger.error("OpenAI API key not available")
        return {
            "estimated_age": 0,
            "confidence": 0.0,
            "is_adult": False,
            "message": "Age detection service unavailable. API key missing."
        }

    try:
        # Encode the image to base64
        if image_is_path:
            base64_image = encode_image_to_base64(image_data)
        else:
            # If it's already bytes
            if isinstance(image_data, bytes):
                base64_image = encode_image_bytes_to_base64(image_data)
            else:
                # If it's already a base64 string
                base64_image = image_data

        if not base64_image:
            return {
                "estimated_age": 0,
                "confidence": 0.0,
                "is_adult": False,
                "message": "Failed to process the image. Please try again."
            }

        # Create the OpenAI API request with JSON response format
        response = openai_client.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024
            messages=[
                {
                    "role": "system",
                    "content": "You are an age verification expert. Analyze the image and provide an estimated age, confidence score, and whether the person is at least 18 and 21 years old. Respond with JSON in this format: {'estimated_age': number, 'confidence': number between 0 and 1, 'is_over_18': boolean, 'is_over_21': boolean, 'reasoning': 'brief explanation'}"
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this image and determine the approximate age of the person. Provide the results as JSON as specified."
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"}
        )

        # Parse the result
        result = json.loads(response.choices[0].message.content)
        
        # Create the response with standardized fields
        return {
            "estimated_age": result.get("estimated_age", 0),
            "confidence": result.get("confidence", 0.0),
            "is_adult": result.get("is_over_18", False),
            "is_over_21": result.get("is_over_21", False),
            "message": result.get("reasoning", "Age analysis complete.")
        }
        
    except Exception as e:
        logger.error(f"Error during age detection: {str(e)}")
        return {
            "estimated_age": 0,
            "confidence": 0.0,
            "is_adult": False,
            "message": f"Age detection failed: {str(e)}"
        }

def verify_age_for_beverage(image_data, beverage_type, image_is_path=False):
    """
    Verify if the person in the image meets the age requirement for the selected beverage.
    
    Args:
        image_data (str or bytes): Path to image file or image bytes
        beverage_type (str): Type of beverage ('beer', 'kofola', etc.)
        image_is_path (bool): Whether image_data is a file path or bytes
        
    Returns:
        dict: Verification results
    """
    # Import here to avoid circular imports
    from config import BEVERAGE_POUR_SETTINGS
    
    # Get beverage settings
    beverage_settings = BEVERAGE_POUR_SETTINGS.get(beverage_type, BEVERAGE_POUR_SETTINGS['beer'])
    needs_verification = beverage_settings.get('REQUIRES_AGE_VERIFICATION', True)
    minimum_age = 21 if beverage_type == 'beer' else 18
    
    # If no verification needed, return success immediately
    if not needs_verification:
        return {
            "verified": True,
            "estimated_age": 21,  # Default value
            "confidence": 1.0,
            "message": f"No age verification required for {beverage_settings.get('NAME', beverage_type)}"
        }
    
    # Detect age
    detection_result = detect_age_from_image(image_data, image_is_path)
    
    # Check age requirement
    if beverage_type == 'beer' and detection_result.get('is_over_21', False):
        verified = True
        message = f"Age verification successful. You appear to be {detection_result['estimated_age']} years old, which meets the minimum age requirement of 21 for beer."
    elif beverage_type in ['kofola', 'birel'] and detection_result.get('is_adult', False):
        verified = True
        message = f"Age verification successful. You appear to be {detection_result['estimated_age']} years old, which meets the minimum age requirement of 18."
    else:
        verified = False
        message = f"Age verification failed. You must be at least {minimum_age} years old to order {beverage_type}."
    
    # Return results
    return {
        "verified": verified,
        "estimated_age": detection_result.get('estimated_age', 0),
        "confidence": detection_result.get('confidence', 0.0),
        "message": message
    }