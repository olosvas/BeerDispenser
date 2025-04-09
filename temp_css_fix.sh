#!/bin/bash
sed -i 's/    .beverage-type-option.selected, .beverage-size-option.selected {
        border-color: var(--bs-primary) !important;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }/    .beverage-type-option.selected, .beverage-size-option.selected {
        border-color: var(--bs-primary) !important;
        border-width: 3px !important;
        background-color: rgba(13, 110, 253, 0.1);
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        transform: translateY(-5px);
    }/' web_interface/templates/customer.html
