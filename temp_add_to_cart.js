    function addToCart() {
        console.log('addToCart function called');
        console.log('selectedBeverage:', selectedBeverage);
        console.log('selectedSize:', selectedSize);
        
        if (!selectedBeverage || !selectedSize) {
            console.error('Missing beverage or size selection');
            return;
        }
        
        // Calculate the price
        const price = calculatePrice(selectedBeverage, selectedSize) * currentQuantity;
        console.log('Price calculated:', price);
        
        // Add to cart
        cartItems.push({
            beverage: selectedBeverage,
            size: selectedSize,
            quantity: currentQuantity,
            price: price
        });
        console.log('Item added to cart. New cart:', JSON.stringify(cartItems));
        
        // Update cart count
        updateCartCount();
        
        // Update cart display
        updateCartDisplay();
        
        // Save cart to local storage or session
        saveState();
        
        // Reset selection
        currentQuantity = 1;
        updateQuantityDisplay();
        
        // Show feedback
        const language = document.documentElement.lang || 'en';
        displayMessage(
            language === 'sk' ? 'Položka pridaná do košíka' : 'Item added to cart', 
            'success'
        );
        
        // Show the button as disabled until user makes a new selection
        if (addToCartBtn) {
            addToCartBtn.disabled = true;
            console.log('addToCartBtn disabled after adding item');
        } else {
            console.error('addToCartBtn not found when trying to disable it');
        }
