#!/bin/bash
sed -i '/<div class="card h-100 beverage-type-option border" data-type="kofola">/,/<\/div>/ s/<i class="fas fa-glass-cheers"><\/i>/<i class="fas fa-wine-bottle"><\/i>/' web_interface/templates/customer.html
