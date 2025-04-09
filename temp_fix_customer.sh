#!/bin/bash
# Add extra debugging for selected states
sed -i '/selectBeverage(type);/{
a\        console.log("Selected beverage:", type);
}' web_interface/static/customer.js

sed -i '/selectSize(size);/{
a\        console.log("Selected size:", size);
}' web_interface/static/customer.js

# Ensure classList.add is using force
sed -i 's/this.classList.add('\''selected'\'');/this.classList.add('\''selected'\''); console.log("Added selected class to", this);/' web_interface/static/customer.js
