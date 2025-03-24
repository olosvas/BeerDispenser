# Calibration Guide for Automated Beer Dispensing System

Proper calibration of the sensors and actuators is critical for the accurate and reliable operation of the beer dispensing system. This guide provides step-by-step procedures for calibrating each component.

## Flow Sensor Calibration

The flow sensor needs to be calibrated to accurately measure the volume of beer dispensed.

### Equipment Needed
- Measuring cup or graduated cylinder (1000ml minimum, with 10ml precision)
- Stopwatch
- Calculator
- Water (for initial calibration)

### Procedure

1. **Initial Setup:**
   - Connect the flow sensor in line with the liquid flow path
   - Ensure all connections are secure and leak-free
   - Make sure the system is in maintenance mode

2. **Create Calibration Script:**
   Create a file called `flow_calibration.py` with the following content:

   ```python
   import RPi.GPIO as GPIO
   import time
   import threading
   
   # Flow sensor configuration
   FLOW_SENSOR_PIN = 17  # GPIO pin connected to flow sensor
   pulses = 0  # Counter for flow sensor pulses
   
   def pulse_counter(channel):
       """Increment pulse counter when the flow sensor sends a pulse."""
       global pulses
       pulses += 1
   
   def reset_counter():
       """Reset the pulse counter to zero."""
       global pulses
       pulses = 0
   
   def setup():
       """Set up GPIO and event detection for flow sensor."""
       GPIO.setmode(GPIO.BCM)
       GPIO.setup(FLOW_SENSOR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
       GPIO.add_event_detect(FLOW_SENSOR_PIN, GPIO.FALLING, callback=pulse_counter)
   
   def main():
       """Main calibration routine."""
       setup()
       
       try:
           while True:
               # Reset counter
               reset_counter()
               
               # Instructions
               print("\nFlow Sensor Calibration")
               print("======================")
               print("1. Prepare a measuring container")
               print("2. Position the beer tap over the container")
               print("3. Press Enter to start flow")
               input("Press Enter when ready...")
               
               print("Opening valve... Flow starting...")
               # In a real system, this would activate the solenoid valve
               # For calibration, manually open the tap when prompted
               
               reset_counter()
               start_time = time.time()
               
               print("Collecting flow data... Press Enter to stop flow")
               input()
               
               duration = time.time() - start_time
               total_pulses = pulses
               
               print(f"Flow stopped after {duration:.2f} seconds")
               print(f"Total pulses counted: {total_pulses}")
               
               # Get the actual volume
               volume_ml = float(input("Enter the actual volume collected (in ml): "))
               
               # Calculate calibration factor
               if volume_ml > 0 and total_pulses > 0:
                   calibration_factor = total_pulses / volume_ml
                   print(f"\nCalibration Results:")
                   print(f"Calibration factor: {calibration_factor:.4f} pulses per ml")
                   print(f"For code, use: self.flow_calibration_factor = {calibration_factor:.4f}")
               else:
                   print("Error: Volume or pulse count is zero!")
               
               continue_cal = input("\nRun another calibration? (y/n): ")
               if continue_cal.lower() != 'y':
                   break
               
       except KeyboardInterrupt:
           print("\nCalibration interrupted by user")
       finally:
           GPIO.cleanup()
           print("Calibration complete, GPIO cleaned up")
   
   if __name__ == "__main__":
       main()
   ```

3. **Run the Calibration:**
   - Run the script: `python3 flow_calibration.py`
   - Follow the on-screen instructions
   - Collect at least 500ml of liquid for accurate results
   - Repeat 3 times and average the results

4. **Update Configuration:**
   - Open `hardware/beer_dispenser.py`
   - Update the flow calibration factor with your measured value:
     ```python
     self.flow_calibration_factor = 7.5  # Replace with your calculated value
     ```

5. **Verification:**
   - Dispense a known volume (e.g., 300ml)
   - Measure the actual volume dispensed
   - If there's more than 5% difference, repeat the calibration

## Weight Sensor (Load Cell) Calibration

The weight sensor needs to be calibrated to accurately measure the weight of dispensed beer.

### Equipment Needed
- Known weights (e.g., 100g, 200g, 500g)
- Empty cup (same type as will be used in the system)

### Procedure

1. **Initial Setup:**
   - Ensure the load cell is properly mounted
   - Make sure there's nothing on the load cell platform

