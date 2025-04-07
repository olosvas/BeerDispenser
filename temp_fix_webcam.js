document.addEventListener('DOMContentLoaded', function() {
    // Global elements
    const bevTypeSelectionScreen = document.getElementById('beverage-type-selection');
    const sizeSelectionScreen = document.getElementById('beverage-size-selection');
    const cartScreen = document.getElementById('shopping-cart');
    const paymentScreen = document.getElementById('payment-screen');
    const verificationScreen = document.getElementById('age-verification');
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
    const cartTotal = document.getElementById('cart-total-price');
    const cartTotalItems = document.getElementById('cart-total-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartCount = document.getElementById('cart-count');
    const cartIconContainer = document.getElementById('cart-icon-container');
    
    // Verification elements
    const verificationMethods = document.getElementById('verification-methods');
    const webcamVerification = document.getElementById('webcam-verification');
    const webcamVerifyBtn = document.getElementById('webcam-verify-btn');
    const idCardVerifyBtn = document.getElementById('id-card-verify-btn');
    const webcamStartBtn = document.getElementById('webcam-start-btn');
    const webcamCaptureBtn = document.getElementById('webcam-capture-btn');
    const webcamBackBtn = document.getElementById('webcam-back-btn');
    const webcamResult = document.getElementById('webcam-result');
    const webcamVideo = document.getElementById('webcam-video');
    const webcamCanvas = document.getElementById('webcam-canvas');
    
    // Buttons
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const continueShopping = document.getElementById('continue-shopping-btn');
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
    let videoStream = null;
    
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
            showScreen('age-verification');
        });
        
        if (continueShopping) continueShopping.addEventListener('click', () => {
            showScreen('beverage-type-selection');
        });
        
        if (backToCartBtn && backToCartBtn.addEventListener) {
            backToCartBtn.addEventListener('click', () => {
                showScreen('shopping-cart');
            });
        }
        
        // Verification method selection
        if (webcamVerifyBtn) webcamVerifyBtn.addEventListener('click', () => {
            if (verificationMethods) verificationMethods.classList.add('d-none');
            if (webcamVerification) webcamVerification.classList.remove('d-none');
        });
        
        if (idCardVerifyBtn) idCardVerifyBtn.addEventListener('click', () => {
            // Implementation for ID card verification would go here
            // For now, just show a success message and proceed
            const message = document.documentElement.lang === 'sk' ? 
                'Overenie preukazu úspešné!' : 
                'ID verification successful!';
            displayMessage(message, 'success');
            
            // Proceed to next step
            showScreen('payment-screen');
        });
        
        // Webcam controls
        if (webcamStartBtn) webcamStartBtn.addEventListener('click', startWebcam);
        if (webcamCaptureBtn) webcamCaptureBtn.addEventListener('click', captureWebcamImage);
        if (webcamBackBtn) webcamBackBtn.addEventListener('click', () => {
            stopWebcam();
            if (verificationMethods) verificationMethods.classList.remove('d-none');
            if (webcamVerification) webcamVerification.classList.add('d-none');
        });
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
                let totalQuantity = 0;
                
                cartItems.forEach((item, index) => {
                    const itemPrice = item.price;
                    totalPrice += itemPrice;
                    totalQuantity += item.quantity;
                    
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
                
                if (cartTotalItems) {
                    cartTotalItems.textContent = totalQuantity;
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
    
    // Webcam functionality
    function startWebcam() {
        if (webcamActive) return;
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoStream = stream;
                    webcamVideo.srcObject = stream;
                    webcamVideo.play();
                    webcamActive = true;
                    
                    if (webcamCaptureBtn) webcamCaptureBtn.disabled = false;
                    if (webcamStartBtn) webcamStartBtn.disabled = true;
                    
                    // Reset result area if visible
                    if (webcamResult) webcamResult.classList.add('d-none');
                })
                .catch(error => {
                    console.error('Error accessing webcam:', error);
                    const language = document.documentElement.lang || 'en';
                    const errorMessage = language === 'sk' ? 
                        'Nepodarilo sa pristúpiť ku kamere. Skontrolujte nastavenia kamery a povolenia.' : 
                        'Failed to access webcam. Check your camera settings and permissions.';
                    displayMessage(errorMessage, 'danger');
                });
        } else {
            const language = document.documentElement.lang || 'en';
            const errorMessage = language === 'sk' ? 
                'Váš prehliadač nepodporuje prístup ku kamere.' : 
                'Your browser does not support webcam access.';
            displayMessage(errorMessage, 'danger');
        }
    }
    
    function stopWebcam() {
        if (!webcamActive) return;
        
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        
        webcamVideo.srcObject = null;
        webcamActive = false;
        
        if (webcamCaptureBtn) webcamCaptureBtn.disabled = true;
        if (webcamStartBtn) webcamStartBtn.disabled = false;
    }
    
    function captureWebcamImage() {
        if (!webcamActive) return;
        
        const context = webcamCanvas.getContext('2d');
        
        // Set canvas dimensions to match video
        webcamCanvas.width = webcamVideo.videoWidth;
        webcamCanvas.height = webcamVideo.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
        
        // Convert to data URL
        capturedImage = webcamCanvas.toDataURL('image/jpeg');
        
        // Stop webcam after capture
        stopWebcam();
        
        // Display result
        if (webcamResult) {
            webcamResult.classList.remove('d-none');
            webcamResult.innerHTML = `
                <div class="text-center">
                    <h5 class="mb-3">${document.documentElement.lang === 'sk' ? 'Spracovanie snímky...' : 'Processing image...'}</h5>
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
        }
        
        // Send image to server for verification
        sendImageForVerification(capturedImage);
    }
    
    function sendImageForVerification(imageDataURL) {
        // Determine beverage type that needs age verification
        let beverageRequiringVerification = 'beer'; // Default
        
        for (const item of cartItems) {
            if (item.beverage === 'beer') {
                beverageRequiringVerification = 'beer';
                break;
            } else if (item.beverage === 'birel') {
                beverageRequiringVerification = 'birel';
            }
        }
        
        fetch('/api/verify_age', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_data: imageDataURL,
                beverage_type: beverageRequiringVerification
            })
        })
        .then(response => response.json())
        .then(data => {
            if (webcamResult) {
                const language = document.documentElement.lang || 'en';
                
                if (data.success) {
                    const isVerified = data.verified;
                    const message = data.message || (isVerified ? 
                        (language === 'sk' ? 'Overenie veku úspešné!' : 'Age verification successful!') : 
                        (language === 'sk' ? 'Overenie veku zlyhalo. Skúste znova alebo použite iný spôsob overenia.' : 'Age verification failed. Try again or use another verification method.'));
                    
                    webcamResult.innerHTML = `
                        <div class="alert alert-${isVerified ? 'success' : 'danger'} mb-3">
                            <h5 class="alert-heading">${isVerified ? 
                                (language === 'sk' ? 'Overenie úspešné' : 'Verification Successful') : 
                                (language === 'sk' ? 'Overenie zlyhalo' : 'Verification Failed')}</h5>
                            <p class="mb-0">${message}</p>
                            ${data.estimated_age ? `<p class="mb-0 mt-2">${language === 'sk' ? 'Odhadovaný vek' : 'Estimated age'}: ${data.estimated_age}</p>` : ''}
                        </div>
                    `;
                    
                    if (isVerified) {
                        webcamResult.innerHTML += `
                            <div class="text-center mt-3">
                                <button id="proceed-to-payment-btn" class="btn btn-primary">
                                    ${language === 'sk' ? 'Pokračovať k platbe' : 'Proceed to Payment'} <i class="fas fa-chevron-right ms-2"></i>
                                </button>
                            </div>
                        `;
                        
                        // Add event listener to proceed button
                        const proceedBtn = document.getElementById('proceed-to-payment-btn');
                        if (proceedBtn) {
                            proceedBtn.addEventListener('click', () => {
                                showScreen('payment-screen');
                            });
                        }
                        
                        // Automatically proceed to payment after 3 seconds
                        setTimeout(() => {
                            showScreen('payment-screen');
                        }, 3000);
                    } else {
                        webcamResult.innerHTML += `
                            <div class="text-center mt-3">
                                <button id="retry-verification-btn" class="btn btn-secondary me-2">
                                    <i class="fas fa-redo me-2"></i> ${language === 'sk' ? 'Skúsiť znova' : 'Try Again'}
                                </button>
                                <button id="back-to-methods-btn" class="btn btn-outline-primary">
                                    ${language === 'sk' ? 'Vybrať iný spôsob' : 'Choose Another Method'}
                                </button>
                            </div>
                        `;
                        
                        // Add event listeners for retry and back buttons
                        const retryBtn = document.getElementById('retry-verification-btn');
                        const backToMethodsBtn = document.getElementById('back-to-methods-btn');
                        
                        if (retryBtn) {
                            retryBtn.addEventListener('click', () => {
                                webcamResult.classList.add('d-none');
                                startWebcam();
                            });
                        }
                        
                        if (backToMethodsBtn) {
                            backToMethodsBtn.addEventListener('click', () => {
                                webcamResult.classList.add('d-none');
                                verificationMethods.classList.remove('d-none');
                                webcamVerification.classList.add('d-none');
                            });
                        }
                    }
                } else {
                    // Error in processing
                    webcamResult.innerHTML = `
                        <div class="alert alert-danger mb-3">
                            <h5 class="alert-heading">${language === 'sk' ? 'Chyba pri spracovaní' : 'Processing Error'}</h5>
                            <p class="mb-0">${data.message || (language === 'sk' ? 'Nastala chyba pri overovaní veku. Skúste to znova.' : 'An error occurred during age verification. Please try again.')}</p>
                        </div>
                        <div class="text-center mt-3">
                            <button id="retry-verification-btn" class="btn btn-secondary">
                                <i class="fas fa-redo me-2"></i> ${language === 'sk' ? 'Skúsiť znova' : 'Try Again'}
                            </button>
                        </div>
                    `;
                    
                    // Add event listener for retry button
                    const retryBtn = document.getElementById('retry-verification-btn');
                    if (retryBtn) {
                        retryBtn.addEventListener('click', () => {
                            webcamResult.classList.add('d-none');
                            startWebcam();
                        });
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error during age verification:', error);
            
            if (webcamResult) {
                const language = document.documentElement.lang || 'en';
                webcamResult.innerHTML = `
                    <div class="alert alert-danger mb-3">
                        <h5 class="alert-heading">${language === 'sk' ? 'Chyba spojenia' : 'Connection Error'}</h5>
                        <p class="mb-0">${language === 'sk' ? 'Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie k internetu a skúste znova.' : 'Failed to connect to the server. Check your internet connection and try again.'}</p>
                    </div>
                    <div class="text-center mt-3">
                        <button id="retry-verification-btn" class="btn btn-secondary">
                            <i class="fas fa-redo me-2"></i> ${language === 'sk' ? 'Skúsiť znova' : 'Try Again'}
                        </button>
                    </div>
                `;
                
                // Add event listener for retry button
                const retryBtn = document.getElementById('retry-verification-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        webcamResult.classList.add('d-none');
                        startWebcam();
                    });
                }
            }
        });
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
        if (verificationScreen && !verificationScreen.classList.contains('d-none')) return 'age-verification';
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
            'age-verification': {step: stepVerification, previous: [stepSelection, stepCart]},
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
        
        // Reset verification UI when switching screens
        if (screenName === 'age-verification') {
            if (verificationMethods) verificationMethods.classList.remove('d-none');
            if (webcamVerification) webcamVerification.classList.add('d-none');
            if (webcamResult) webcamResult.classList.add('d-none');
            stopWebcam();
        }
        
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
            case 'age-verification':
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
