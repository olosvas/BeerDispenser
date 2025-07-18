    // State Management functions
    let cartItems = [];
    
    // Function to save current state to server
    function saveStateToServer() {
        fetch('/customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cart_items: cartItems,
                selected_beverage: selectedBeverageType,
                selected_size: selectedSize,
                current_screen: getCurrentScreen()
            })
        })
        .then(response => response.json())
        .then(data => console.log('State saved to server'))
        .catch(error => console.error('Error saving state:', error));
    }
    
    // Function to determine current active screen
    function getCurrentScreen() {
        if (beverageTypeSelection && !beverageTypeSelection.classList.contains('d-none')) {
            return 'beverage-type';
        } else if (beverageSizeSelection && !beverageSizeSelection.classList.contains('d-none')) {
            return 'beverage-size';
        } else if (shoppingCart && !shoppingCart.classList.contains('d-none')) {
            return 'shopping-cart';
        } else if (paymentScreen && !paymentScreen.classList.contains('d-none')) {
            return 'payment';
        } else if (ageVerification && !ageVerification.classList.contains('d-none')) {
            return 'age-verification';
        } else if (dispensing && !dispensing.classList.contains('d-none')) {
            return 'dispensing';
        } else if (ready && !ready.classList.contains('d-none')) {
            return 'complete';
        }
        return 'beverage-type'; // Default to first screen
    }
    
    // Function to restore UI based on saved state
    function restoreUIState(screenName) {
        // Hide all screens first
        hideAllScreens();
        
        // Show the appropriate screen
        if (screenName === 'beverage-type') {
            beverageTypeSelection.classList.remove('d-none');
            progressContainer.classList.add('d-none');
        } else if (screenName === 'beverage-size') {
            beverageSizeSelection.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('active');
        } else if (screenName === 'shopping-cart') {
            shoppingCart.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('completed');
            stepCart.classList.add('active');
        } else if (screenName === 'payment') {
            paymentScreen.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('completed');
            stepCart.classList.add('completed');
            stepPayment.classList.add('active');
        } else if (screenName === 'age-verification') {
            ageVerification.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('completed');
            stepVerification.classList.add('active');
        } else if (screenName === 'dispensing') {
            dispensing.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('completed');
            stepVerification.classList.add('completed');
            stepDispensing.classList.add('active');
        } else if (screenName === 'complete') {
            ready.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('completed');
            stepVerification.classList.add('completed');
            stepDispensing.classList.add('completed');
            stepPickup.classList.add('active');
        }
    }
    
    // Hide all screens
    function hideAllScreens() {
        beverageTypeSelection.classList.add('d-none');
        beverageSizeSelection.classList.add('d-none');
        shoppingCart && shoppingCart.classList.add('d-none');
        paymentScreen && paymentScreen.classList.add('d-none');
        ageVerification.classList.add('d-none');
        dispensing.classList.add('d-none');
        ready.classList.add('d-none');
    }
