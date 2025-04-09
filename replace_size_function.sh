#!/bin/bash
# Make sure that in the selectSize function, we set selectedSize = size;
# instead of selectedSize = null; which is causing the error

sed -i '359,363c\
    function selectSize(size) {\
        selectedSize = size;\
        \
        // Update UI\
        beverageSizeOptions.forEach(option => {' web_interface/static/customer.js
chmod +x replace_size_function.sh
./replace_size_function.sh

echo "Fixed selectSize function"
