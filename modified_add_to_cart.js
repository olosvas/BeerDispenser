    function addToCart() {
        console.log('addToCart called', 'selectedBeverage:', selectedBeverage, 'selectedSize:', selectedSize);
        if (!selectedBeverage || !selectedSize) {
            console.log('Missing beverage or size selection, returning');
            return;
        }
        
        // Calculate the price
        const price = calculatePrice(selectedBeverage, selectedSize) * currentQuantity;
        console.log('Calculated price:', price, 'Quantity:', currentQuantity);
        
        // Add to cart
        cartItems.push({
            beverage: selectedBeverage,
            size: selectedSize,
            quantity: currentQuantity,
            price: price
        });
        console.log('Item added to cart. New cart size:', cartItems.length);
        console.log('Cart items:', JSON.stringify(cartItems));
        
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
        } else {
            console.log('addToCartBtn not found');
        }
    }
