#!/bin/bash
sed -i '/function selectBeverage(type) {/,/    }$/c \
    function selectBeverage(type) {\
        selectedBeverage = type;\
        \
        \/\/ Update UI\
        beverageTypeOptions.forEach(option => {\
            if (option.getAttribute('\''data-type'\'') === type) {\
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
        console.log('\''Selected beverage: '\'' + type);\
        \
        if (continueTypeBtn) continueTypeBtn.disabled = false;\
        \
        if (beverageTypeDisplay) {\
            const displayName = type.charAt(0).toUpperCase() + type.slice(1);\
            beverageTypeDisplay.textContent = displayName;\
        }\
        \
        \/\/ Save the state\
        saveState();\
    }' web_interface/static/customer.js
