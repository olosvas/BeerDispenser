#!/bin/bash
sed -i '/function selectSize(size) {/,/    }$/c \
    function selectSize(size) {\
        selectedSize = size;\
        \
        \/\/ Update UI\
        beverageSizeOptions.forEach(option => {\
            if (parseInt(option.getAttribute('\''data-size'\''), 10) === size) {\
                option.classList.add('\''selected'\'');\
                option.style.borderColor = '\''#0d6efd'\'';\
                option.style.borderWidth = '\''3px'\'';\
                option.style.backgroundColor = '\''rgba(13, 110, 253, 0.1)'\'';\
                option.style.boxShadow = '\''0 0 0 0.25rem rgba(13, 110, 253, 0.25)'\'';\
                option.style.transform = '\''translateY(-5px)'\'';\
            } else {\
                option.classList.remove('\''selected'\'');\
                option.style.borderColor = '\'''\'';\
                option.style.borderWidth = '\'''\'';\
                option.style.backgroundColor = '\'''\'';\
                option.style.boxShadow = '\'''\'';\
                option.style.transform = '\'''\'';\
            }\
        });\
        \
        console.log('\''Selected size: '\'' + size);\
        \
        if (addToCartBtn) addToCartBtn.disabled = false;\
        \
        \/\/ Save the state\
        saveState();\
    }' web_interface/static/customer.js
