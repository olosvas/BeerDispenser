document.addEventListener('DOMContentLoaded', function() {
    // Initialize state synchronization with server
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
        } else if (dispensingScreen && !dispensingScreen.classList.contains('d-none')) {
            return 'dispensing';
        } else if (orderComplete && !orderComplete.classList.contains('d-none')) {
            return 'complete';
        }
        return '';
    }
    
    // Get elements from the DOM
