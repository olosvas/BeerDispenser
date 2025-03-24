"""
Hardware module initialization.

This module provides access to hardware components, either real or simulated.
"""
import os

# Determine whether to use real hardware or mock implementation
USE_REAL_HARDWARE = os.environ.get('USE_REAL_GPIO', '0') == '1'

if USE_REAL_HARDWARE:
    try:
        # Try to import real hardware implementations
        from hardware.cup_dispenser import CupDispenser
        from hardware.beer_dispenser import BeerDispenser
        from hardware.cup_delivery import CupDelivery
        from hardware.sensors import SystemMonitor, WeightSensor
        from hardware.id_scanner import IDScanner
        print("Using real hardware implementations")
    except (ImportError, RuntimeError):
        # Fall back to mock implementations
        from hardware.mock_hardware import (
            MockCupDispenser as CupDispenser,
            MockBeerDispenser as BeerDispenser,
            MockCupDelivery as CupDelivery,
            MockSystemMonitor as SystemMonitor,
            MockWeightSensor as WeightSensor
        )
        from hardware.id_scanner import MockIDScanner as IDScanner
        print("Cannot use real hardware, using mock implementations")
else:
    # Use mock implementations
    from hardware.mock_hardware import (
        MockCupDispenser as CupDispenser,
        MockBeerDispenser as BeerDispenser,
        MockCupDelivery as CupDelivery,
        MockSystemMonitor as SystemMonitor,
        MockWeightSensor as WeightSensor
    )
    from hardware.id_scanner import MockIDScanner as IDScanner
    print("Using mock hardware implementations for simulation")