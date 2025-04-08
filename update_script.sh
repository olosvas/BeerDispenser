#!/bin/bash

# Find and replace the showScreen function in customer.js
sed -i 's/const allScreens = document.querySelectorAll('\''\.container'\'');/const allScreens = document.querySelectorAll('\''\.screen'\'');/' web_interface/static/customer.js

# Verify the change
grep -n "const allScreens = document.querySelectorAll('.screen');" web_interface/static/customer.js
