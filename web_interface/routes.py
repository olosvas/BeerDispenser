"""
Routes for the beer dispensing system web interface.
"""
import logging
import time
from flask import render_template, request, jsonify, redirect, url_for, session
from web_interface.app import app

# Get language configuration
from config import LANGUAGES, DEFAULT_LANGUAGE

logger = logging.getLogger(__name__)

# This will be set when the web interface is initialized in main.py
_controller = None

def set_controller(controller):
    """
    Set the reference to the main controller.
    
    Args:
        controller: MainController instance
    """
    global _controller
    _controller = controller


@app.route('/')
def index():
    """Redirect to customer interface."""
    return redirect(url_for('customer'))


@app.route('/customer')
def customer():
    """Render the customer ordering interface."""
    if _controller is None:
        return render_template('customer.html', error="System not available")
    
    # Get language preference from the query parameter or session
    language = request.args.get('lang')
    if not language:
        language = session.get('language', DEFAULT_LANGUAGE)
    
    # Validate language and set default if invalid
    if language not in LANGUAGES:
        language = DEFAULT_LANGUAGE
    
    # Always update session with current language
    session['language'] = language
    
    # Log language for debugging
    logger.debug(f"Using language: {language}, session: {session}")
        
    system_state = _controller.get_system_state()
    # Only show customer interface if system is in idle state
    if system_state['state'] != 'idle' and system_state['state'] != 'error':
        error_message = "Systém je momentálne zaneprázdnený. Počkajte prosím chvíľu." if language == 'sk' else "System is currently busy. Please wait a moment."
        return render_template('customer.html', 
                              error=error_message,
                              state=system_state,
                              language=language)
    
    return render_template('customer.html', state=system_state, language=language)
