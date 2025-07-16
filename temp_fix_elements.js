    
    // Hide all screens
    function hideAllScreens() {
        beverageTypeSelection.classList.add('d-none');
        beverageSizeSelection.classList.add('d-none');
        const shoppingCart = document.getElementById('shopping-cart');
        if (shoppingCart) shoppingCart.classList.add('d-none');
        const paymentScreen = document.getElementById('payment-screen');
        if (paymentScreen) paymentScreen.classList.add('d-none');
        ageVerification.classList.add('d-none');
        dispensing.classList.add('d-none');
        ready.classList.add('d-none');
    }
    
    // Elements - Selection
