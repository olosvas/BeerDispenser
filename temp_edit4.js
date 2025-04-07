        });
    }
    // Show a specific screen based on saved state
    function showScreen(screenName) {
        // Hide all screens first
        const screens = [
            beverageTypeSelection,
            beverageSizeSelection,
            shoppingCart,
            paymentScreen,
            ageVerification,
            dispensingScreen,
            orderComplete
        ];
        screens.forEach(screen => {
            if (screen) screen.classList.add('d-none');
        });
        
        // Show the requested screen
        switch(screenName) {
            case 'beverage-type':
                if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
                updateStepCircles(1);
                break;
            case 'beverage-size':
                if (beverageSizeSelection) beverageSizeSelection.classList.remove('d-none');
                updateStepCircles(2);
                break;
            case 'shopping-cart':
                if (shoppingCart) shoppingCart.classList.remove('d-none');
                updateStepCircles(3);
                break;
            case 'payment':
                if (paymentScreen) paymentScreen.classList.remove('d-none');
                updateStepCircles(4);
                break;
            case 'age-verification':
                if (ageVerification) ageVerification.classList.remove('d-none');
                updateStepCircles(3); // Age verification is before checkout
                break;
            case 'dispensing':
                if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                updateStepCircles(5);
                break;
            case 'complete':
                if (orderComplete) orderComplete.classList.remove('d-none');
                updateStepCircles(6);
                break;
            default:
                if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
                updateStepCircles(1);
        }
        
        // Save the current state after changing screens
        saveStateToServer();
    }
