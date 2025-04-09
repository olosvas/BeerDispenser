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
                        const idx = parseInt(this.getAttribute('data-index'), 10);
                        cartItems.splice(idx, 1);
                        updateCartCount();
                        updateCartDisplay();
                        
                        // Hide cart icon if no items left
                        if (cartItems.length === 0) {
                            if (cartIconContainer) cartIconContainer.classList.add('d-none');
                            if (viewCartFromSizeBtn) viewCartFromSizeBtn.classList.add('d-none');
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
            birel: 'Birel 0%'
        };
        
        return names[type] || type;
    }
    
    // Get DOM elements
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
                cart_items: cartItems,
                selected_beverage: selectedBeverage,
                selected_size: selectedSize
            })
        }).catch(err => console.error('Error saving state:', err));
    }
    
    function getCurrentScreen() {
        if (beverageTypeSelection && !beverageTypeSelection.classList.contains('d-none')) return DISPLAY_STATES.BEVERAGE_TYPE;
        if (beverageSizeSelection && !beverageSizeSelection.classList.contains('d-none')) return DISPLAY_STATES.BEVERAGE_SIZE;
        if (shoppingCart && !shoppingCart.classList.contains('d-none')) return DISPLAY_STATES.SHOPPING_CART;
        if (ageVerification && !ageVerification.classList.contains('d-none')) return DISPLAY_STATES.AGE_VERIFICATION;
        if (dispensing && !dispensing.classList.contains('d-none')) return DISPLAY_STATES.DISPENSING;
        if (orderComplete && !orderComplete.classList.contains('d-none')) return DISPLAY_STATES.ORDER_COMPLETE;
        return DISPLAY_STATES.BEVERAGE_TYPE; // Default
    }
    
    function restoreUIState(screenName) {
        hideAllScreens();
        
        // Show the appropriate screen
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
                if (ageVerification) ageVerification.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
                break;
            case DISPLAY_STATES.DISPENSING:
                if (dispensing) dispensing.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
                if (stepDispensing) stepDispensing.classList.add('active');
                break;
            case DISPLAY_STATES.ORDER_COMPLETE:
                if (orderComplete) orderComplete.classList.remove('d-none');
                break;
            default:
                if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
                break;
        }
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
    
    // Initialize UI elements
    function initializeUI() {
        // Beverage Type Selection
        beverageTypeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                // Visual feedback
                beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Enable continue button
                if (continueTypeBtn) {
                    continueTypeBtn.disabled = false;
                }
                
                // Store selection
                selectedBeverage = type;
                
                // Set beverage type in size selection screen
                const beverageTypeDisplay = document.getElementById('selected-beverage-type');
                if (beverageTypeDisplay) {
                    const displayName = type.charAt(0).toUpperCase() + type.slice(1);
                    beverageTypeDisplay.textContent = displayName;
                }
            });
        });
        
        // Beverage Size Selection
        beverageSizeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const size = parseInt(this.getAttribute('data-size'), 10);
                // Visual feedback
                beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Enable add to cart button
                if (addToCartBtn) {
                    addToCartBtn.disabled = false;
                }
                
                // Store selection
                selectedSize = size;
            });
        });
    }
    
    // Button Event Listeners
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
            selectedSize = "";
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
    function selectSize(size) {
        selectedSize = size;
        
        // Update UI
        beverageSizeOptions.forEach(option => {
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
            // Check if any alcoholic beverages (needing verification)
            const requiresVerification = cartItems.some(item => 
                item.beverage === 'beer' || item.beverage === 'birel');
            
            if (requiresVerification) {
                // Show age verification screen
                hideAllScreens();
                if (ageVerification) ageVerification.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
                
                // Start webcam
                startWebcam();
            } else {
                // Skip verification, go to dispensing
                startDispensing();
            }
        });
    }
    
    // Webcam functionality
    let webcamStream = null;
    const webcamElement = document.getElementById('webcam');
    const captureButton = document.getElementById('capture-button');
    const retryButton = document.getElementById('retry-button');
    const webcamContainer = document.getElementById('webcam-container');
    const capturedImageContainer = document.getElementById('captured-image-container');
    const capturedImage = document.getElementById('captured-image');
    const verificationResultsContainer = document.getElementById('verification-results');
    const verificationSpinner = document.getElementById('verification-spinner');
    
    function startWebcam() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    webcamStream = stream;
                    if (webcamElement) {
                        webcamElement.srcObject = stream;
                        webcamElement.play();
                        if (webcamContainer) webcamContainer.classList.remove('d-none');
                        if (captureButton) captureButton.disabled = false;
                    }
                })
                .catch(function(error) {
                    showWebcamError(`Unable to access webcam: ${error.message}`);
                });
        } else {
            showWebcamError('Your browser does not support accessing the webcam');
        }
    }
    
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
    }
    
    function captureWebcamImage() {
        if (!webcamElement) return;
        
        // Create a canvas to capture the image
        const canvas = document.createElement('canvas');
        canvas.width = webcamElement.videoWidth;
        canvas.height = webcamElement.videoHeight;
        
        // Draw the current video frame to the canvas
        const context = canvas.getContext('2d');
        context.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
        
        // Get the image data URL
        const imageDataURL = canvas.toDataURL('image/jpeg');
        
        // Display the captured image
        if (capturedImage) {
            capturedImage.src = imageDataURL;
            if (webcamContainer) webcamContainer.classList.add('d-none');
            if (capturedImageContainer) capturedImageContainer.classList.remove('d-none');
            if (verificationSpinner) verificationSpinner.classList.remove('d-none');
        }
        
        // Send image for verification
        sendImageForVerification(imageDataURL);
        
        // Hide buttons while verifying
        if (captureButton) captureButton.classList.add('d-none');
        if (retryButton) retryButton.classList.remove('d-none');
    }
    
    function resetWebcam() {
        if (capturedImageContainer) capturedImageContainer.classList.add('d-none');
        if (webcamContainer) webcamContainer.classList.remove('d-none');
        if (captureButton) captureButton.classList.remove('d-none');
        if (retryButton) retryButton.classList.add('d-none');
        if (verificationSpinner) verificationSpinner.classList.add('d-none');
        if (verificationResultsContainer) verificationResultsContainer.innerHTML = '';
    }
    
    function showWebcamError(message) {
        // Display error message to user
        const errorContainer = document.getElementById('webcam-error-container');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('d-none');
        }
        console.error('Webcam error:', message);
    }
    
    function sendImageForVerification(imageDataURL) {
        // Find out what beverage needs verification
        const beverageType = cartItems.find(item => 
            item.beverage === 'beer' || item.beverage === 'birel')?.beverage || 'beer';
        
        // Send the data to the server
        fetch('/verify_age', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_data: imageDataURL,
                beverage_type: beverageType
            })
        })
        .then(response => response.json())
        .then(data => {
            // Hide spinner
            if (verificationSpinner) verificationSpinner.classList.add('d-none');
            
            // Display results
            if (verificationResultsContainer) {
                if (data.is_adult) {
                    verificationResultsContainer.innerHTML = `
                        <div class="alert alert-success">
                            <h4><i class="fas fa-check-circle"></i> Age Verified</h4>
                            <p>You appear to be ${data.estimated_age} years old.</p>
                            <p>Confidence: ${Math.round(data.confidence * 100)}%</p>
                            <button id="continue-to-dispensing" class="btn btn-primary mt-2">Continue to Dispensing</button>
                        </div>
                    `;
                    
                    // Add event listener to the continue button
                    document.getElementById('continue-to-dispensing').addEventListener('click', function() {
                        startDispensing();
                    });
                } else {
                    verificationResultsContainer.innerHTML = `
                        <div class="alert alert-danger">
                            <h4><i class="fas fa-exclamation-triangle"></i> Age Verification Failed</h4>
                            <p>You appear to be ${data.estimated_age} years old.</p>
                            <p>${data.message}</p>
                            <p>Please try again or choose non-alcoholic beverages.</p>
                            <div class="d-flex justify-content-between mt-2">
                                <button id="try-again-verification" class="btn btn-outline-secondary">Try Again</button>
                                <button id="back-to-cart" class="btn btn-primary">Back to Cart</button>
                            </div>
                        </div>
                    `;
                    
                    // Add event listeners
                    document.getElementById('try-again-verification').addEventListener('click', function() {
                        resetWebcam();
                    });
                    
                    document.getElementById('back-to-cart').addEventListener('click', function() {
                        stopWebcam();
                        showCartScreen();
                    });
                }
            }
        })
        .catch(error => {
            // Hide spinner
            if (verificationSpinner) verificationSpinner.classList.add('d-none');
            
            // Show error
            if (verificationResultsContainer) {
                verificationResultsContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <h4><i class="fas fa-exclamation-circle"></i> Verification Error</h4>
                        <p>There was an error processing your verification: ${error.message}</p>
                        <button id="try-again-error" class="btn btn-primary mt-2">Try Again</button>
                    </div>
                `;
                
                // Add event listener
                document.getElementById('try-again-error').addEventListener('click', function() {
                    resetWebcam();
                });
            }
        });
    }
    
    function startDispensing() {
        // Show dispensing screen
        hideAllScreens();
        if (dispensing) dispensing.classList.remove('d-none');
        if (progressContainer) progressContainer.classList.remove('d-none');
        if (stepSelection) stepSelection.classList.add('active');
        if (stepCart) stepCart.classList.add('active');
        if (stepVerification) stepVerification.classList.add('active');
        if (stepDispensing) stepDispensing.classList.add('active');
        
        // Stop webcam if it was active
        stopWebcam();
        
        // Send order to server
        fetch('/start_dispensing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cart_items: cartItems.map(item => ({
                    beverage: item.beverage,
                    size: item.size,
                    quantity: item.quantity
                }))
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Start monitoring the dispensing progress
                monitorOrderProgress();
            } else {
                // Show error
                const dispensingMessage = document.getElementById('dispensing-message');
                if (dispensingMessage) {
                    dispensingMessage.innerHTML = `
                        <div class="alert alert-danger">
                            <h4><i class="fas fa-exclamation-circle"></i> Order Failed</h4>
                            <p>${data.message || 'There was an error processing your order.'}</p>
                            <button id="back-to-start" class="btn btn-primary mt-2">Back to Start</button>
                        </div>
                    `;
                    
                    // Add event listener
                    document.getElementById('back-to-start').addEventListener('click', function() {
                        resetUI();
                    });
                }
            }
        })
        .catch(error => {
            // Show error
            const dispensingMessage = document.getElementById('dispensing-message');
            if (dispensingMessage) {
                dispensingMessage.innerHTML = `
                    <div class="alert alert-danger">
                        <h4><i class="fas fa-exclamation-circle"></i> Order Failed</h4>
                        <p>There was an error connecting to the server: ${error.message}</p>
                        <button id="back-to-start" class="btn btn-primary mt-2">Back to Start</button>
                    </div>
                `;
                
                // Add event listener
                document.getElementById('back-to-start').addEventListener('click', function() {
                    resetUI();
                });
            }
        });
    }
    
    function monitorOrderProgress() {
        const dispensingMessage = document.getElementById('dispensing-message');
        const dispensingProgress = document.getElementById('dispensing-progress');
        
        // Initialize
        let pollInterval;
        let completed = false;
        
        // Start polling for updates
        const pollDispensing = () => {
            fetch('/dispensing_status')
                .then(response => response.json())
                .then(state => {
                    // Update UI based on state
                    updateDispenseUI(state);
                    
                    // Check if we're done
                    if (state.status === 'completed') {
                        completed = true;
                        clearInterval(pollInterval);
                        
                        // Show completion
                        showOrderComplete();
                    } else if (state.status === 'error') {
                        completed = true;
                        clearInterval(pollInterval);
                        
                        // Show error
                        if (dispensingMessage) {
                            dispensingMessage.innerHTML = `
                                <div class="alert alert-danger">
                                    <h4><i class="fas fa-exclamation-circle"></i> Error</h4>
                                    <p>${state.message || 'An error occurred during dispensing.'}</p>
                                    <button id="back-to-start" class="btn btn-primary mt-2">Back to Start</button>
                                </div>
                            `;
                            
                            // Add event listener
                            document.getElementById('back-to-start').addEventListener('click', function() {
                                resetUI();
                            });
                        }
                    }
                })
                .catch(error => {
                    console.error('Error polling dispensing status:', error);
                });
        };
        
        // Initial poll
        pollDispensing();
        
        // Set up interval
        pollInterval = setInterval(pollDispensing, 1000);
        
        // Safety timeout (5 minutes max)
        setTimeout(() => {
            if (!completed) {
                clearInterval(pollInterval);
                
                // Show timeout error
                if (dispensingMessage) {
                    dispensingMessage.innerHTML = `
                        <div class="alert alert-warning">
                            <h4><i class="fas fa-clock"></i> Timeout</h4>
                            <p>The dispensing process took too long. Please check the machine status.</p>
                            <button id="back-to-start" class="btn btn-primary mt-2">Back to Start</button>
                        </div>
                    `;
                    
                    // Add event listener
                    document.getElementById('back-to-start').addEventListener('click', function() {
                        resetUI();
                    });
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    function updateDispenseUI(state) {
        const dispensingMessage = document.getElementById('dispensing-message');
        const dispensingProgress = document.getElementById('dispensing-progress');
        
        if (!dispensingMessage || !dispensingProgress) return;
        
        // Update message based on status
        if (state.status === 'initializing') {
            dispensingMessage.textContent = 'Preparing your order...';
        } else if (state.status === 'dispensing') {
            dispensingMessage.textContent = (document.documentElement.lang === 'sk') ? 
                    `Čapujem ${state.current_item ? getBeverageName(state.current_item.beverage) : 'nápoj'}...` : 
                    `Pouring ${state.current_item ? getBeverageName(state.current_item.beverage) : 'beverage'}...`;
        } else if (state.status === 'waiting') {
            dispensingMessage.textContent = (document.documentElement.lang === 'sk') ? 
                    'Prosím, vezmite si nápoj' : 
                    'Please take your beverage';
        } else if (state.status === 'error') {
            dispensingMessage.textContent = (document.documentElement.lang === 'sk') ? 
                    `Chyba: ${state.message || 'Neznáma chyba'}` : 
                    `Error: ${state.message || 'Unknown error'}`;
        }
        
        // Update progress bar
        const progress = state.progress !== undefined ? state.progress : 0;
        dispensingProgress.style.width = `${progress}%`;
    }
    
    function showOrderComplete() {
        hideAllScreens();
        if (orderComplete) orderComplete.classList.remove('d-none');
        
        // Reset cart
        cartItems = [];
        updateCartCount();
        
        // Auto-redirect after 10 seconds
        setTimeout(() => {
            resetUI();
        }, 10000);
    }
    
    function resetUI() {
        // Clear all selections and cart
        selectedBeverage = '';
        selectedSize = '';
        cartItems = [];
        
        // Reset UI elements
        hideAllScreens();
        if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
        if (progressContainer) progressContainer.classList.add('d-none');
        
        // Reset all active states
        if (stepSelection) stepSelection.classList.remove('active');
        if (stepCart) stepCart.classList.remove('active');
        if (stepVerification) stepVerification.classList.remove('active');
        if (stepDispensing) stepDispensing.classList.remove('active');
        
        // Hide cart icon
        const cartIconContainer = document.getElementById('cart-icon-container');
        if (cartIconContainer) cartIconContainer.classList.add('d-none');
        
        // Reset buttons
        beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
        beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
        if (continueTypeBtn) continueTypeBtn.disabled = true;
        if (addToCartBtn) addToCartBtn.disabled = true;
        
        // Update display
        updateCartCount();
    }
    
    // Attach event listeners for verification buttons
    if (captureButton) {
        captureButton.addEventListener('click', captureWebcamImage);
    }
    
    if (retryButton) {
        retryButton.addEventListener('click', resetWebcam);
    }
    
    // Initialize the UI
    initializeUI();
    
    // Reset everything on initial load
    resetUI();
});