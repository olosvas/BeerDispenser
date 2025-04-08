    function saveState() {
        // Save state to sessionStorage
        try {
            console.log('Saving state. Cart items:', cartItems.length);
            sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
            const currentScreen = getCurrentScreen();
            if (currentScreen) {
                console.log('Saving current screen:', currentScreen);
                sessionStorage.setItem('currentScreen', currentScreen);
            } else {
                console.log('Current screen not determined');
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }
