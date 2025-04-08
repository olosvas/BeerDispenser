    function updateCartDisplay() {
        if (!cartItemsContainer) {
            console.log('Cart items container not found');
            return;
        }
        
        console.log('Updating cart display with', cartItems.length, 'items');
        
        // Clear existing items
        cartItemsContainer.innerHTML = '';
        
        // Check if cart is empty
        if (cartItems.length === 0) {
            console.log('Cart is empty, showing empty message');
            if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
            if (cartTotalItems) cartTotalItems.textContent = '0';
            if (cartTotal) cartTotal.textContent = '€0.00';
            return;
        }
        
        console.log('Cart has items, hiding empty message');
        // Hide empty cart message
        if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
        
        // Calculate totals
        let totalPrice = 0;
        let totalItems = 0;
        
        // Add each item to the display
        cartItems.forEach((item, index) => {
            totalPrice += item.price;
            totalItems += item.quantity;
            
            // Create item card
            const itemCard = document.createElement('div');
            itemCard.className = 'card mb-3';
