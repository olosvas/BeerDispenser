    if (newOrderBtn) {
        newOrderBtn.addEventListener('click', function() {

    // Reset the UI to initial state or restore from server
    function resetUI() {
        // If we should keep progress and have saved state, restore it
        if (keepProgress && (savedCartItems.length > 0 || savedBeverageType || savedSize || savedScreen)) {
            // Restore cart items
            if (savedCartItems.length > 0) {
                cartItems = savedCartItems;
                updateCartUI();
            }
            
            // Restore beverage selection
            if (savedBeverageType) {
                selectedBeverageType = savedBeverageType;
                // Find and select the beverage option
                beverageTypeOptions.forEach(opt => {
                    if (opt.dataset.type === selectedBeverageType) {
                        opt.classList.add('selected');
                        beverageTypeDisplay.textContent = opt.dataset.label || opt.textContent;
                        if (continueTypeBtn) continueTypeBtn.disabled = false;
                    }
                });
            }
            
            // Restore size selection
            if (savedSize) {
                selectedSize = savedSize;
                // Find and select the size option
                beverageSizeOptions.forEach(opt => {
                    if (opt.dataset.size === selectedSize) {
                        opt.classList.add('selected');
                        if (addToCartBtn) addToCartBtn.disabled = false;
                    }
                });
            }
            
            // Restore current screen
            if (savedScreen) {
                showScreen(savedScreen);
            }
            
            return; // Skip the reset below if we restored state
        }
        
        // Default reset if no saved state or not keeping progress
        selectedBeverageType = null;
        selectedSize = null;
        requiresAgeVerification = false;
        selectedPaymentMethod = null;
        
        // Reset cart
        cartItems = [];
        dispensingQueue = [];
        currentDispensingIndex = 0;
        
        // Reset selection highlights
        beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
        beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
        paymentMethodOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Reset buttons
        if (continueTypeBtn) continueTypeBtn.disabled = true;
        if (addToCartBtn) addToCartBtn.disabled = true;
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (processPaymentBtn) processPaymentBtn.disabled = true;
        
        // Reset quantity
        if (quantityInput) quantityInput.value = 1;
        
        // Hide progress steps
        if (!keepProgress && stepCircles) {
            stepCircles.forEach(circle => {
                circle.classList.remove('active');
                circle.classList.remove('completed');
            });
        }
        
        // Show the initial screen
        showBeverageTypeSelection();
        
        // Update cart UI
        updateCartUI();
    }
