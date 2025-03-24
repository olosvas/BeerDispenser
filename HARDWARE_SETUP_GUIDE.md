# Automated Beer Dispensing System - Hardware Setup Guide

## Required Hardware Components

### Core System
- **Raspberry Pi 4B** (4GB RAM recommended) with power supply
- **MicroSD Card** (16GB or larger) with Raspberry Pi OS
- **7" Touchscreen Display** for Raspberry Pi (official or compatible)
- **Case** for Raspberry Pi and display
- **Wi-Fi Dongle** (if not using built-in Wi-Fi)
- **Ethernet Cable** (optional, for wired network connection)

### Beer Dispensing System
- **Solenoid Valve** (12V, food-grade) - controls beer flow
- **Flow Sensor** (YF-S201 or similar, food-grade) - measures beer volume
- **Temperature Sensor** (DS18B20 waterproof) - monitors beer temperature
- **Peristaltic Pump** (12V, food-grade) - for precise flow control

### Cup Handling System
- **Servo Motor** (MG996R or similar) - for cup dispensing mechanism
- **DC Motor** (12V) with driver - for conveyor belt
- **Conveyor Belt Assembly** - for cup delivery
- **Proximity Sensors** (IR) - for cup position detection

### Weight System
- **Load Cell** (5kg capacity)
- **HX711 Load Cell Amplifier** - for weight measurements

### Power and Control
- **12V Power Supply** (5A minimum)
- **5V Voltage Regulator** - for logic level components
- **Relay Module** (4-channel) - for controlling high-power components
- **PWM Motor Driver Module** - for DC motors
- **Breadboard and Jumper Wires**
- **Terminal Blocks** for secure connections

### Enclosure and Structure
- **Aluminum Profile Frame** (20x20mm) - for structural support
- **Acrylic Sheets** - for enclosure
- **Food-grade Silicone Tubing** - for beer lines
- **Cup Storage Tube** - for stacking cups
- **3D Printed Parts** - various mounts and adapters (STL files included)

## GPIO Pin Connections

| Component | GPIO Pin | Notes |
|-----------|----------|-------|
| Cup Dispenser Servo | GPIO 18 (Pin 12) | PWM capable pin |
| Flow Sensor | GPIO 17 (Pin 11) | Uses interrupts |
| Temperature Sensor | GPIO 4 (Pin 7) | 1-Wire interface |
| Beer Valve Relay | GPIO 27 (Pin 13) | |
| Conveyor Motor Control | GPIO 13 (Pin 33) | PWM capable pin |
| Conveyor Direction | GPIO 19 (Pin 35) | |
| Cup Sensor 1 | GPIO 22 (Pin 15) | Input with pull-up |
| Cup Sensor 2 | GPIO 23 (Pin 16) | Input with pull-up |
| HX711 Data | GPIO 5 (Pin 29) | |
| HX711 Clock | GPIO 6 (Pin 31) | |
| Maintenance Button | GPIO 26 (Pin 37) | Input with pull-up |
| Status LED Red | GPIO 16 (Pin 36) | |
| Status LED Green | GPIO 20 (Pin 38) | |
| Status LED Blue | GPIO 21 (Pin 40) | |

## Software Setup

