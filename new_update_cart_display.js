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
            
            const language = document.documentElement.lang || 'en';
            let beverageName = '';
            
            switch(item.beverage) {
                case 'beer':
                    beverageName = language === 'sk' ? 'Pivo' : 'Beer';
                    break;
                case 'kofola':
                    beverageName = 'Kofola';
                    break;
                case 'birel':
                    beverageName = 'Birel';
                    break;
                default:
                    beverageName = item.beverage;
            }
            
            const sizeLabel = item.size === 'small' ? 
                (language === 'sk' ? 'Malé (300ml)' : 'Small (300ml)') : 
                (language === 'sk' ? 'Veľké (500ml)' : 'Large (500ml)');
            
            itemCard.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title">${beverageName}</h5>
                            <p class="card-text text-muted">${sizeLabel} × ${item.quantity}</p>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="fw-bold me-3">€${item.price.toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemCard);
            
            // Add event listener to remove button
            const removeBtn = itemCard.querySelector('.remove-item-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    removeFromCart(index);
                });
            }
        });
        
        // Update totals
        if (cartTotalItems) cartTotalItems.textContent = totalItems;
        if (cartTotal) cartTotal.textContent = `€${totalPrice.toFixed(2)}`;
        
        console.log('Cart display updated. Total items:', totalItems, 'Total price:', totalPrice);
