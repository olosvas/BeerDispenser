#!/bin/bash

# Add screen class to all screen elements
sed -i 's/id="selection-screen"/id="selection-screen" class="screen"/g' web_interface/templates/customer.html
sed -i 's/id="verification-screen" class="d-none"/id="verification-screen" class="screen d-none"/g' web_interface/templates/customer.html
sed -i 's/id="payment-screen" class="d-none"/id="payment-screen" class="screen d-none"/g' web_interface/templates/customer.html
sed -i 's/id="dispensing-screen" class="d-none"/id="dispensing-screen" class="screen d-none"/g' web_interface/templates/customer.html
sed -i 's/id="order-complete-screen" class="d-none"/id="order-complete-screen" class="screen d-none"/g' web_interface/templates/customer.html

# Verify changes
grep -n "class=\"screen" web_interface/templates/customer.html