### Operating System Installation
1. Download the Raspberry Pi Imager from [raspberrypi.org](https://www.raspberrypi.org/software/)
2. Flash Raspberry Pi OS (32-bit) to the microSD card
3. Configure Wi-Fi credentials and enable SSH during flashing
4. Insert the microSD card into the Raspberry Pi and power it on

### Dependencies Installation

```bash
# Update package list
sudo apt update
sudo apt upgrade -y

# Install required packages
sudo apt install -y python3-pip python3-dev nginx supervisor git

# Install required Python packages
pip3 install RPi.GPIO flask gunicorn flask-sqlalchemy psycopg2-binary

# Clone the repository
git clone https://github.com/your-username/beer-dispensing-system.git
cd beer-dispensing-system

# Setup the service
sudo cp deployment/beer-dispenser.service /etc/systemd/system/
sudo systemctl enable beer-dispenser
sudo systemctl start beer-dispenser
```

### Code Modifications for Hardware

1. In your project folder, modify the file `main.py` by commenting out the mock GPIO import:

```python
# Comment out this line
# import mock_gpio as GPIO
# Uncomment this line
import RPi.GPIO as GPIO
```

2. In `flask_app.py`, uncomment the real hardware imports and comment out the mock imports:

```python
# Use real hardware implementations
from hardware.beer_dispenser import BeerDispenser
from hardware.cup_dispenser import CupDispenser
from hardware.cup_delivery import CupDelivery
from hardware.sensors import WeightSensor, SystemMonitor

# Comment out mock implementations
# from hardware.mock_hardware import MockBeerDispenser as BeerDispenser
# from hardware.mock_hardware import MockCupDispenser as CupDispenser
# from hardware.mock_hardware import MockCupDelivery as CupDelivery
# from hardware.mock_hardware import MockWeightSensor as WeightSensor
# from hardware.mock_hardware import MockSystemMonitor as SystemMonitor
```

## Hardware Assembly Instructions

### Step 1: Raspberry Pi Setup
1. Assemble the Raspberry Pi in its case with the touchscreen display
2. Connect power and boot up the system
3. Ensure Wi-Fi or Ethernet connection is working

### Step 2: Electrical Connections
1. **Power Distribution**:
   - Connect 12V power supply to the relay module and motor drivers
   - Use 5V regulator to power the Raspberry Pi and sensors

2. **Sensor Connections**:
   - Connect sensors to GPIO pins as per the pin mapping table
   - For temperature sensor, include a 4.7kΩ pull-up resistor between data and VCC

3. **Actuator Connections**:
   - Connect the solenoid valve to the relay module
   - Connect servo motor for cup dispensing to PWM pin
   - Connect DC motor for conveyor via the motor driver

### Step 3: Beer Line Setup
1. Connect food-grade tubing from the beer source to the solenoid valve
2. Install the flow sensor inline with the tubing
3. Connect the output tubing to the dispensing tap
4. Ensure all connections are secure and leak-free

### Step 4: Cup Handling Mechanism
1. Mount the cup storage tube vertically
2. Install the servo motor to control cup release mechanism
3. Position cup sensors to detect successful dispensing
4. Ensure the cup is positioned correctly under the beer tap after dispensing

### Step 5: Conveyor System
1. Assemble the conveyor belt frame
2. Mount the DC motor and connect to the conveyor belt
3. Position proximity sensors for cup tracking
4. Test conveyor movement and speed control

### Step 6: Weight Measurement
1. Install the load cell under the cup dispensing position
2. Connect the load cell to the HX711 amplifier
3. Calibrate the weight measurement system

## Calibration Procedures

### Flow Sensor Calibration
1. Update the flow rate constant in `hardware/beer_dispenser.py`:
```python
# Calibrate this value by measuring actual flow
self.flow_calibration_factor = 7.5  # pulses per milliliter
```

2. Run the calibration script:
```bash
python3 calibration/flow_calibration.py
```

### Weight Sensor Calibration
1. Place a known weight on the load cell (e.g., 100g)
2. Run the calibration script:
```bash
python3 calibration/weight_calibration.py
```

3. Update the calibration factor in `hardware/sensors.py`

## Maintenance and Troubleshooting

### Regular Maintenance
- Clean beer lines weekly using food-grade sanitizer
- Check and tighten all electrical connections monthly
- Lubricate moving parts of conveyor and cup dispenser quarterly
- Replace silicone tubing annually

### Troubleshooting Common Issues
- **No Power**: Check power supply and connections
- **Flow Sensor Not Working**: Ensure no air bubbles in line, check connections
- **Cup Dispenser Failure**: Check servo operation and cup stack alignment
- **Temperature Reading Issues**: Check sensor connections and placement
- **Weight Sensing Issues**: Recalibrate load cell, check for obstructions

## Safety Considerations
- Always disconnect power before servicing electrical components
- Use only food-grade materials for beer contact surfaces
- Install a GFCI outlet for the power supply
- Include an emergency stop button
- Regularly check for leaks in the beer line system

## Operational Testing
After assembly and calibration, perform a complete system test:
1. Power on the system
2. Navigate to the admin interface at `http://[raspberry-pi-ip]:5000/admin`
3. Test each component individually using the control interface
4. Perform a complete dispensing cycle
5. Verify temperature, flow, and weight measurements

## Additional Resources
- Raspberry Pi GPIO documentation: [raspberry-pi-gpio](https://www.raspberrypi.org/documentation/usage/gpio/)
- Food safety guidelines: [FDA Food Code](https://www.fda.gov/food/fda-food-code/food-code-2017)
- Electrical safety: [NEC Guidelines](https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70)