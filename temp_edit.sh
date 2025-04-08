#!/bin/bash

# Read the original content
original_content=$(cat web_interface/static/customer.js)

# Replace the image verification part
modified_content=$(echo "$original_content" | sed 's/image_data: base64Data/image_data: imageDataURL/g' | sed 's/beverage_types: cartItems.map(item => item.beverage).filter((value, index, self) => self.indexOf(value) === index)/beverage_type: cartItems.map(item => item.beverage).filter((value, index, self) => self.indexOf(value) === index)[0] || "beer"/g')

# Write the result back
echo "$modified_content" > web_interface/static/customer.js

# Verify the changes
grep -n "image_data:" web_interface/static/customer.js
grep -n "beverage_type:" web_interface/static/customer.js
