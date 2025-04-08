#!/bin/bash

# Add continue button after beverage type selection
sed -i '138a\                            <div class="text-center mt-3">\n                                <button id="continue-type-btn" class="btn btn-primary btn-lg">\n                                    <i class="fas fa-arrow-right me-2"></i> {% if language == "sk" %}Pokračovať{% else %}Continue{% endif %}\n                                </button>\n                            </div>' web_interface/templates/customer.html

# Add back button in size selection
sed -i '158a\                                <div class="text-center mt-3">\n                                    <button id="back-to-type-btn" class="btn btn-outline-secondary btn-lg me-2">\n                                        <i class="fas fa-arrow-left me-2"></i> {% if language == "sk" %}Späť{% else %}Back{% endif %}\n                                    </button>\n                                    <button id="view-cart-from-size-btn" class="btn btn-primary btn-lg">\n                                        <i class="fas fa-shopping-cart me-2"></i> {% if language == "sk" %}Zobraziť košík{% else %}View Cart{% endif %}\n                                    </button>\n                                </div>' web_interface/templates/customer.html

# Verify changes
grep -n "continue-type-btn\|back-to-type-btn\|view-cart-from-size-btn" web_interface/templates/customer.html
