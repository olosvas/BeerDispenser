#!/bin/bash

# Find the cart section and update it
sed -i '193s/<tbody id="cart-items">/<tbody id="cart-items-container">/' web_interface/templates/customer.html

# Add cart count element
sed -i '181a\                                <span id="cart-count" class="badge bg-primary cart-count">0</span>' web_interface/templates/customer.html

# Fix cart total ID
sed -i '199s/<td id="cart-total" class="fw-bold"><\/td>/<td id="cart-total-price" class="fw-bold"><\/td>/' web_interface/templates/customer.html

# Verify changes
grep -n "cart-items-container\|cart-count\|cart-total-price" web_interface/templates/customer.html
