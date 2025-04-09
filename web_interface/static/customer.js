document.addEventListener('DOMContentLoaded', function() {
    // Configuration and initialization
    const DISPLAY_STATES = {
        BEVERAGE_TYPE: 'beverage-type',
        BEVERAGE_SIZE: 'beverage-size',
        SHOPPING_CART: 'shopping-cart',
        AGE_VERIFICATION: 'age-verification',
        DISPENSING: 'dispensing',
        ORDER_COMPLETE: 'order-complete'
    };
    
    // Global variables
    let selectedBeverage = '';
    let selectedSize = '';
    let cartItems = [];
    
    // DOM elements
    const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
    const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
    const beverageTypeSelection = document.getElementById('beverage-type-selection');
    const beverageSizeSelection = document.getElementById('beverage-size-selection');
    const shoppingCart = document.getElementById('shopping-cart');
    const ageVerification = document.getElementById('age-verification');
    const dispensing = document.getElementById('dispensing');
    const orderComplete = document.getElementById('order-complete');
    const progressContainer = document.getElementById('progress-container');
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartCount = document.getElementById('cart-count');
    const cartIconContainer = document.getElementById('cart-icon-container');
    const stepSelection = document.getElementById('step-selection');
    const stepCart = document.getElementById('step-cart');
    const stepVerification = document.getElementById('step-verification');
    const stepDispensing = document.getElementById('step-dispensing');
    
    // Helper functions
    function getBeveragePrice(type, size) {
        const prices = {
            beer: { '300': 2.50, '500': 3.50 },
            kofola: { '300': 1.80, '500': 2.80 },
            birel: { '300': 2.30, '500': 3.30 }
        };
        
        return prices[type] && prices[type][size] ? prices[type][size] : 0;
    }
    
    function getBeverageName(type) {
        const names = {
            beer: 'Šariš 10',
            kofola: 'Kofola',
            birel: 'Birel 0%'
        };
        
        return names[type] || type;
    }
    
    function hideAllScreens() {
        if (beverageTypeSelection) beverageTypeSelection.classList.add('d-none');
        if (beverageSizeSelection) beverageSizeSelection.classList.add('d-none');
        if (shoppingCart) shoppingCart.classList.add('d-none');
        if (ageVerification) ageVerification.classList.add('d-none');
        if (dispensing) dispensing.classList.add('d-none');
        if (orderComplete) orderComplete.classList.add('d-none');
        if (progressContainer) progressContainer.classList.add('d-none');
    }
    
    function updateCartCount() {
        if (cartCount) {
            cartCount.textContent = cartItems.length;
        }
        
        // Show/hide cart icon
        if (cartIconContainer) {
            if (cartItems.length > 0) {
                cartIconContainer.classList.remove('d-none');
            } else {
                cartIconContainer.classList.add('d-none');
            }
        }
    }
    
    function selectBeverage(type) {
        selectedBeverage = type;
        
        // Update UI - highlight selected option
        beverageTypeOptions.forEach(option => {
            if (option.getAttribute('data-type') === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Enable continue button
        if (continueTypeBtn) {
            continueTypeBtn.disabled = false;
        }
        
        // Set beverage type in size selection screen
        const beverageTypeDisplay = document.getElementById('selected-beverage-type');
        if (beverageTypeDisplay) {
            beverageTypeDisplay.textContent = getBeverageName(type);
        }
    }
    
    function selectSize(size) {
        selectedSize = size;
        
        // Update UI - highlight selected option
        beverageSizeOptions.forEach(option => {
            if (parseInt(option.getAttribute('data-size'), 10) === size) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Enable add to cart button
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
        }
    }
    
    function addToCart(beverage, size) {
        // Add item to cart
        cartItems.push({
            beverage: beverage,
            size: size,
            quantity: 1
        });
        
        // Update cart UI
        updateCartCount();
        
        // Show view cart button
        if (viewCartFromSizeBtn) {
            viewCartFromSizeBtn.classList.remove('d-none');
        }
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success alert-dismissible fade show mt-3';
        successMessage.innerHTML = `
            <strong>Added to cart!</strong> ${getBeverageName(beverage)} (${size}ml)
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const sizePage = document.querySelector('#beverage-size-selection .row:first-child');
        if (sizePage) {
            sizePage.parentNode.insertBefore(successMessage, sizePage.nextSibling);
            
            // Auto dismiss after 3 seconds
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.parentNode.removeChild(successMessage);
                }
            }, 3000);
        }
        
        // Reset selection
        beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
        if (addToCartBtn) addToCartBtn.disabled = true;
        selectedSize = '';
    }
    
    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartTotalItems = document.getElementById('cart-total-items');
        const cartTotalPrice = document.getElementById('cart-total-price');
        
        if (!cartItemsContainer) return;
        
        // Clear existing items
        while (cartItemsContainer.firstChild && cartItemsContainer.firstChild !== emptyCartMessage) {
            cartItemsContainer.removeChild(cartItemsContainer.firstChild);
        }
        
        // Show/hide empty cart message and buttons
        if (cartItems.length === 0) {
            if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
            if (checkoutBtn) checkoutBtn.disabled = false;
            
            // Add items to cart display
            let totalPrice = 0;
            
            cartItems.forEach((item, index) => {
                const itemPrice = getBeveragePrice(item.beverage, item.size);
                totalPrice += itemPrice * item.quantity;
                
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item d-flex justify-content-between align-items-center py-2';
                itemElement.innerHTML = `
                    <div>
                        <h5 class="mb-0">${getBeverageName(item.beverage)}</h5>
                        <small class="text-muted">${item.size}ml</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="me-3">×${item.quantity}</span>
                        <span class="fw-bold">€${(itemPrice * item.quantity).toFixed(2)}</span>
                        <button class="btn btn-sm btn-outline-danger ms-2 remove-item" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                cartItemsContainer.insertBefore(itemElement, emptyCartMessage);
                
                // Add event listener to remove button
                const removeBtn = itemElement.querySelector('.remove-item');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        const idx = parseInt(this.getAttribute('data-index'), 10);
                        cartItems.splice(idx, 1);
                        updateCartCount();
                        updateCartDisplay();
                    });
                }
            });
            
            // Update totals
            if (cartTotalItems) cartTotalItems.textContent = cartItems.length;
            if (cartTotalPrice) cartTotalPrice.textContent = '€' + totalPrice.toFixed(2);
        }
    }
    
    function showCartScreen() {
        hideAllScreens();
        if (shoppingCart) shoppingCart.classList.remove('d-none');
        if (progressContainer) progressContainer.classList.remove('d-none');
        if (stepSelection) stepSelection.classList.add('active');
        if (stepCart) stepCart.classList.add('active');
        
        // Update cart display
        updateCartDisplay();
    }
    
    // Event listeners for beverage options
    beverageTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            selectBeverage(type);
        });
    });
    
    // Event listeners for size options
    beverageSizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const size = parseInt(this.getAttribute('data-size'), 10);
            selectSize(size);
        });
    });
    
    // Continue Type Button
    if (continueTypeBtn) {
        continueTypeBtn.addEventListener('click', function() {
            if (beverageTypeSelection) beverageTypeSelection.classList.add('d-none');
            if (beverageSizeSelection) beverageSizeSelection.classList.remove('d-none');
            if (progressContainer) progressContainer.classList.remove('d-none');
            if (stepSelection) stepSelection.classList.add('active');
        });
    }
    
    // Back to Type Selection
    if (backToTypeBtn) {
        backToTypeBtn.addEventListener('click', function() {
            if (beverageSizeSelection) beverageSizeSelection.classList.add('d-none');
            if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
            if (progressContainer) progressContainer.classList.add('d-none');
            if (stepSelection) stepSelection.classList.remove('active');
        });
    }
    
    // Add to Cart Button
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            addToCart(selectedBeverage, selectedSize);
        });
    }
    
    // View Cart Button
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', function() {
            showCartScreen();
        });
    }
    
    // View Cart From Size Button
    if (viewCartFromSizeBtn) {
        viewCartFromSizeBtn.addEventListener('click', function() {
            showCartScreen();
        });
    }
    
    // Continue Shopping Button
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            hideAllScreens();
            if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
            if (progressContainer) progressContainer.classList.remove('d-none');
            if (stepSelection) stepSelection.classList.add('active');
            if (stepCart) stepCart.classList.remove('active');
        });
    }
    
    // Initialize UI - hide cart icon initially
    if (cartIconContainer) cartIconContainer.classList.add('d-none');
    if (addToCartBtn) addToCartBtn.disabled = true;
    if (continueTypeBtn) continueTypeBtn.disabled = true;
});
