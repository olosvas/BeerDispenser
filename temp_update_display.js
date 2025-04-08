    function updateCartDisplay() {
        console.log('updateCartDisplay called');
        if (!cartItemsContainer) {
            console.error('Cart items container not found');
            return;
        }
        
        console.log('Updating cart display with', cartItems.length, 'items');
        
        // Clear existing items
        cartItemsContainer.innerHTML = '';
        
        // Check if cart is empty
        if (cartItems.length === 0) {
            console.log('Cart is empty, showing empty message');
            if (emptyCartMessage) {
                emptyCartMessage.classList.remove('d-none');
                console.log('Empty cart message shown');
            } else {
                console.error('Empty cart message element not found');
            }
            
            if (cartTotalItems) cartTotalItems.textContent = '0';
            if (cartTotal) cartTotal.textContent = '€0.00';
            
            // Debug checkout button state
            if (checkoutBtn) {
                console.log('Checkout button disabled because cart is empty');
                checkoutBtn.disabled = true;
            }
            return;
        }
        
        console.log('Cart has items, hiding empty message');
        // Hide empty cart message
        if (emptyCartMessage) {
            emptyCartMessage.classList.add('d-none');
            console.log('Empty cart message hidden');
        } else {
            console.error('Empty cart message element not found');
        }
        
        // Calculate totals
        let totalPrice = 0;
        let totalItems = 0;
        
        // Add each item to the display
        cartItems.forEach((item, index) => {
            totalPrice += item.price;
            totalItems += item.quantity;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'card mb-3';
            itemEl.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-0">${item.beverage.charAt(0).toUpperCase() + item.beverage.slice(1)}</h5>
                            <small class="text-muted">${item.size} ml ${item.quantity > 1 ? ' x ' + item.quantity : ''}</small>
                        </div>
                        <div>
                            <span class="badge bg-primary me-2">${item.quantity}</span>
                            <span class="fw-bold me-3">€${item.price.toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
            
            // Add event listener to remove button
            const removeBtn = itemEl.querySelector('.remove-item');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    removeFromCart(index);
                });
            }
        });
        
        // Update cart summary
        if (cartTotalItems) cartTotalItems.textContent = totalItems;
        if (cartTotal) cartTotal.textContent = `€${totalPrice.toFixed(2)}`;
        
        // Debug checkout button state
        if (checkoutBtn) {
            console.log('Checkout button enabled because cart has items');
            checkoutBtn.disabled = false;
        }
    }
