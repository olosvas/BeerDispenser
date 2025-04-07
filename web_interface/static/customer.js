document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
    const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
    const increaseQuantityBtn = document.querySelector('.inc-quantity');
    const decreaseQuantityBtn = document.querySelector('.dec-quantity');
    const currentQuantityElem = document.querySelector('.quantity-input');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const startVerificationBtn = document.getElementById('start-verification-btn');
    const shopCartItemsContainer = document.getElementById('shopping-cart-items');
    const cartTotalElem = document.getElementById('cart-total');
    const paymentTotalElem = document.getElementById('payment-total');
    const beverageTypeSelectionScreen = document.getElementById('beverage-type-selection');
    const beverageSizeSelectionScreen = document.getElementById('beverage-size-selection');
    const shoppingCartScreen = document.getElementById('shopping-cart');
    const ageVerificationScreen = document.getElementById('age-verification');
    const paymentScreen = document.getElementById('payment-screen');
    const dispensingScreen = document.getElementById('dispensing-screen');
    const orderCompleteScreen = document.getElementById('order-complete-screen');
    const progressBar = document.querySelector('.progress');
    const progressSteps = document.querySelectorAll('.progress-step');
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const captureButton = document.getElementById('capture-button');
    const retryButton = document.getElementById('retry-button');
    const continueToPaymentBtn = document.getElementById('continue-to-payment-btn');
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    const paymentMethodOptions = document.querySelectorAll('.payment-method-option');
    const continueToDispenseBtn = document.getElementById('continue-to-dispense-btn');
    const startOrderBtn = document.getElementById('start-order-btn');
    const webcamVideo = document.getElementById('webcam-video');
    const webcamCanvas = document.getElementById('webcam-canvas');
    const verificationImage = document.getElementById('verification-image');
    const verificationStatus = document.getElementById('verification-status');
    const verificationProgress = document.getElementById('verification-progress');
    const verificationResult = document.getElementById('verification-result');
    const cartTotalElements = document.querySelectorAll('.cart-total');
    const cartItemCountElements = document.querySelectorAll('.cart-item-count');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    // State variables
    let selectedBeverage = null;
    let selectedSize = null;
    let currentQuantity = 1;
    let cartItems = [];
    let webcamStream = null;
    let dispenseTimer = null;
    let dispenseUpdateInterval = 2000; // 2 seconds between updates
    
    /**
     * Initialize the UI on page load
     */
    function initializeUI() {
        // Clear any 'selected' classes that might be set
        beverageTypeOptions.forEach(option => option.classList.remove('selected'));
        beverageSizeOptions.forEach(option => option.classList.remove('selected'));
        
        // Set up quantity input
        if (currentQuantityElem) {
            currentQuantityElem.value = currentQuantity;
        }
        
        // Disable add to cart until both beverage and size are selected
        if (addToCartBtn) {
            addToCartBtn.disabled = true;
        }
        
        // Start at the beverage type selection screen and hide all other screens
        hideAllScreens();
        if (beverageTypeSelectionScreen) {
            beverageTypeSelectionScreen.classList.remove('d-none');
        }
        
        // Update progress bar
        updateProgressBar(1);
        
        // Check for existing cart items
        restoreState();
        
        // Update cart display
        updateCartDisplay();
    }
    
    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        // Beverage type selection
        beverageTypeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const type = option.getAttribute('data-type');
                selectBeverage(type);
            });
        });
        
        // Beverage size selection
        beverageSizeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const size = parseInt(option.getAttribute('data-size'), 10);
                selectSize(size);
            });
        });
        
        // Quantity controls
        if (increaseQuantityBtn) {
            increaseQuantityBtn.addEventListener('click', increaseQuantity);
        }
        
        if (decreaseQuantityBtn) {
            decreaseQuantityBtn.addEventListener('click', decreaseQuantity);
        }
        
        // Quick quantity buttons
        const quickQuantityBtns = document.querySelectorAll('.quick-quantity-btn');
        quickQuantityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const quantity = parseInt(btn.getAttribute('data-quantity'), 10);
                currentQuantity = quantity;
                if (currentQuantityElem) {
                    currentQuantityElem.value = currentQuantity;
                }
                saveState();
            });
        });
        
        // Add to cart
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', addToCart);
        }
        
        // Start verification button
        if (startVerificationBtn) {
            startVerificationBtn.addEventListener('click', () => {
                showScreen('age-verification');
                startWebcam();
            });
        }
        
        // Capture button
        if (captureButton) {
            captureButton.addEventListener('click', captureWebcamImage);
        }
        
        // Retry button
        if (retryButton) {
            retryButton.addEventListener('click', resetWebcam);
        }
        
        // Continue to payment
        if (continueToPaymentBtn) {
            continueToPaymentBtn.addEventListener('click', () => {
                showScreen('payment-screen');
            });
        }
        
        // Continue to dispense
        if (continueToDispenseBtn) {
            continueToDispenseBtn.addEventListener('click', startDispensing);
        }
        
        // Back to cart
        if (backToCartBtn) {
            backToCartBtn.addEventListener('click', () => {
                showScreen('shopping-cart');
            });
        }
        
        // Continue shopping
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                showScreen('beverage-type-selection');
            });
        }
        
        // Checkout
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cartItems.length > 0) {
                    // Check if alcohol verification is needed
                    const containsAlcohol = cartItems.some(item => item.type === 'beer' || item.type === 'pivo');
                    
                    if (containsAlcohol) {
                        showScreen('age-verification');
                        startWebcam();
                    } else {
                        showScreen('payment-screen');
                    }
                } else {
                    displayMessage('Add items to cart first', 'warning');
                }
            });
        }
        
        // Payment method selection
        paymentMethodOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all payment methods
                paymentMethodOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked payment method
                option.classList.add('selected');
                
                // Enable continue button
                if (continueToDispenseBtn) {
                    continueToDispenseBtn.disabled = false;
                }
            });
        });
        
        // Language switcher
        const languageSwitchBtns = document.querySelectorAll('.language-switch-btn');
        languageSwitchBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const language = btn.getAttribute('data-lang');
                window.location.href = `/set_language/${language}`;
            });
        });
        
        // Start order again
        if (startOrderBtn) {
            startOrderBtn.addEventListener('click', () => {
                window.location.href = '/';
            });
        }
        
        // Remove item from cart
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('remove-cart-item')) {
                const index = parseInt(e.target.getAttribute('data-index'), 10);
                removeFromCart(index);
            }
        });
        
        // Continue from type selection to size selection
        if (continueTypeBtn) {
            continueTypeBtn.addEventListener('click', () => {
                if (selectedBeverage) {
                    showScreen('beverage-size-selection');
                } else {
                    displayMessage('Select a beverage type first', 'warning');
                }
            });
        }
        
        // Back from size selection to type selection
        if (backToTypeBtn) {
            backToTypeBtn.addEventListener('click', () => {
                showScreen('beverage-type-selection');
            });
        }
        
        // View cart button
        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                showScreen('shopping-cart');
            });
        }
    }
    
    /**
     * Select a beverage type
     * 
     * @param {string} type - The type of beverage ('beer', 'kofola', etc.)
     */
    function selectBeverage(type) {
        selectedBeverage = type;
        
        // Update UI
        beverageTypeOptions.forEach(option => {
            if (option.getAttribute('data-type') === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Enable the continue button
        if (continueTypeBtn) {
            continueTypeBtn.disabled = false;
        }
        
        saveState();
        saveStateToServer();
    }
    
    /**
     * Select a beverage size
     * 
     * @param {number} size - The size in ml (300 or 500)
     */
    function selectSize(size) {
        selectedSize = size;
        
        // Update UI
        beverageSizeOptions.forEach(option => {
            if (parseInt(option.getAttribute('data-size'), 10) === size) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Update price display
        const priceDisplay = document.getElementById('price-display');
        if (priceDisplay) {
            const price = calculatePrice(selectedBeverage, selectedSize);
            priceDisplay.textContent = `€${price.toFixed(2)}`;
        }
        
        // Enable the add to cart button
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
        }
        
        // Enable the continue button
        const goToCartBtn = document.getElementById("view-cart-from-size-btn");
        if (goToCartBtn) {
            goToCartBtn.disabled = false;
            
            // Add click event if not already added
            if (!goToCartBtn.hasAttribute("data-event-attached")) {
                goToCartBtn.addEventListener("click", () => {
                    showScreen("shopping-cart");
                });
                goToCartBtn.setAttribute("data-event-attached", "true");
            }
        }

        saveState();
        saveStateToServer();
    }
    
    /**
     * Increase the quantity
     */
    function increaseQuantity() {
        currentQuantity++;
        if (currentQuantityElem) {
            currentQuantityElem.value = currentQuantity;
        }
        saveState();
    }
    
    /**
     * Decrease the quantity
     */
    function decreaseQuantity() {
        if (currentQuantity > 1) {
            currentQuantity--;
            if (currentQuantityElem) {
                currentQuantityElem.value = currentQuantity;
            }
        }
        saveState();
    }
    
    /**
     * Add the current selection to the cart
     */
    function addToCart() {
        if (selectedBeverage && selectedSize) {
            const price = calculatePrice(selectedBeverage, selectedSize);
            
            // Create cart item
            const cartItem = {
                type: selectedBeverage,
                size: selectedSize,
                quantity: currentQuantity,
                price: price,
                total: price * currentQuantity
            };
            
            // Add to cart
            cartItems.push(cartItem);
            
            // Reset selection
            currentQuantity = 1;
            if (currentQuantityElem) {
                currentQuantityElem.value = currentQuantity;
            }
            
            // Save state
            saveState();
            saveStateToServer();
            
            // Update UI
            updateCartDisplay();
            
            // Display success message
            displayMessage('Added to cart', 'success');
            
            // Show cart screen
            showScreen('shopping-cart');
        }
    }
    
    /**
     * Calculate the price for a given beverage and size
     * 
     * @param {string} beverage - The beverage type
     * @param {number} size - The size in ml
     * @returns {number} The price in EUR
     */
    function calculatePrice(beverage, size) {
        let basePrice = 0;
        
        // Set base price based on beverage type
        if (beverage === 'beer' || beverage === 'pivo') {
            basePrice = 1.50;
        } else if (beverage === 'kofola') {
            basePrice = 1.00;
        } else if (beverage === 'birell') {
            basePrice = 1.20;
        }
        
        // Adjust for size
        if (size === 500) {
            basePrice *= 1.5; // 50% more for larger size
        }
        
        return basePrice;
    }
    
    /**
     * Update the cart display
     */
    function updateCartDisplay() {
        if (shopCartItemsContainer) {
            shopCartItemsContainer.innerHTML = '';
            
            if (cartItems.length === 0) {
                if (emptyCartMessage) {
                    emptyCartMessage.classList.remove('d-none');
                }
                if (checkoutBtn) {
                    checkoutBtn.disabled = true;
                }
            } else {
                if (emptyCartMessage) {
                    emptyCartMessage.classList.add('d-none');
                }
                if (checkoutBtn) {
                    checkoutBtn.disabled = false;
                }
                
                // Add each item to the cart display
                cartItems.forEach((item, index) => {
                    const cartItemElem = document.createElement('div');
                    cartItemElem.className = 'cart-item';
                    cartItemElem.innerHTML = `
                        <div class="cart-item-details">
                            <span class="cart-item-name">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                            <span class="cart-item-size">${item.size}ml</span>
                            <span class="cart-item-quantity">× ${item.quantity}</span>
                        </div>
                        <div class="cart-item-price">€${item.total.toFixed(2)}</div>
                        <button class="btn btn-sm btn-outline-danger remove-cart-item" data-index="${index}">×</button>
                    `;
                    shopCartItemsContainer.appendChild(cartItemElem);
                });
            }
            
            // Update cart total
            const total = cartItems.reduce((sum, item) => sum + item.total, 0);
            if (cartTotalElem) {
                cartTotalElem.textContent = `€${total.toFixed(2)}`;
            }
            
            // Update all cart total elements
            cartTotalElements.forEach(elem => {
                elem.textContent = `€${total.toFixed(2)}`;
            });
            
            // Update cart item count
            const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartItemCountElements.forEach(elem => {
                elem.textContent = itemCount;
            });
            
            // Update payment total
            if (paymentTotalElem) {
                paymentTotalElem.textContent = `€${total.toFixed(2)}`;
            }
        }
    }
    
    /**
     * Remove an item from the cart
     * 
     * @param {number} index - The index of the item to remove
     */
    function removeFromCart(index) {
        if (index >= 0 && index < cartItems.length) {
            cartItems.splice(index, 1);
            saveState();
            saveStateToServer();
            updateCartDisplay();
        }
    }
    
    /**
     * Restore the state from localStorage
     */
    function restoreState() {
        const savedState = localStorage.getItem('beverageDispenserState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                
                selectedBeverage = state.selectedBeverage;
                selectedSize = state.selectedSize;
                currentQuantity = state.currentQuantity || 1;
                cartItems = state.cartItems || [];
                
                // Update UI based on restored state
                if (selectedBeverage) {
                    beverageTypeOptions.forEach(option => {
                        if (option.getAttribute('data-type') === selectedBeverage) {
                            option.classList.add('selected');
                        }
                    });
                    
                    if (continueTypeBtn) {
                        continueTypeBtn.disabled = false;
                    }
                }
                
                if (selectedSize) {
                    beverageSizeOptions.forEach(option => {
                        if (parseInt(option.getAttribute('data-size'), 10) === selectedSize) {
                            option.classList.add('selected');
                        }
                    });
                    
                    if (addToCartBtn) {
                        addToCartBtn.disabled = false;
                    }
                }
                
                if (currentQuantityElem) {
                    currentQuantityElem.value = currentQuantity;
                }
                
                // Update cart display
                updateCartDisplay();
                
                // Restore current screen if available
                const currentScreen = state.currentScreen;
                if (currentScreen) {
                    restoreUIState(currentScreen);
                }
                
            } catch (error) {
                console.error('Error restoring state:', error);
                // Clear invalid state
                localStorage.removeItem('beverageDispenserState');
            }
        }
    }
    
    /**
     * Save the current state to localStorage
     */
    function saveState() {
        const state = {
            selectedBeverage,
            selectedSize,
            currentQuantity,
            cartItems,
            currentScreen: getCurrentScreen()
        };
        
        localStorage.setItem('beverageDispenserState', JSON.stringify(state));
    }
    
    /**
     * Save the current state to the server
     */
    function saveStateToServer() {
        const state = {
            selectedBeverage,
            selectedSize,
            currentQuantity,
            cartItems,
            currentScreen: getCurrentScreen()
        };
        
        fetch('/save_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(state)
        })
        .then(response => response.json())
        .then(data => {
            console.log('State saved to server:', data);
        })
        .catch(error => {
            console.error('Error saving state to server:', error);
        });
    }
    
    /**
     * Get the ID of the currently visible screen
     * 
     * @returns {string|null} The ID of the current screen or null if none found
     */
    function getCurrentScreen() {
        const screens = [
            beverageTypeSelectionScreen,
            beverageSizeSelectionScreen,
            shoppingCartScreen,
            ageVerificationScreen,
            paymentScreen,
            dispensingScreen,
            orderCompleteScreen
        ];
        
        for (const screen of screens) {
            if (screen && !screen.classList.contains('d-none')) {
                return screen.id;
            }
        }
        
        return null;
    }
    
    /**
     * Restore the UI state based on the current screen
     * 
     * @param {string} screenName - The ID of the screen to show
     */
    function restoreUIState(screenName) {
        switch (screenName) {
            case 'beverage-type-selection':
                updateProgressBar(1);
                break;
            case 'beverage-size-selection':
                updateProgressBar(1);
                break;
            case 'shopping-cart':
                updateProgressBar(2);
                break;
            case 'age-verification':
                updateProgressBar(3);
                break;
            case 'payment-screen':
                updateProgressBar(4);
                break;
            case 'dispensing-screen':
                updateProgressBar(5);
                break;
            case 'order-complete-screen':
                updateProgressBar(6);
                break;
        }
        
        hideAllScreens();
        const screenElement = document.getElementById(screenName);
        if (screenElement) {
            screenElement.classList.remove('d-none');
        }
    }
    
    /**
     * Show a screen by name and update the progress bar
     * 
     * @param {string} screenName - The name of the screen to show
     */
    function showScreen(screenName) {
        hideAllScreens();
        
        // Show the requested screen
        const screenElement = document.getElementById(screenName);
        if (screenElement) {
            screenElement.classList.remove('d-none');
        }
        
        // Update progress bar
        switch (screenName) {
            case 'beverage-type-selection':
                updateProgressBar(1);
                break;
            case 'beverage-size-selection':
                updateProgressBar(1);
                break;
            case 'shopping-cart':
                updateProgressBar(2);
                break;
            case 'age-verification':
                updateProgressBar(3);
                break;
            case 'payment-screen':
                updateProgressBar(4);
                break;
            case 'dispensing-screen':
                updateProgressBar(5);
                break;
            case 'order-complete-screen':
                updateProgressBar(6);
                break;
        }
        
        // Save the current state
        saveState();
        saveStateToServer();
    }
    
    /**
     * Hide all screens
     */
    function hideAllScreens() {
        const screens = [
            beverageTypeSelectionScreen,
            beverageSizeSelectionScreen,
            shoppingCartScreen,
            ageVerificationScreen,
            paymentScreen, 
            dispensingScreen,
            orderCompleteScreen
        ];
        
        screens.forEach(screen => {
            if (screen) {
                screen.classList.add('d-none');
            }
        });
    }
    
    /**
     * Update the progress bar
     * 
     * @param {number} step - The current step (1-6)
     */
    function updateProgressBar(step) {
        if (progressSteps) {
            progressSteps.forEach((stepElem, index) => {
                if (index < step) {
                    stepElem.classList.add('active');
                } else {
                    stepElem.classList.remove('active');
                }
            });
        }
    }
    
    /**
     * Display a message to the user
     * 
     * @param {string} message - The message to display
     * @param {string} type - The type of message ('info', 'success', 'warning', 'error')
     */
    function displayMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        const messageElem = document.createElement('div');
        messageElem.className = `alert alert-${type} fade show`;
        messageElem.textContent = message;
        messageElem.style.opacity = '1';
        
        messageContainer.appendChild(messageElem);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageElem.style.opacity = '0';
            setTimeout(() => {
                messageContainer.removeChild(messageElem);
            }, 500); // Wait for fade out animation
        }, 3000);
    }
    
    /**
     * Start the webcam for age verification
     */
    function startWebcam() {
        if (webcamVideo) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    webcamStream = stream;
                    webcamVideo.srcObject = stream;
                    webcamVideo.play();
                    
                    if (captureButton) {
                        captureButton.disabled = false;
                    }
                    
                    // Update UI
                    if (verificationImage) {
                        verificationImage.classList.add('d-none');
                    }
                    if (webcamVideo) {
                        webcamVideo.classList.remove('d-none');
                    }
                    if (verificationResult) {
                        verificationResult.classList.add('d-none');
                    }
                    if (verificationStatus) {
                        verificationStatus.textContent = 'Please look at the camera';
                    }
                })
                .catch(error => {
                    showWebcamError('Unable to access the camera: ' + error.message);
                });
        }
    }
    
    /**
     * Stop the webcam
     */
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
    }
    
    /**
     * Reset the webcam view
     */
    function resetWebcam() {
        stopWebcam();
        startWebcam();
        
        if (verificationStatus) {
            verificationStatus.textContent = 'Please look at the camera';
        }
        if (verificationProgress) {
            verificationProgress.classList.add('d-none');
        }
        if (verificationResult) {
            verificationResult.classList.add('d-none');
        }
        if (verificationImage) {
            verificationImage.classList.add('d-none');
        }
        if (webcamVideo) {
            webcamVideo.classList.remove('d-none');
        }
        if (captureButton) {
            captureButton.disabled = false;
        }
        if (retryButton) {
            retryButton.classList.add('d-none');
        }
        if (continueToPaymentBtn) {
            continueToPaymentBtn.classList.add('d-none');
        }
    }
    
    /**
     * Capture an image from the webcam for age verification
     */
    function captureWebcamImage() {
        if (webcamCanvas && webcamVideo) {
            const context = webcamCanvas.getContext('2d');
            webcamCanvas.width = webcamVideo.videoWidth;
            webcamCanvas.height = webcamVideo.videoHeight;
            context.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
            
            const imageDataURL = webcamCanvas.toDataURL('image/jpeg');
            
            // Update UI
            if (verificationImage) {
                verificationImage.src = imageDataURL;
                verificationImage.classList.remove('d-none');
            }
            if (webcamVideo) {
                webcamVideo.classList.add('d-none');
            }
            if (captureButton) {
                captureButton.disabled = true;
            }
            if (verificationProgress) {
                verificationProgress.classList.remove('d-none');
            }
            if (verificationStatus) {
                verificationStatus.textContent = 'Verifying...';
            }
            if (retryButton) {
                retryButton.classList.remove('d-none');
            }
            
            // Stop the webcam
            stopWebcam();
            
            // Send the image for verification
            sendImageForVerification(imageDataURL);
        }
    }
    
    /**
     * Show a webcam error message
     * 
     * @param {string} message - The error message to display
     */
    function showWebcamError(message) {
        console.error('Webcam error:', message);
        
        if (verificationStatus) {
            verificationStatus.textContent = 'Camera error: ' + message;
        }
        
        if (captureButton) {
            captureButton.disabled = true;
        }
        
        displayMessage('Camera error: ' + message, 'error');
    }
    
    /**
     * Send a captured image to the server for age verification
     * 
     * @param {string} imageDataURL - The base64 image data URL
     */
    function sendImageForVerification(imageDataURL) {
        // Get beverage type from cart for context
        const beverageType = cartItems.find(item => item.type === 'beer' || item.type === 'pivo') ? 'beer' : null;
        
        // Prepare image data for sending
        const imageData = imageDataURL.replace(/^data:image\/jpeg;base64,/, '');
        
        fetch('/verify_age', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_data: imageData,
                beverage_type: beverageType
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Verification result:', data);
            
            // Update UI
            if (verificationProgress) {
                verificationProgress.classList.add('d-none');
            }
            
            if (verificationResult) {
                verificationResult.classList.remove('d-none');
                
                if (data.is_adult) {
                    verificationResult.className = 'alert alert-success';
                    verificationResult.textContent = 'Age verification successful!';
                    
                    if (continueToPaymentBtn) {
                        continueToPaymentBtn.classList.remove('d-none');
                    }
                } else {
                    verificationResult.className = 'alert alert-danger';
                    verificationResult.textContent = data.message || 'Age verification failed. You must be 18 or older.';
                    
                    if (retryButton) {
                        retryButton.classList.remove('d-none');
                    }
                }
            }
            
            if (verificationStatus) {
                if (data.is_adult) {
                    verificationStatus.textContent = 'Verification successful';
                } else {
                    verificationStatus.textContent = 'Verification failed';
                }
            }
        })
        .catch(error => {
            console.error('Error verifying age:', error);
            
            if (verificationProgress) {
                verificationProgress.classList.add('d-none');
            }
            
            if (verificationResult) {
                verificationResult.classList.remove('d-none');
                verificationResult.className = 'alert alert-danger';
                verificationResult.textContent = 'Error verifying age. Please try again.';
            }
            
            if (verificationStatus) {
                verificationStatus.textContent = 'Verification error';
            }
            
            if (retryButton) {
                retryButton.classList.remove('d-none');
            }
        });
    }
    
    /**
     * Start the dispensing process
     */
    function startDispensing() {
        // Get selected payment method
        let selectedPaymentMethod = null;
        paymentMethodOptions.forEach(option => {
            if (option.classList.contains('selected')) {
                selectedPaymentMethod = option.getAttribute('data-method');
            }
        });
        
        if (!selectedPaymentMethod) {
            displayMessage('Please select a payment method', 'warning');
            return;
        }
        
        // Prepare order data
        const orderData = {
            cartItems: cartItems,
            paymentMethod: selectedPaymentMethod,
            totalAmount: cartItems.reduce((sum, item) => sum + item.total, 0)
        };
        
        // Send order to server
        fetch('/process_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Order response:', data);
            
            if (data.success) {
                // Show dispensing screen
                showScreen('dispensing-screen');
                
                // Start monitoring the order progress
                monitorOrderProgress();
            } else {
                displayMessage(data.message || 'Failed to process order', 'error');
            }
        })
        .catch(error => {
            console.error('Error processing order:', error);
            displayMessage('Error processing order', 'error');
        });
    }
    
    /**
     * Monitor the order dispensing progress
     */
    function monitorOrderProgress() {
        // Initial status check
        updateDispenseUI();
        
        // Set up interval to check status
        dispenseTimer = setInterval(() => {
            fetch('/dispense_status')
                .then(response => response.json())
                .then(data => {
                    updateDispenseUI(data);
                    
                    if (data.status === 'completed') {
                        clearInterval(dispenseTimer);
                        showOrderComplete();
                    } else if (data.status === 'error') {
                        clearInterval(dispenseTimer);
                        displayMessage('Error during dispensing: ' + data.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error checking dispense status:', error);
                });
        }, dispenseUpdateInterval);
    }
    
    /**
     * Update the dispensing UI based on the current status
     * 
     * @param {Object} state - The current dispensing state
     */
    function updateDispenseUI(state = null) {
        const dispensingStatus = document.getElementById('dispensing-status');
        const dispensingProgress = document.getElementById('dispensing-progress');
        
        if (!state) {
            // Initial state before first response
            if (dispensingStatus) {
                dispensingStatus.innerHTML = `
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="ms-2">Starting dispensing process...</span>
                `;
            }
            return;
        }
        
        if (dispensingStatus) {
            let statusIcon = '';
            let statusText = '';
            
            switch (state.status) {
                case 'preparing':
                    statusIcon = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
                    statusText = 'Preparing your order...';
                    break;
                case 'cup_dispensing':
                    statusIcon = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
                    statusText = 'Dispensing cup...';
                    break;
                case 'pouring':
                    statusIcon = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
                    statusText = `Pouring ${state.current_item.type} (${state.current_item.size}ml)...`;
                    break;
                case 'delivering':
                    statusIcon = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
                    statusText = 'Delivering your drink...';
                    break;
                case 'waiting':
                    statusIcon = `<i class="bi bi-hourglass-split"></i>`;
                    statusText = 'Please take your drink before we continue...';
                    break;
                case 'completed':
                    statusIcon = `<i class="bi bi-check-circle"></i>`;
                    statusText = 'Order completed!';
                    break;
                case 'error':
                    statusIcon = `<i class="bi bi-exclamation-triangle"></i>`;
                    statusText = 'Error: ' + (state.message || 'Unknown error');
                    break;
            }
            
            dispensingStatus.innerHTML = `${statusIcon} <span class="ms-2">${statusText}</span>`;
        }
        
        if (dispensingProgress && state.progress) {
            dispensingProgress.style.width = `${state.progress}%`;
            dispensingProgress.setAttribute('aria-valuenow', state.progress);
        }
    }
    
    /**
     * Show the order complete screen
     */
    function showOrderComplete() {
        // Clear cart
        cartItems = [];
        saveState();
        saveStateToServer();
        
        // Show order complete screen
        showScreen('order-complete-screen');
    }
    
    // Initialize the UI
    initializeUI();
    
    // Attach event listeners
    attachEventListeners();
});
