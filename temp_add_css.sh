#!/bin/bash
sed -i '7a<link rel="stylesheet" href="{{ url_for('"'"'static'"'"', filename='"'"'custom_beverage.css'"'"') }}">' web_interface/templates/customer.html
