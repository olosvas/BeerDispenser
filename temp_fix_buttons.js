document.addEventListener('DOMContentLoaded', function() {
    // Global elements
    const bevTypeSelectionScreen = document.getElementById('beverage-type-selection');
    const sizeSelectionScreen = document.getElementById('beverage-size-selection');
    const cartScreen = document.getElementById('shopping-cart');
    const paymentScreen = document.getElementById('payment-screen');
    const verificationScreen = document.getElementById('age-verification-screen');
    const dispensingScreen = document.getElementById('dispensing-screen');
    const orderCompleteScreen = document.getElementById('order-complete-screen');
    
    // Progress bar steps
    const progressContainer = document.getElementById('progress-container');
    const stepSelection = document.getElementById('step-selection');
    const stepCart = document.getElementById('step-cart');
    const stepVerification = document.getElementById('step-verification');
    const stepPayment = document.getElementById('step-payment');
    const stepDispensing = document.getElementById('step-dispensing');
    const stepPickup = document.getElementById('step-pickup');
    
    // Beverage selection elements
    const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
    
    // Size selection elements
    const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
    
    // Quantity selection elements
    const quantityInput = document.querySelector('.quantity-input');
    const increaseBtn = document.querySelector('.inc-quantity');
    const decreaseBtn = document.querySelector('.dec-quantity');
    const quickQuantityBtns = document.querySelectorAll('.quick-quantity-btn');
    
    // Cart elements
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartCount = document.getElementById('cart-count');
    const cartIconContainer = document.getElementById('cart-icon-container');
    
    // Buttons
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    
    // Beverage type and size display elements
    const beverageTypeDisplay = document.querySelector('#beverage-type-display span');
    
    // State variables
    let selectedBeverage = null;
    let selectedSize = null;
    let currentQuantity = 1;
    let cartItems = [];
    let webcamActive = false;
    let capturedImage = null;
    let dispensingComplete = false;
    let dispensingMonitorInterval = null;
    
    // Initialize UI when the page loads
    initializeUI();
    
    function initializeUI() {
        console.log("Initializing UI...");
        attachEventListeners();
        
        // Try to restore state from server
        restoreState();
        
        // Show the appropriate screen
        const currentScreen = getCurrentScreen();
        if (currentScreen) {
            showScreen(currentScreen);
        } else {
            showScreen('beverage-type-selection');
        }
    }
    
    function attachEventListeners() {
        console.log("Attaching event listeners...");
        
        // Beverage selection
        beverageTypeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const beverageType = option.getAttribute('data-type');
                selectBeverage(beverageType);
            });
        });
        
        // Size selection
        beverageSizeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const size = parseInt(option.getAttribute('data-size'), 10);
                selectSize(size);
            });
        });
        
        // Quantity controls
        if (increaseBtn) increaseBtn.addEventListener('click', increaseQuantity);
        if (decreaseBtn) decreaseBtn.addEventListener('click', decreaseQuantity);
        
        // Quick quantity buttons
        quickQuantityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const quantity = parseInt(btn.getAttribute('data-quantity'), 10);
                quantityInput.value = quantity;
                currentQuantity = quantity;
            });
        });
        
        // Navigation buttons
        if (continueTypeBtn) continueTypeBtn.addEventListener('click', () => {
            showScreen('beverage-size-selection');
        });
        
        if (backToTypeBtn) backToTypeBtn.addEventListener('click', () => {
            showScreen('beverage-type-selection');
        });
        
        if (addToCartBtn) addToCartBtn.addEventListener('click', addToCart);
        
        if (viewCartBtn) viewCartBtn.addEventListener('click', () => {
            showScreen('shopping-cart');
        });
        
        if (viewCartFromSizeBtn) viewCartFromSizeBtn.addEventListener('click', () => {
            showScreen('shopping-cart');
        });
        
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
            showScreen('age-verification-screen');
        });
        
        if (backToCartBtn && backToCartBtn.addEventListener) {
            backToCartBtn.addEventListener('click', () => {
                showScreen('shopping-cart');
            });
        }
    }
    
    function selectBeverage(type) {
        selectedBeverage = type;
        
        // Update UI to show selection
        beverageTypeOptions.forEach(option => {
            if (option.getAttribute('data-type') === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Update display text
        if (beverageTypeDisplay) {
            const displayName = type.charAt(0).toUpperCase() + type.slice(1);
            beverageTypeDisplay.textContent = displayName;
        }
        
        // Enable continue button
        if (continueTypeBtn) continueTypeBtn.disabled = false;
        
        // Save state
        saveState();
    }
    
    function selectSize(size) {
        selectedSize = size;
        
        // Update UI to show selection
        beverageSizeOptions.forEach(option => {
            if (parseInt(option.getAttribute('data-size'), 10) === size) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Enable add to cart button
        if (addToCartBtn) addToCartBtn.disabled = false;
        
        // Save state
        saveState();
    }
    
    function increaseQuantity() {
        const input = document.querySelector('.quantity-input');
        if (input) {
            const currentValue = parseInt(input.value, 10) || 1;
            if (currentValue < 10) { // Set a reasonable maximum
                input.value = currentValue + 1;
                currentQuantity = currentValue + 1;
            }
        }
    }
    
    function decreaseQuantity() {
        const input = document.querySelector('.quantity-input');
        if (input) {
            const currentValue = parseInt(input.value, 10) || 1;
            if (currentValue > 1) {
                input.value = currentValue - 1;
                currentQuantity = currentValue - 1;
            }
        }
    }
    
    function addToCart() {
        if (!selectedBeverage || !selectedSize || currentQuantity < 1) {
            return;
        }
        
        const newItem = {
            beverage: selectedBeverage,
            size: selectedSize,
            quantity: currentQuantity,
            price: calculatePrice(selectedBeverage, selectedSize) * currentQuantity
        };
        
        cartItems.push(newItem);
        
        // Update cart count and show cart icon
        updateCartDisplay();
        
        // Save state
        saveState();
        
        // Show view cart button
        if (viewCartFromSizeBtn) {
            viewCartFromSizeBtn.classList.remove('d-none');
        }
        
        // Reset selection but stay on same screen
        beverageSizeOptions.forEach(option => option.classList.remove('selected'));
        selectedSize = null;
        if (addToCartBtn) addToCartBtn.disabled = true;
        
        // Show a success message
        const language = document.documentElement.lang || 'en';
        const message = language === 'sk' ? 
            'Položka pridaná do košíka!' : 
            'Item added to cart!';
        
        displayMessage(message, 'success');
    }
    
    function calculatePrice(beverage, size) {
        const basePrice = {
            beer: 2.5,
            kofola: 1.8,
            birel: 2.2
        };
        
        const sizeMultiplier = size === 300 ? 1 : 1.5;
        return basePrice[beverage] * sizeMultiplier;
    }
    
    function updateCartDisplay() {
        // Update cart counter
        if (cartCount) {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartIconContainer.classList.remove('d-none');
            } else {
                cartIconContainer.classList.add('d-none');
            }
        }
        
        // Update cart items display
        if (cartItemsContainer) {
            if (cartItems.length === 0) {
                if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
                if (checkoutBtn) checkoutBtn.disabled = true;
            } else {
                if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
                if (checkoutBtn) checkoutBtn.disabled = false;
                
                // Clear current items
                const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
                existingItems.forEach(item => {
                    if (item.id !== 'empty-cart-message') {
                        item.remove();
                    }
                });
                
                // Add items
                let totalPrice = 0;
                
                cartItems.forEach((item, index) => {
                    const itemPrice = item.price;
                    totalPrice += itemPrice;
                    
                    const itemElement = document.createElement('div');
                    itemElement.className = 'cart-item d-flex justify-content-between align-items-center py-2';
                    
                    const beverageName = {
                        'beer': 'Šariš 10',
                        'kofola': 'Kofola',
                        'birel': 'Birel Pomelo&Grep'
                    }[item.beverage] || item.beverage;
                    
                    const language = document.documentElement.lang || 'en';
                    const quantityText = language === 'sk' ? 'ks' : 'pcs';
                    
                    itemElement.innerHTML = `
                        <div>
                            <h5 class="mb-0">${beverageName}</h5>
                            <p class="text-muted mb-0">${item.size}ml × ${item.quantity} ${quantityText}</p>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="h5 mb-0 me-3">€${itemPrice.toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    
                    cartItemsContainer.appendChild(itemElement);
                    
                    // Add event listener to remove button
                    const removeBtn = itemElement.querySelector('.remove-item');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', () => removeFromCart(index));
                    }
                });
                
                // Update total
                if (cartTotal) {
                    cartTotal.textContent = `€${totalPrice.toFixed(2)}`;
                }
            }
        }
    }
    
    function removeFromCart(index) {
        if (index >= 0 && index < cartItems.length) {
            cartItems.splice(index, 1);
            updateCartDisplay();
            saveState();
        }
    }
    
    function restoreState() {
        fetch('/api/get_state')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.state) {
                    const state = data.state;
                    
                    if (state.selectedBeverage) {
                        selectedBeverage = state.selectedBeverage;
                        beverageTypeOptions.forEach(option => {
                            if (option.getAttribute('data-type') === selectedBeverage) {
                                option.classList.add('selected');
                            }
                        });
                        
                        if (beverageTypeDisplay) {
                            const displayName = selectedBeverage.charAt(0).toUpperCase() + selectedBeverage.slice(1);
                            beverageTypeDisplay.textContent = displayName;
                        }
                        
                        if (continueTypeBtn) continueTypeBtn.disabled = false;
                    }
                    
                    if (state.selectedSize) {
                        selectedSize = state.selectedSize;
                        beverageSizeOptions.forEach(option => {
                            if (parseInt(option.getAttribute('data-size'), 10) === selectedSize) {
                                option.classList.add('selected');
                            }
                        });
                        
                        if (addToCartBtn) addToCartBtn.disabled = false;
                    }
                    
                    if (state.currentQuantity) {
                        currentQuantity = state.currentQuantity;
                        if (quantityInput) quantityInput.value = currentQuantity;
                    }
                    
                    if (state.cartItems && Array.isArray(state.cartItems)) {
                        cartItems = state.cartItems;
                        updateCartDisplay();
                    }
                    
                    if (state.currentScreen) {
                        showScreen(state.currentScreen);
                    } else {
                        showScreen('beverage-type-selection');
                    }
                } else {
                    showScreen('beverage-type-selection');
                }
            })
            .catch(error => {
                console.error('Error restoring state:', error);
                showScreen('beverage-type-selection');
            });
    }
    
    function saveState() {
        const state = {
            selectedBeverage,
            selectedSize,
            currentQuantity,
            cartItems,
            currentScreen: getCurrentScreen()
        };
        
        fetch('/api/save_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(state)
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Failed to save state:', data.message);
            }
        })
        .catch(error => {
            console.error('Error saving state:', error);
        });
    }
    
    function getCurrentScreen() {
        if (!bevTypeSelectionScreen.classList.contains('d-none')) return 'beverage-type-selection';
        if (!sizeSelectionScreen.classList.contains('d-none')) return 'beverage-size-selection';
        if (!cartScreen.classList.contains('d-none')) return 'shopping-cart';
        if (verificationScreen && !verificationScreen.classList.contains('d-none')) return 'age-verification-screen';
        if (paymentScreen && !paymentScreen.classList.contains('d-none')) return 'payment-screen';
        if (dispensingScreen && !dispensingScreen.classList.contains('d-none')) return 'dispensing-screen';
        if (orderCompleteScreen && !orderCompleteScreen.classList.contains('d-none')) return 'order-complete-screen';
        
        return 'beverage-type-selection'; // Default
    }
    
    function showScreen(screenName) {
        // Update progress steps
        const screens = {
            'beverage-type-selection': {step: stepSelection, previous: []},
            'beverage-size-selection': {step: stepSelection, previous: [stepSelection]},
            'shopping-cart': {step: stepCart, previous: [stepSelection]},
            'age-verification-screen': {step: stepVerification, previous: [stepSelection, stepCart]},
            'payment-screen': {step: stepPayment, previous: [stepSelection, stepCart, stepVerification]},
            'dispensing-screen': {step: stepDispensing, previous: [stepSelection, stepCart, stepVerification, stepPayment]},
            'order-complete-screen': {step: stepPickup, previous: [stepSelection, stepCart, stepVerification, stepPayment, stepDispensing]}
        };
        
        // First hide all screens
        const allScreens = [
            bevTypeSelectionScreen, 
            sizeSelectionScreen, 
            cartScreen
        ];
        
        if (verificationScreen) allScreens.push(verificationScreen);
        if (paymentScreen) allScreens.push(paymentScreen);
        if (dispensingScreen) allScreens.push(dispensingScreen);
        if (orderCompleteScreen) allScreens.push(orderCompleteScreen);
        
        allScreens.forEach(screen => {
            if (screen) screen.classList.add('d-none');
        });
        
        // Show the requested screen
        switch (screenName) {
            case 'beverage-type-selection':
                bevTypeSelectionScreen.classList.remove('d-none');
                console.log("Showing beverage type selection screen");
                break;
            case 'beverage-size-selection':
                sizeSelectionScreen.classList.remove('d-none');
                break;
            case 'shopping-cart':
                updateCartDisplay();
                cartScreen.classList.remove('d-none');
                break;
            case 'age-verification-screen':
                if (verificationScreen) verificationScreen.classList.remove('d-none');
                break;
            case 'payment-screen':
                if (paymentScreen) paymentScreen.classList.remove('d-none');
                break;
            case 'dispensing-screen':
                if (dispensingScreen) {
                    dispensingScreen.classList.remove('d-none');
                    startDispensing();
                }
                break;
            case 'order-complete-screen':
                if (orderCompleteScreen) orderCompleteScreen.classList.remove('d-none');
                break;
            default:
                bevTypeSelectionScreen.classList.remove('d-none');
                break;
        }
        
        // Update progress indicators
        if (progressContainer && screens[screenName]) {
            progressContainer.classList.remove('d-none');
            
            // Mark the current step as active
            const allSteps = [stepSelection, stepCart, stepVerification, stepPayment, stepDispensing, stepPickup];
            allSteps.forEach(step => {
                if (step) {
                    step.classList.remove('active', 'completed');
                }
            });
            
            // Mark previous steps as completed
            if (screens[screenName].previous) {
                screens[screenName].previous.forEach(step => {
                    if (step) step.classList.add('completed');
                });
            }
            
            // Mark current step as active
            if (screens[screenName].step) {
                screens[screenName].step.classList.add('active');
            }
        }
        
        // Save the current screen state
        saveState();
    }

    function displayMessage(message, type = 'info') {
        // Create a message element
        const messageElement = document.createElement('div');
        messageElement.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        messageElement.style.zIndex = '1050';
        messageElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(messageElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => {
                messageElement.remove();
            }, 150);
        }, 5000);
    }

    // Placeholder for the startDispensing function
    function startDispensing() {
        console.log("Starting dispensing process...");
        // This function would be implemented to start the dispensing process
    }
});
