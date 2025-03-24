# Wiring Diagram for Automated Beer Dispensing System

## Overview of System Connections

```
+---------------------+    +----------------------+    +---------------------+
|                     |    |                      |    |                     |
| Raspberry Pi 4      |<-->| Sensors & Actuators  |<-->| Power Distribution  |
|                     |    |                      |    |                     |
+---------------------+    +----------------------+    +---------------------+
         ^                         ^                          ^
         |                         |                          |
         v                         v                          v
+---------------------+    +----------------------+    +---------------------+
|                     |    |                      |    |                     |
| User Interface      |    | Beer Flow Control    |    | 12V/5V Power Supply |
| (Touchscreen)       |    | System               |    |                     |
+---------------------+    +----------------------+    +---------------------+
```

## Detailed Connection Diagram

### Raspberry Pi GPIO Connections

```
Raspberry Pi 4
+---------------------------+
|                           |
| +---------------------+   |
| |  GPIO Header        |   |
| +---------------------+   |
|  1  2  3  4  5  6  7  8   |
|  9 10 11 12 13 14 15 16   |
| 17 18 19 20 21 22 23 24   |
| 25 26 27 28 29 30 31 32   |
| 33 34 35 36 37 38 39 40   |
+---------------------------+
```

### Cup Dispenser Subsystem

```
GPIO 18 (Pin 12) -----------------------> Servo Control
                                           |
                                           v
                                     +---------------+
                                     | Cup Dispenser |
                                     | Servo Motor   |
                                     +---------------+
                                           |
                                           v
GPIO 22 (Pin 15) <---------------------- Cup Presence Sensor
```

### Beer Dispensing Subsystem

```
GPIO 27 (Pin 13) ----> Relay Module -----> Solenoid Valve
                           |
                           v
                    +---------------+
                    | Beer Keg      |
                    | Connection    |
                    +---------------+
                           |
                           v
GPIO 17 (Pin 11) <---- Flow Sensor <----- Beer Line
                           |
                           v
                    +---------------+
                    | Dispensing    |
                    | Tap           |
                    +---------------+
                     
GPIO 4 (Pin 7) <------ Temperature Sensor
```

### Cup Delivery Subsystem

```
GPIO 13 (Pin 33) ----> Motor Driver -----> Conveyor Motor
                            |
GPIO 19 (Pin 35) ----> Motor Direction
                            |
                            v
                     +---------------+
                     | Conveyor Belt |
                     | Assembly      |
                     +---------------+
                            |
                            v
GPIO 23 (Pin 16) <----- Cup Position Sensor
```

### Weight Sensing Subsystem

```
GPIO 5 (Pin 29) <----- HX711 Data <----- Load Cell
                          |
GPIO 6 (Pin 31) <----- HX711 Clock
```

### System Status Indicators

```
GPIO 16 (Pin 36) ----> Status LED (Red)
GPIO 20 (Pin 38) ----> Status LED (Green) 
GPIO 21 (Pin 40) ----> Status LED (Blue)
GPIO 26 (Pin 37) <---- Maintenance Button
```

## Power Distribution

```
Main Power Supply (12V 5A)
        |
        +-------> 5V Voltage Regulator ------> Raspberry Pi & Logic Circuits
        |
        +-------> Relay Module ------> Solenoid Valve (12V)
        |
        +-------> Motor Driver ------> Conveyor Motor (12V)
```

## Notes on Wiring Safety

1. **Isolation**: Keep low voltage (GPIO) wiring separate from high voltage wiring.
2. **Short Circuit Protection**: Add fuses on main power lines.
3. **Wire Gauges**: 
   - Use 18-20 AWG for 12V power lines
   - Use 22-24 AWG for signal lines
4. **Shielding**: Use shielded cables for sensor signals to reduce interference.
5. **Strain Relief**: Add strain relief to all cable connections.
6. **Water Protection**: Ensure all electrical connections near beer lines are properly sealed and protected from moisture.

## Ground Connections

All components must share a common ground with the Raspberry Pi. Connect all ground pins together:

```
Raspberry Pi GND (Pin 6, 9, 14, 20, 25, 30, 34, or 39)
        |
        +-------> Relay Module GND
        |
        +-------> Motor Driver GND
        |
        +-------> HX711 GND
        |
        +-------> Sensor GND connections
        |
        +-------> Power Supply GND
```

## Pull-up Resistors

For sensors using digital inputs:
- 4.7kΩ pull-up resistor between the sensor signal and 3.3V
- Connect for Cup Presence Sensors and Push Buttons

## Level Shifters

If using 5V sensors with Raspberry Pi's 3.3V GPIO:
- Add a level shifter between the sensor output and GPIO pin
- Alternative: use a voltage divider (e.g., 2.2kΩ and 3.3kΩ resistors)

## Protection Circuits

For inductive loads (motors, solenoids):
- Add a flyback diode across the terminals
- Motor Driver should include this protection internally

## Recommended Connectors

1. Screw terminal blocks for power connections
2. JST connectors for sensor connections
3. Dupont connectors for Raspberry Pi GPIO connections
4. Waterproof connectors for any connections near liquid