2. **Create Calibration Script:**
   Create a file called `weight_calibration.py` with the following content:

   ```python
   import RPi.GPIO as GPIO
   import time
   import statistics
   
   # HX711 configuration
   HX711_DAT_PIN = 5
   HX711_CLK_PIN = 6
   
   class HX711_Simplified:
       def __init__(self, dout_pin, pd_sck_pin):
           self.PD_SCK = pd_sck_pin
           self.DOUT = dout_pin
           
           GPIO.setmode(GPIO.BCM)
           GPIO.setup(self.PD_SCK, GPIO.OUT)
           GPIO.setup(self.DOUT, GPIO.IN)
           
           self.offset = 0
           self.scale = 1
           
           # Power up the chip
           GPIO.output(self.PD_SCK, False)
           time.sleep(0.1)
   
       def read(self):
           # Wait for the chip to become ready
           while GPIO.input(self.DOUT) == 1:
               pass
           
           # Clock in the data
           count = 0
           for i in range(24):
               GPIO.output(self.PD_SCK, True)
               count = count << 1
               GPIO.output(self.PD_SCK, False)
               if GPIO.input(self.DOUT):
                   count += 1
           
           # Set the channel and gain
           for i in range(1):
               GPIO.output(self.PD_SCK, True)
               GPIO.output(self.PD_SCK, False)
           
           # Convert 2's complement to signed int
           if count & 0x800000:
               count = count - 0x1000000
           
           return count
   
       def read_average(self, times=10):
           readings = []
           for _ in range(times):
               readings.append(self.read())
               time.sleep(0.1)
           return statistics.mean(readings)
   
       def tare(self, times=10):
           self.offset = self.read_average(times)
           return self.offset
   
       def set_scale(self, scale):
           self.scale = scale
   
       def get_weight(self, times=10):
           return (self.read_average(times) - self.offset) / self.scale
   
   def main():
       print("HX711 Weight Sensor Calibration")
       print("===============================")
       
       # Initialize the HX711
       hx = HX711_Simplified(HX711_DAT_PIN, HX711_CLK_PIN)
       
       try:
           # Tare scale
           print("Ensure nothing is on the scale.")
           input("Press Enter to tare...")
           offset = hx.tare(times=20)
           print(f"Tare complete. Offset value: {offset}")
           
           # Calibration with known weight
           weight_grams = float(input("\nEnter the weight you will place on the scale (in grams): "))
           
           print(f"Place the {weight_grams}g weight on the scale.")
           input("Press Enter when ready...")
           
           measured_value = hx.read_average(20)
           scale_factor = (measured_value - offset) / weight_grams
           
           print(f"\nCalibration Results:")
           print(f"Scale factor: {scale_factor}")
           print(f"For code, use: self.scale_factor = {scale_factor}")
           
           # Verify calibration
           hx.set_scale(scale_factor)
           
           print("\nVerification:")
           while True:
               weight = hx.get_weight(5)
               print(f"Measured weight: {weight:.1f} grams")
               
               cmd = input("\nPress Enter to measure again, or 'q' to quit: ")
               if cmd.lower() == 'q':
                   break
                   
       except KeyboardInterrupt:
           print("\nCalibration interrupted by user")
       finally:
           GPIO.cleanup()
           print("Calibration complete, GPIO cleaned up")
   
   if __name__ == "__main__":
       main()
   ```

3. **Run the Calibration:**
   - Run the script: `python3 weight_calibration.py`
   - Follow the on-screen instructions
   - Use a weight that's roughly equivalent to a half-full cup of beer (~250-350g)

4. **Update Configuration:**
   - Open `hardware/sensors.py`
   - Update the scale factor with your measured value:
     ```python
     self.scale_factor = 850.4  # Replace with your calculated value
     ```

5. **Verification:**
   - Place different known weights on the sensor
   - Verify the readings match the actual weights
   - If accuracy is poor, repeat the calibration

## Temperature Sensor Calibration

Temperature sensors (DS18B20) are factory-calibrated but should be verified.

### Equipment Needed
- Ice water (0°C reference)
- Boiling water (100°C reference, adjust for altitude)
- Regular thermometer (for verification)

### Procedure

1. **Read Ice Water Temperature:**
   - Prepare a glass of ice water and let it stabilize
   - Insert the temperature sensor probe into the ice water
   - Run the following command to check readings:
     ```bash
     python3 -c "from hardware.sensors import *; s = SystemMonitor(); s.initialize(); print(f'Temperature: {s.get_sensor_data()['temperature']:.1f}°C')"
     ```
   - The reading should be close to 0°C

2. **Read Room Temperature:**
   - Let the sensor stabilize at room temperature
   - Compare with a regular thermometer
   - The readings should be within ±0.5°C

3. **Offsets (if needed):**
   - If there's a consistent offset, modify the temperature reading in the code:
     ```python
     # In hardware/sensors.py or hardware/beer_dispenser.py
     def get_beer_temperature(self):
         raw_temp = # existing code to get temperature
         return raw_temp - 0.5  # Apply calibration offset
     ```

## Servo Motor Calibration (Cup Dispenser)

The servo motor needs to be calibrated to properly dispense cups.

### Equipment Needed
- Several cups of the type to be used in the system

### Procedure

