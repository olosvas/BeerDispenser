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
    
    // Global variables (referenced throughout the app)
    let selectedBeverage = '';
    let selectedSize = '';
    let cartItems = [];
    
    // Cart functionality
    function addToCart(beverage, size) {
        cartItems.push({
            beverage: beverage,
            size: size,
            quantity: 1 // Default quantity
        });
        
        // Update cart badge count
        updateCartCount();
        
        // Show the cart icon/badge
        const cartIconContainer = document.getElementById('cart-icon-container');
        if (cartIconContainer) {
            cartIconContainer.classList.remove('d-none');
        }
        
        // Show the view cart button
        const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
        if (viewCartFromSizeBtn) {
            viewCartFromSizeBtn.classList.remove('d-none');
        }
        
        // Update the cart items display
        updateCartDisplay();
    }
    
    function updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = cartItems.length;
        }
    }
    
    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartTotalItems = document.getElementById('cart-total-items');
        const cartTotalPrice = document.getElementById('cart-total-price');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (!cartItemsContainer) return;
        
        // Clear existing items
        while (cartItemsContainer.firstChild && cartItemsContainer.firstChild !== emptyCartMessage) {
            cartItemsContainer.removeChild(cartItemsContainer.firstChild);
        }
        
        // Show/hide empty cart message
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
                        const index = parseInt(this.dataset.index);
                        cartItems.splice(index, 1);
                        updateCartCount();
                        updateCartDisplay();
                        
                        // Hide cart icon if cart is empty
                        if (cartItems.length === 0) {
                            const cartIconContainer = document.getElementById('cart-icon-container');
                            if (cartIconContainer) {
                                cartIconContainer.classList.add('d-none');
                            }
                        }
                    });
                }
            });
            
            // Update totals
            if (cartTotalItems) cartTotalItems.textContent = cartItems.length;
            if (cartTotalPrice) cartTotalPrice.textContent = '€' + totalPrice.toFixed(2);
        }
    }
    
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
            birel: 'Birel Pomelo&Grep'
        };
        
        return names[type] || type;
    }
    
    // DOM elements
    const beverageTypeSelection = document.getElementById('beverage-type-selection');
    const beverageSizeSelection = document.getElementById('beverage-size-selection');
    const shoppingCart = document.getElementById('shopping-cart');
    const ageVerificationScreen = document.getElementById('age-verification');
    const dispensingScreen = document.getElementById('dispensing-screen');
    const orderCompleteScreen = document.getElementById('order-complete-screen');
    
    const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
    const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
    
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
    const continueSizeBtn = document.getElementById('continue-size-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    const progressContainer = document.getElementById('progress-container');
    const stepSelection = document.getElementById('step-selection');
    const stepCart = document.getElementById('step-cart');
    const stepVerification = document.getElementById('step-verification');
    const stepDispensing = document.getElementById('step-dispensing');
    
    // Server state functions
    function saveStateToServer() {
        const currentScreen = getCurrentScreen();
        // Send current state to server
        fetch('/save_ui_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                screen: currentScreen,
                selectedBeverage: selectedBeverage,
                selectedSize: selectedSize,
                cartItems: cartItems
            })
        }).catch(error => {
            console.error('Error saving state:', error);
        });
    }
    
    function getCurrentScreen() {
        if (beverageTypeSelection && !beverageTypeSelection.classList.contains('d-none')) {
            return DISPLAY_STATES.BEVERAGE_TYPE;
        } else if (beverageSizeSelection && !beverageSizeSelection.classList.contains('d-none')) {
            return DISPLAY_STATES.BEVERAGE_SIZE;
        } else if (shoppingCart && !shoppingCart.classList.contains('d-none')) {
            return DISPLAY_STATES.SHOPPING_CART;
        } else if (ageVerificationScreen && !ageVerificationScreen.classList.contains('d-none')) {
            return DISPLAY_STATES.AGE_VERIFICATION;
        } else if (dispensingScreen && !dispensingScreen.classList.contains('d-none')) {
            return DISPLAY_STATES.DISPENSING;
        } else if (orderCompleteScreen && !orderCompleteScreen.classList.contains('d-none')) {
            return DISPLAY_STATES.ORDER_COMPLETE;
        }
        return DISPLAY_STATES.BEVERAGE_TYPE; // Default
    }
    
    function restoreUIState(screenName) {
        hideAllScreens();
        
        switch(screenName) {
            case DISPLAY_STATES.BEVERAGE_TYPE:
                if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
                break;
            case DISPLAY_STATES.BEVERAGE_SIZE:
                if (beverageSizeSelection) beverageSizeSelection.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                break;
            case DISPLAY_STATES.SHOPPING_CART:
                if (shoppingCart) shoppingCart.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                break;
            case DISPLAY_STATES.AGE_VERIFICATION:
                if (ageVerificationScreen) ageVerificationScreen.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
                break;
            case DISPLAY_STATES.DISPENSING:
                if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
                if (stepDispensing) stepDispensing.classList.add('active');
                break;
            case DISPLAY_STATES.ORDER_COMPLETE:
                if (orderCompleteScreen) orderCompleteScreen.classList.remove('d-none');
                break;
            default:
                if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
        }
    }
    
    function hideAllScreens() {
        if (beverageTypeSelection) beverageTypeSelection.classList.add('d-none');
        if (beverageSizeSelection) beverageSizeSelection.classList.add('d-none');
        if (shoppingCart) shoppingCart.classList.add('d-none');
        if (ageVerificationScreen) ageVerificationScreen.classList.add('d-none');
        if (dispensingScreen) dispensingScreen.classList.add('d-none');
        if (orderCompleteScreen) orderCompleteScreen.classList.add('d-none');
    }
    
    // Event Listeners for Beverage Selection
    if (beverageTypeOptions) {
        beverageTypeOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Deselect all options
                beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Select current option
                this.classList.add('selected');
                
                // Enable continue button
                if (continueTypeBtn) {
                    continueTypeBtn.disabled = false;
                }
                
                // Store selection
                selectedBeverage = this.dataset.type;
                
                // Update display text if available
                const displayElem = document.getElementById('beverage-type-display');
                if (displayElem && displayElem.querySelector('span')) {
                    displayElem.querySelector('span').textContent = getBeverageName(selectedBeverage);
                }
            });
        });
    }
    
    // Event Listeners for Size Selection
    if (beverageSizeOptions) {
        beverageSizeOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Deselect all options
                beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Select current option
                this.classList.add('selected');
                
                // Enable continue and add to cart buttons
                if (continueSizeBtn) {
                    continueSizeBtn.disabled = false;
                }
                
                if (addToCartBtn) {
                    addToCartBtn.disabled = false;
                }
                
                // Store selection
                selectedSize = this.dataset.size;
            });
        });
    }
    
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
            // Add item to cart
            addToCart(selectedBeverage, selectedSize);
            
            // Reset the size selection
            beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
            addToCartBtn.disabled = true;
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success alert-dismissible fade show mt-3';
            successMessage.innerHTML = `
                <strong>Added to cart!</strong> ${getBeverageName(selectedBeverage)} (${selectedSize}ml)
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
            
            // Clear selection
            selectedSize = '';
        });
    }
    
    // View Cart Buttons
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', function() {
            showCartScreen();
        });
    }
    
    if (viewCartFromSizeBtn) {
        viewCartFromSizeBtn.addEventListener('click', function() {
            showCartScreen();
        });
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
    
    // Checkout Button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            // Check if any items in cart need age verification
            const needsVerification = cartItems.some(item => item.beverage === 'beer');
            
            if (needsVerification) {
                // Show age verification screen
                hideAllScreens();
                if (ageVerificationScreen) ageVerificationScreen.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
                
                // Initialize webcam if needed
                if (typeof startWebcam === 'function') {
                    startWebcam();
                }
            } else {
                // Go directly to dispensing
                hideAllScreens();
                if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
                if (stepDispensing) stepDispensing.classList.add('active');
                
                // Start dispensing process
                startDispensing();
            }
        });
    }
    
    // Continue Size Button (old implementation - direct dispensing)
    if (continueSizeBtn) {
        continueSizeBtn.addEventListener('click', function() {
            fetch('/api/dispense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    beverage_type: selectedBeverage,
                    size_ml: selectedSize
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.requires_age_verification) {
                    // Show age verification screen
                    hideAllScreens();
                    if (ageVerificationScreen) ageVerificationScreen.classList.remove('d-none');
                    if (progressContainer) progressContainer.classList.remove('d-none');
                    if (stepSelection) stepSelection.classList.add('active');
                    if (stepVerification) stepVerification.classList.add('active');
                    
                    // Initialize webcam if needed
                    if (typeof startWebcam === 'function') {
                        startWebcam();
                    }
                } else {
                    // Show dispensing screen directly
                    hideAllScreens();
                    if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                    if (progressContainer) progressContainer.classList.remove('d-none');
                    if (stepSelection) stepSelection.classList.add('active');
                    if (stepVerification) stepVerification.classList.add('active');
                    if (stepDispensing) stepDispensing.classList.add('active');
                    
                    // Add to cart
                    addToCart(selectedBeverage, selectedSize);
                    
                    // Start dispensing process
                    startDispensing();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Display error message
                alert('An error occurred. Please try again.');
            });
        });
    }
    
    // Initialize UI state from server if available
    const initialScreen = document.body.dataset.initialScreen || null;
    const selectedBeverageFromServer = document.body.dataset.selectedBeverage || null;
    const selectedSizeFromServer = document.body.dataset.selectedSize || null;
    
    if (selectedBeverageFromServer) {
        selectedBeverage = selectedBeverageFromServer;
        // Find and select the beverage option
        beverageTypeOptions.forEach(option => {
            if (option.dataset.type === selectedBeverage) {
                option.classList.add('selected');
                if (continueTypeBtn) {
                    continueTypeBtn.disabled = false;
                }
            }
        });
    }
    
    if (selectedSizeFromServer) {
        selectedSize = selectedSizeFromServer;
        // Find and select the size option
        beverageSizeOptions.forEach(option => {
            if (option.dataset.size === selectedSize) {
                option.classList.add('selected');
                if (continueSizeBtn) {
                    continueSizeBtn.disabled = false;
                }
                if (addToCartBtn) {
                    addToCartBtn.disabled = false;
                }
            }
        });
    }
    
    if (initialScreen) {
        restoreUIState(initialScreen);
    }
    
    // Add event listener for language switch to save state
    const languageSwitchBtn = document.getElementById("language-switch-btn");
    if (languageSwitchBtn) {
        languageSwitchBtn.addEventListener("click", function() {
            saveStateToServer();
        });
    }
    
    // Initialize quantity selectors
    const quantityInput = document.querySelector('.quantity-input');
    const decQuantityBtn = document.querySelector('.dec-quantity');
    const incQuantityBtn = document.querySelector('.inc-quantity');
    const quickQuantityBtns = document.querySelectorAll('.quick-quantity-btn');
    
    if (quantityInput && decQuantityBtn && incQuantityBtn) {
        decQuantityBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        incQuantityBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < 10) {
                quantityInput.value = currentValue + 1;
            }
        });
    }
    
    if (quickQuantityBtns) {
        quickQuantityBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (quantityInput) {
                    quantityInput.value = this.dataset.quantity;
                }
            });
        });
    }
});

// Webcam functionality
let webcamElement = null;
let webcamStream = null;

function startWebcam() {
    webcamElement = document.getElementById('webcam');
    
    if (!webcamElement) {
        showWebcamError('Webcam element not found');
        return;
    }
    
    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            webcamStream = stream;
            webcamElement.srcObject = stream;
        })
        .catch(function(error) {
            showWebcamError('Error accessing webcam: ' + error.message);
        });
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => {
            track.stop();
        });
        webcamStream = null;
        
        if (webcamElement) {
            webcamElement.srcObject = null;
        }
    }
}

function captureWebcamImage() {
    if (!webcamElement || !webcamStream) {
        showWebcamError('Webcam not initialized');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = webcamElement.videoWidth;
    canvas.height = webcamElement.videoHeight;
    canvas.getContext('2d').drawImage(webcamElement, 0, 0);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Send to server for age verification
    fetch('/api/verify_age', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: imageData,
            beverage_type: selectedBeverage
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.is_adult) {
            // Age verification successful, show dispensing screen
            const ageVerification = document.getElementById('age-verification');
            const dispensingScreen = document.getElementById('dispensing-screen');
            const stepDispensing = document.getElementById('step-dispensing');
            
            if (ageVerification) ageVerification.classList.add('d-none');
            if (dispensingScreen) dispensingScreen.classList.remove('d-none');
            if (stepDispensing) stepDispensing.classList.add('active');
            
            // Start dispensing process
            startDispensing();
        } else {
            // Age verification failed
            showWebcamError('Age verification failed: ' + data.message);
        }
    })
    .catch(error => {
        showWebcamError('Error verifying age: ' + error.message);
    })
    .finally(() => {
        // Clean up webcam
        stopWebcam();
    });
}

function resetWebcam() {
    stopWebcam();
    startWebcam();
}

function showWebcamError(message) {
    const errorElement = document.getElementById('webcam-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }
}

// Dispensing functionality
function startDispensing() {
    // Show the dispensing interface
    const statusElement = document.getElementById('dispensing-status');
    if (statusElement) {
        statusElement.textContent = 'Initializing...';
    }
    
    // Start polling for status
    monitorOrderProgress();
}

// Poll for dispensing status
function monitorOrderProgress() {
    const statusElement = document.getElementById('dispensing-status');
    const progressBar = document.getElementById('dispensing-progress');
    
    // Poll for status every 1 second
    const intervalId = setInterval(() => {
        fetch('/api/dispensing_status')
            .then(response => response.json())
            .then(data => {
                updateDispenseUI(data);
                
                if (data.status === 'complete') {
                    clearInterval(intervalId);
                    showOrderComplete();
                } else if (data.status === 'error') {
                    clearInterval(intervalId);
                    if (statusElement) {
                        statusElement.textContent = 'Error: ' + data.message;
                        statusElement.classList.add('text-danger');
                    }
                }
            })
            .catch(error => {
                console.error('Error polling status:', error);
            });
    }, 1000);
}

function updateDispenseUI(state) {
    const statusElement = document.getElementById('dispensing-status');
    const progressBar = document.getElementById('dispensing-progress');
    
    if (!statusElement || !progressBar) return;
    
    // Update status message
    statusElement.textContent = state.message || 'Processing...';
    
    // Update progress bar
    if (state.progress !== undefined) {
        progressBar.style.width = state.progress + '%';
        progressBar.setAttribute('aria-valuenow', state.progress);
    }
}

function showOrderComplete() {
    // Hide dispensing screen, show order complete
    const dispensingScreen = document.getElementById('dispensing-screen');
    const orderCompleteScreen = document.getElementById('order-complete-screen');
    
    if (dispensingScreen) dispensingScreen.classList.add('d-none');
    if (orderCompleteScreen) orderCompleteScreen.classList.remove('d-none');
    
    // Clear cart and selections
    cartItems = [];
    selectedBeverage = '';
    selectedSize = '';
    
    // Set a timeout to return to the start screen
    setTimeout(() => {
        if (orderCompleteScreen) orderCompleteScreen.classList.add('d-none');
        
        const beverageTypeSelection = document.getElementById('beverage-type-selection');
        if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
        
        // Reset progress steps
        const progressContainer = document.getElementById('progress-container');
        const stepSelection = document.getElementById('step-selection');
        const stepCart = document.getElementById('step-cart');
        const stepVerification = document.getElementById('step-verification');
        const stepDispensing = document.getElementById('step-dispensing');
        
        if (progressContainer) progressContainer.classList.add('d-none');
        if (stepSelection) stepSelection.classList.remove('active');
        if (stepCart) stepCart.classList.remove('active');
        if (stepVerification) stepVerification.classList.remove('active');
        if (stepDispensing) stepDispensing.classList.remove('active');
        
        // Disable continue buttons
        const continueTypeBtn = document.getElementById('continue-type-btn');
        const continueSizeBtn = document.getElementById('continue-size-btn');
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        
        if (continueTypeBtn) continueTypeBtn.disabled = true;
        if (continueSizeBtn) continueSizeBtn.disabled = true;
        if (addToCartBtn) addToCartBtn.disabled = true;
        
        // Reset selections
        const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
        const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
        
        beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
        beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Hide cart icon
        const cartIconContainer = document.getElementById('cart-icon-container');
        if (cartIconContainer) cartIconContainer.classList.add('d-none');
        
        const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
        if (viewCartFromSizeBtn) viewCartFromSizeBtn.classList.add('d-none');
    }, 5000); // 5 seconds
}

// Global error handler
function displayErrorMessage(message, error) {
    console.error(message, error);
    alert(message + (error ? ': ' + error.message : ''));
}
