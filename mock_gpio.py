"""
Mock implementation of RPi.GPIO for simulation purposes.
This allows the beer dispensing system to run without actual Raspberry Pi hardware.
"""
import logging
import random
import time

logger = logging.getLogger(__name__)

# GPIO mode constants
BCM = 11
BOARD = 10
OUT = 0
IN = 1
HIGH = 1
LOW = 0
RISING = 31
FALLING = 32
BOTH = 33
PUD_UP = 22
PUD_DOWN = 21
PUD_OFF = 20

# Simulated GPIO state
_gpio_mode = None
_pin_states = {}
_pin_modes = {}
_event_callbacks = {}
_pwm_instances = {}

def setmode(mode):
    """Set the GPIO mode (BCM or BOARD)."""
    global _gpio_mode
    _gpio_mode = mode
    logger.debug(f"GPIO mode set to {'BCM' if mode == BCM else 'BOARD'}")

def getmode():
    """Get the current GPIO mode."""
    return _gpio_mode

def setup(channel, direction, pull_up_down=PUD_OFF, initial=None):
    """Set up a GPIO channel."""
    if isinstance(channel, list):
        for ch in channel:
            setup(ch, direction, pull_up_down, initial)
        return

    _pin_modes[channel] = direction

    if direction == OUT:
        _pin_states[channel] = HIGH if initial == HIGH else LOW
        logger.debug(f"Set up GPIO {channel} as OUTPUT with initial value {_pin_states[channel]}")
    else:
        _pin_states[channel] = LOW
        logger.debug(f"Set up GPIO {channel} as INPUT")

def input(channel):
    """Read the value of a GPIO pin."""
    # Simulate reading from a sensor with some randomness
    if channel not in _pin_states:
        _pin_states[channel] = LOW
    
    # For simulation, randomly change some input values occasionally
    if random.random() < 0.1 and _pin_modes.get(channel) == IN:
        _pin_states[channel] = random.choice([HIGH, LOW])
    
    logger.debug(f"Reading GPIO {channel}: {_pin_states[channel]}")
    return _pin_states[channel]

def output(channel, value):
    """Set the output state of a GPIO pin."""
    if isinstance(channel, list):
        for ch, val in zip(channel, value if isinstance(value, list) else [value] * len(channel)):
            output(ch, val)
        return

    _pin_states[channel] = value
    logger.debug(f"Setting GPIO {channel} to {value}")

def cleanup(channel=None):
    """Clean up GPIO resources."""
    global _pin_states, _pin_modes, _event_callbacks
    
    if channel is None:
        _pin_states = {}
        _pin_modes = {}
        _event_callbacks = {}
        logger.debug("Cleaned up all GPIO resources")
    elif isinstance(channel, list):
        for ch in channel:
            cleanup(ch)
    else:
        if channel in _pin_states:
            del _pin_states[channel]
        if channel in _pin_modes:
            del _pin_modes[channel]
        if channel in _event_callbacks:
            del _event_callbacks[channel]
        logger.debug(f"Cleaned up GPIO {channel}")

def add_event_detect(channel, edge, callback=None, bouncetime=None):
    """Add event detection to a GPIO channel."""
    _event_callbacks[channel] = callback
    logger.debug(f"Added event detection to GPIO {channel}")

def remove_event_detect(channel):
    """Remove event detection from a GPIO channel."""
    if channel in _event_callbacks:
        del _event_callbacks[channel]
    logger.debug(f"Removed event detection from GPIO {channel}")

def add_event_callback(channel, callback):
    """Add a callback for an event already defined using add_event_detect()."""
    _event_callbacks[channel] = callback
    logger.debug(f"Added event callback to GPIO {channel}")

def event_detected(channel):
    """Returns True if an edge has been detected on the channel."""
    return random.random() < 0.05  # Simulate occasional edge detection

# Simulate a PWM class for controlling motors, etc.
class PWM:
    """Pulse Width Modulation class for simulating motor control."""
    
    def __init__(self, channel, frequency):
        """Initialize PWM on the specified channel at the specified frequency."""
        self.channel = channel
        self.frequency = frequency
        self.duty_cycle = 0
        self.running = False
        _pwm_instances[channel] = self
        logger.debug(f"Created PWM instance for GPIO {channel} at {frequency}Hz")
    
    def start(self, duty_cycle):
        """Start PWM with the specified duty cycle."""
        self.duty_cycle = duty_cycle
        self.running = True
        logger.debug(f"Started PWM on GPIO {self.channel} with duty cycle {duty_cycle}%")
    
    def ChangeDutyCycle(self, duty_cycle):
        """Change the duty cycle."""
        self.duty_cycle = duty_cycle
        logger.debug(f"Changed duty cycle on GPIO {self.channel} to {duty_cycle}%")
    
    def ChangeFrequency(self, frequency):
        """Change the frequency."""
        self.frequency = frequency
        logger.debug(f"Changed frequency on GPIO {self.channel} to {frequency}Hz")
    
    def stop(self):
        """Stop PWM."""
        self.running = False
        logger.debug(f"Stopped PWM on GPIO {self.channel}")

# Utility functions to simulate hardware interactions
def trigger_input_event(channel, value):
    """
    Trigger an input event on a GPIO pin.
    This can be used to simulate sensor activation.
    """
    old_value = _pin_states.get(channel, LOW)
    _pin_states[channel] = value
    
    if channel in _event_callbacks and _event_callbacks[channel] is not None:
        edge = None
        if old_value == LOW and value == HIGH:
            edge = RISING
        elif old_value == HIGH and value == LOW:
            edge = FALLING
            
        if edge:
            logger.debug(f"Triggering event callback for GPIO {channel}")
            _event_callbacks[channel](channel)