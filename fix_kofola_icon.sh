#!/bin/bash
sed -i '/<div class="card h-100 beverage-type-option border" data-type="kofola">/,/<\/div>/ s/<i class="fas fa-glass-whiskey"><\/i>/<i class="fas fa-mug-hot"><\/i>/' web_interface/templates/customer.html