1. **Create Calibration Script:**
   Create a file called `servo_calibration.py` with the following content:

   ```python
   import RPi.GPIO as GPIO
   import time
   
   # Servo configuration
   SERVO_PIN = 18
   
   def setup():
       GPIO.setmode(GPIO.BCM)
       GPIO.setup(SERVO_PIN, GPIO.OUT)
       return GPIO.PWM(SERVO_PIN, 50)  # 50Hz PWM frequency
   
   def set_angle(pwm, angle):
       duty = 2.5 + (angle / 18.0)  # Convert angle to duty cycle
       pwm.ChangeDutyCycle(duty)
       time.sleep(0.5)
   
   def main():
       print("Servo Motor Calibration for Cup Dispenser")
       print("=========================================")
       
       pwm = setup()
       pwm.start(0)
       
       try:
           # Initial position
           print("Moving servo to initial position (0 degrees)")
           set_angle(pwm, 0)
           time.sleep(1)
           
           while True:
               try:
                   angle = float(input("\nEnter angle to test (0-180), or -1 to quit: "))
                   if angle < 0:
                       break
                       
                   if 0 <= angle <= 180:
                       print(f"Setting servo to {angle} degrees")
                       set_angle(pwm, angle)
                       
                       result = input("Did this position work correctly? (y/n): ")
                       if result.lower() == 'y':
                           print(f"\nCalibration Results:")
                           print(f"For code, use: self._set_servo_angle({angle})")
                           
                   else:
                       print("Angle must be between 0 and 180 degrees")
                       
               except ValueError:
                   print("Please enter a valid number")
                   
       finally:
           pwm.stop()
           GPIO.cleanup()
           print("Calibration complete, GPIO cleaned up")
   
   if __name__ == "__main__":
       main()
   ```

2. **Run the Calibration:**
   - Run the script: `python3 servo_calibration.py`
   - Test different angles to find:
     - Cup holding position (servo angle that holds cups in stack)
     - Cup release position (servo angle that releases one cup)

3. **Update Configuration:**
   - Open `hardware/cup_dispenser.py`
   - Update the servo angles:
     ```python
     self.servo_hold_angle = 10  # Replace with your calibrated value
     self.servo_release_angle = 75  # Replace with your calibrated value
     ```

4. **Verification:**
   - Test the cup dispensing mechanism with a stack of cups
   - Ensure exactly one cup is released at a time

## Conveyor Motor Calibration

The conveyor motor speed needs to be calibrated for smooth cup delivery.

### Equipment Needed
- Cups of the type to be used in the system
- Stopwatch

### Procedure

1. **Create Calibration Script:**
   Create a file called `conveyor_calibration.py` with the following content:

   ```python
   import RPi.GPIO as GPIO
   import time
   
   # Motor configuration
   MOTOR_ENABLE_PIN = 13
   MOTOR_DIR_PIN = 19
   
   def setup():
       GPIO.setmode(GPIO.BCM)
       GPIO.setup(MOTOR_ENABLE_PIN, GPIO.OUT)
       GPIO.setup(MOTOR_DIR_PIN, GPIO.OUT)
       
       # Set direction forward
       GPIO.output(MOTOR_DIR_PIN, GPIO.HIGH)
       
       return GPIO.PWM(MOTOR_ENABLE_PIN, 100)  # 100Hz PWM frequency
   
   def main():
       print("Conveyor Motor Calibration")
       print("=========================")
       
       pwm = setup()
       
       try:
           # Start with motor off
           pwm.start(0)
           
           while True:
               try:
                   speed = float(input("\nEnter speed percentage (0-100), or -1 to quit: "))
                   if speed < 0:
                       break
                   
                   if 0 <= speed <= 100:
                       print(f"Setting motor to {speed}% speed")
                       pwm.ChangeDutyCycle(speed)
                       
                       input("Press Enter to stop motor...")
                       pwm.ChangeDutyCycle(0)
                       
                       result = input("Did this speed work correctly? (y/n): ")
                       if result.lower() == 'y':
                           print(f"\nCalibration Results:")
                           print(f"For code, use: self.conveyor_speed = {speed}")
                           
                   else:
                       print("Speed must be between 0 and 100 percent")
                       
               except ValueError:
                   print("Please enter a valid number")
                   
       finally:
           pwm.stop()
           GPIO.cleanup()
           print("Calibration complete, GPIO cleaned up")
   
   if __name__ == "__main__":
       main()
   ```

2. **Run the Calibration:**
   - Run the script: `python3 conveyor_calibration.py`
   - Test different speeds to find the optimal conveyor speed

3. **Update Configuration:**
   - Open `hardware/cup_delivery.py`
   - Update the conveyor speed settings:
     ```python
     self.default_speed = 50  # Replace with your calibrated value
     ```

4. **Verification:**
   - Place a cup on the conveyor
   - Test the delivery process
   - Adjust speed if cup movement is too fast or too slow

## System-wide Calibration

After calibrating individual components, perform a full system calibration:

1. **Dispensing Speed Test:**
   - Time how long it takes to dispense different volumes of beer
   - Adjust pour speeds for optimal foam formation

2. **Cup Positioning Test:**
   - Ensure the cup is positioned correctly under the tap
   - Adjust physical mounting if needed

3. **Complete Sequence Test:**
   - Run the complete dispensing sequence multiple times
   - Time each step and adjust delays if needed
   - Update in `controllers/dispense_sequence.py`

## Maintenance and Recalibration

- **Frequency:** Recalibrate the system monthly or after component replacement
- **Temperature Variations:** Check calibration at different ambient temperatures
- **Beer Type Adjustments:** Different beers may require different pouring parameters
- **Drift Checking:** Periodically verify all sensor readings against known references