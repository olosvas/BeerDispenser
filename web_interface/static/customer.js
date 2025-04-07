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
    
    // Payment elements
    const paymentMethodOptions = document.querySelectorAll(".payment-method-option");
    const payItemsTotal = document.getElementById("payment-items-total");
    const payVat = document.getElementById("payment-vat");
    const payTotal = document.getElementById("payment-total");
    const payNowBtn = document.getElementById("pay-now-btn");
    const backToVerificationBtn = document.getElementById("back-to-verification-btn");
    
    // Payment processing state
    let selectedPaymentMethod = null;
    
    // Function to update payment summary
    function updatePaymentSummary() {
        // Use the cartItems array as our cart data
        if (!cartItems || !cartItems.length) return;
        
        const itemsTotal = cartItems.reduce((total, item) => total + item.price, 0);
        const vatAmount = itemsTotal * 0.2; // 20% VAT
        const totalAmount = itemsTotal + vatAmount;
        
        if (payItemsTotal) payItemsTotal.textContent = `€${itemsTotal.toFixed(2)}`;
        if (payVat) payVat.textContent = `€${vatAmount.toFixed(2)}`;
        if (payTotal) payTotal.textContent = `€${totalAmount.toFixed(2)}`;
    }
    
    // Function to initialize payment screen
    function initializePaymentScreen() {
        // Reset selected payment method
        selectedPaymentMethod = null;
        
        // Clear selection state
        if (paymentMethodOptions) {
            paymentMethodOptions.forEach(opt => opt.classList.remove("selected"));
        }
        
        // Disable pay button initially
        if (payNowBtn) {
            payNowBtn.disabled = true;
        }
        
        // Update payment summary
        updatePaymentSummary();
        console.log("Payment screen initialized");
    }
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
        // Attach event listeners for payment methods
        if (paymentMethodOptions) {
            paymentMethodOptions.forEach(option => {
                option.addEventListener('click', function() {
                    paymentMethodOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedPaymentMethod = this.getAttribute('data-method');
                    
                    // Enable pay button if a payment method is selected
                    if (payNowBtn) {
                        payNowBtn.disabled = false;
                    }
                });
            });
        }
        
        // Back to verification button
        if (backToVerificationBtn) {
            backToVerificationBtn.addEventListener('click', function() {
                showScreen('age-verification');
            });
        }
        
        // Pay and proceed to dispensing
        if (payNowBtn) {
            payNowBtn.addEventListener('click', function() {
                if (!selectedPaymentMethod) {
                    displayMessage('Please select a payment method', 'warning');
                    return;
                }
                
                // Simulate payment processing
                const paymentProcessingOverlay = document.createElement('div');
                paymentProcessingOverlay.classList.add('payment-processing-overlay');
                paymentProcessingOverlay.innerHTML = `
                    <div class="text-center">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <h4>${document.documentElement.lang === 'sk' ? 'Spracovanie platby...' : 'Processing payment...'}</h4>
                    </div>
                `;
                
                paymentScreen.appendChild(paymentProcessingOverlay);
                
                // Simulate a delay for payment processing
                setTimeout(() => {
                    // Remove the overlay
                    paymentScreen.removeChild(paymentProcessingOverlay);
                    
                    // Proceed to dispensing
                    showScreen('dispensing-screen');
                    
                    // Update progress
                    updateProgressStep('dispensing');
                    
                    // Start the dispensing process
                    startDispensing();
                }, 2000);
            });
        }
        
        // Beverage type selection
        beverageTypeOptions.forEach(option => {
            option.addEventListener('click', () => selectBeverage(option.getAttribute('data-type')));
        });
        
        // Beverage size selection
        beverageSizeOptions.forEach(option => {
            option.addEventListener('click', () => selectSize(parseInt(option.getAttribute('data-size'), 10)));
        });
        
        // Quantity controls
        if (increaseBtn) {
            increaseBtn.addEventListener('click', increaseQuantity);
        }
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', decreaseQuantity);
        }
        
        if (quickQuantityBtns) {
            quickQuantityBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentQuantity = parseInt(btn.getAttribute('data-quantity'), 10);
                    if (quantityInput) quantityInput.value = currentQuantity;
                });
            });
        }
        
        // Navigation buttons
        if (continueTypeBtn) {
            continueTypeBtn.addEventListener('click', () => {
                showScreen('beverage-size-selection');
            });
        }
        
        if (backToTypeBtn) {
            backToTypeBtn.addEventListener('click', () => {
                showScreen('beverage-type-selection');
            });
        }
        
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', addToCart);
        }
        
        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                showScreen('shopping-cart');
            });
        }
        
        if (viewCartFromSizeBtn) {
            viewCartFromSizeBtn.addEventListener('click', () => {
                showScreen('shopping-cart');
            });
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                // If any alcoholic beverage is in the cart, show verification
                const needsVerification = cartItems.some(item => 
                    item.beverage === 'beer' || item.beverage === 'birel');
                
                if (needsVerification) {
                    showScreen('age-verification');
                } else {
                    // Skip verification for non-alcoholic only
                    showScreen('payment-screen');
                }
            });
        }
        
        if (continueShopping) {
            continueShopping.addEventListener('click', () => {
                showScreen('beverage-type-selection');
            });
        }
        
        // Age verification controls
        if (webcamVerifyBtn) {
            webcamVerifyBtn.addEventListener('click', () => {
                if (verificationMethods) verificationMethods.classList.add('d-none');
                if (webcamVerification) webcamVerification.classList.remove('d-none');
            });
        }
        
        if (webcamStartBtn) {
            webcamStartBtn.addEventListener('click', startWebcam);
        }
        
        if (webcamCaptureBtn) {
            webcamCaptureBtn.addEventListener('click', captureWebcamImage);
        }
        
        if (webcamBackBtn) {
            webcamBackBtn.addEventListener('click', () => {
                stopWebcam();
                if (verificationMethods) verificationMethods.classList.remove('d-none');
                if (webcamVerification) webcamVerification.classList.add('d-none');
            });
        }
        
        if (backToCartBtn) {
            backToCartBtn.addEventListener('click', () => {
                showScreen('shopping-cart');
            });
        }
    }
    
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
        
        if (continueTypeBtn) continueTypeBtn.disabled = false;
        
        if (beverageTypeDisplay) {
            const displayName = type.charAt(0).toUpperCase() + type.slice(1);
            beverageTypeDisplay.textContent = displayName;
        }
        
        // Save the state
        saveState();
    }
    
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
        
        if (addToCartBtn) addToCartBtn.disabled = false;
        
        // Save the state
        saveState();
    }
    
    function increaseQuantity() {
        if (currentQuantity < 10) {
            currentQuantity++;
            if (quantityInput) quantityInput.value = currentQuantity;
        }
        
        // Save the state
        saveState();
    }
    
    function decreaseQuantity() {
        if (currentQuantity > 1) {
            currentQuantity--;
            if (quantityInput) quantityInput.value = currentQuantity;
        }
        
        // Save the state
        saveState();
    }
    
    function addToCart() {
        if (!selectedBeverage || !selectedSize) {
            console.error('Beverage or size not selected');
            return;
        }
        
        // Calculate price
        const price = calculatePrice(selectedBeverage, selectedSize);
        
        // Add to cart multiple times based on quantity
        for (let i = 0; i < currentQuantity; i++) {
            cartItems.push({
                beverage: selectedBeverage,
                size: selectedSize,
                price: price
            });
        }
        
        // Update cart display
        updateCartDisplay();
        
        // Show success message
        const language = document.documentElement.lang || 'en';
        const message = language === 'sk' ? 
            `${currentQuantity}x ${selectedBeverage.toUpperCase()} ${selectedSize}ml pridané do košíka` : 
            `${currentQuantity}x ${selectedBeverage.toUpperCase()} ${selectedSize}ml added to cart`;
        
        displayMessage(message, 'success');
        
        // Reset quantity to 1
        currentQuantity = 1;
        if (quantityInput) quantityInput.value = 1;
        
        // Show view cart button
        if (viewCartFromSizeBtn && cartItems.length > 0) {
            viewCartFromSizeBtn.classList.remove('d-none');
        }
        
        // Show cart icon
        if (cartIconContainer && cartItems.length > 0) {
            cartIconContainer.classList.remove('d-none');
        }
        
        // Save the state
        saveState();
    }
    
    function calculatePrice(beverage, size) {
        // Base price for 300ml
        let basePrice = 0;
        
        switch(beverage) {
            case 'beer':
                basePrice = 1.60;
                break;
            case 'kofola':
                basePrice = 1.20;
                break;
            case 'birel':
                basePrice = 1.80;
                break;
            default:
                basePrice = 1.50;
        }
        
        // Adjust for size
        if (size === 500) {
            basePrice = basePrice * 1.6; // 60% more for 500ml
        }
        
        return basePrice;
    }
    
    function updateCartDisplay() {
        if (!cartItemsContainer || !cartItems) return;
        
        // Clear container
        cartItemsContainer.innerHTML = '';
        
        if (cartItems.length === 0) {
            if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }
        
        // Hide empty message, enable checkout
        if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
        if (checkoutBtn) checkoutBtn.disabled = false;
        
        // Group identical items
        const groupedItems = {};
        
        cartItems.forEach(item => {
            const key = `${item.beverage}-${item.size}`;
            if (!groupedItems[key]) {
                groupedItems[key] = {
                    beverage: item.beverage,
                    size: item.size,
                    count: 0,
                    totalPrice: 0
                };
            }
            
            groupedItems[key].count++;
            groupedItems[key].totalPrice += item.price;
        });
        
        // Create cart items
        Object.values(groupedItems).forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'card mb-3';
            
            const language = document.documentElement.lang || 'en';
            
            let beverageName = item.beverage.charAt(0).toUpperCase() + item.beverage.slice(1);
            if (language === 'sk' && item.beverage === 'beer') {
                beverageName = 'Pivo';
            }
            
            itemElement.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title">${beverageName}</h5>
                            <p class="card-text text-muted">${item.size}ml × ${item.count}</p>
                        </div>
                        <div class="text-end">
                            <h5 class="mb-0">€${item.totalPrice.toFixed(2)}</h5>
                            <button class="btn btn-sm btn-outline-danger mt-2 remove-item" data-index="${index}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'), 10);
                removeFromCart(index);
            });
        });
        
        // Update cart totals
        const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);
        if (cartTotal) cartTotal.textContent = `€${totalPrice.toFixed(2)}`;
        if (cartTotalItems) cartTotalItems.textContent = cartItems.length;
        if (cartCount) cartCount.textContent = cartItems.length;
    }
    
    function removeFromCart(index) {
        // Get the item to remove
        const keys = Object.keys(cartItems.reduce((groups, item) => {
            const key = `${item.beverage}-${item.size}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {}));
        
        const itemKey = keys[index];
        
        // Remove all items of this type
        cartItems = cartItems.filter(item => `${item.beverage}-${item.size}` !== itemKey);
        
        // Update display
        updateCartDisplay();
        
        // Hide view cart button if cart empty
        if (viewCartFromSizeBtn && cartItems.length === 0) {
            viewCartFromSizeBtn.classList.add('d-none');
        }
        
        // Hide cart icon if cart empty
        if (cartIconContainer && cartItems.length === 0) {
            cartIconContainer.classList.add('d-none');
        }
        
        // Save the state
        saveState();
    }
    
    function restoreState() {
        try {
            const savedState = localStorage.getItem('beverageSystemState');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Restore state variables
                selectedBeverage = state.selectedBeverage;
                selectedSize = state.selectedSize;
                currentQuantity = state.currentQuantity || 1;
                cartItems = state.cartItems || [];
                
                // Restore UI state based on variables
                if (selectedBeverage) {
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
                
                if (selectedSize) {
                    beverageSizeOptions.forEach(option => {
                        if (parseInt(option.getAttribute('data-size'), 10) === selectedSize) {
                            option.classList.add('selected');
                        }
                    });
                    
                    if (addToCartBtn) addToCartBtn.disabled = false;
                }
                
                if (quantityInput) {
                    quantityInput.value = currentQuantity;
                }
                
                // Update cart display
                updateCartDisplay();
                
                return state.currentScreen || 'beverage-type-selection';
            }
        } catch (error) {
            console.error('Error restoring state:', error);
        }
        
        return null;
    }
    
    function saveState() {
        // Save current state to local storage
        try {
            const state = {
                selectedBeverage,
                selectedSize,
                currentQuantity,
                cartItems,
                currentScreen: getCurrentScreen()
            };
            
            localStorage.setItem('beverageSystemState', JSON.stringify(state));
            
            // Also send to server for multi-device sync
            saveStateToServer();
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }
    
    function saveStateToServer() {
        // Send state to server for persistence
        fetch('/api/save_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ui_state: {
                    selectedBeverage,
                    selectedSize,
                    currentQuantity,
                    cartItems,
                    currentScreen: getCurrentScreen()
                }
            })
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
        
        return 'beverage-type-selection';
    }
    
    function showScreen(screenName) {
        // Save current screen before changing
        saveState();
        
        // Update progress steps
        updateProgressStep(screenName);
        
        // Hide all screens
        hideAllScreens();
        
        // Show the requested screen
        switch(screenName) {
            case 'beverage-type-selection':
                bevTypeSelectionScreen.classList.remove('d-none');
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
                if (paymentScreen) {
                    initializePaymentScreen();
                    paymentScreen.classList.remove('d-none');
                    console.log("Payment screen displayed");
                } else {
                    console.error("Payment screen element not found");
                }
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
        
        // Update cart icon visibility
        if (cartIconContainer) {
            if (cartItems.length > 0 && 
                screenName !== 'shopping-cart' && 
                screenName !== 'payment-screen' && 
                screenName !== 'dispensing-screen' &&
                screenName !== 'order-complete-screen') {
                cartIconContainer.classList.remove('d-none');
            } else {
                cartIconContainer.classList.add('d-none');
            }
        }
    }
    
    function hideAllScreens() {
        // Hide all main screens
        bevTypeSelectionScreen.classList.add('d-none');
        sizeSelectionScreen.classList.add('d-none');
        cartScreen.classList.add('d-none');
        
        if (verificationScreen) verificationScreen.classList.add('d-none');
        if (paymentScreen) paymentScreen.classList.add('d-none');
        if (dispensingScreen) dispensingScreen.classList.add('d-none');
        if (orderCompleteScreen) orderCompleteScreen.classList.add('d-none');
        
        // Reset sub-screens
        if (verificationMethods) verificationMethods.classList.remove('d-none');
        if (webcamVerification) webcamVerification.classList.add('d-none');
        if (webcamResult) webcamResult.classList.add('d-none');
    }
    
    function updateProgressStep(currentStep) {
        // Reset all steps
        [stepSelection, stepCart, stepVerification, stepPayment, stepDispensing, stepPickup].forEach(step => {
            if (step) step.classList.remove('active', 'completed');
        });
        
        // Activate current step and complete previous steps
        switch(currentStep) {
            case 'beverage-type-selection':
            case 'beverage-size-selection':
                if (stepSelection) stepSelection.classList.add('active');
                break;
            case 'shopping-cart':
                if (stepSelection) stepSelection.classList.add('completed');
                if (stepCart) stepCart.classList.add('active');
                break;
            case 'age-verification':
                if (stepSelection) stepSelection.classList.add('completed');
                if (stepCart) stepCart.classList.add('completed');
                if (stepVerification) stepVerification.classList.add('active');
                break;
            case 'payment-screen':
                if (stepSelection) stepSelection.classList.add('completed');
                if (stepCart) stepCart.classList.add('completed');
                if (stepVerification) stepVerification.classList.add('completed');
                if (stepPayment) stepPayment.classList.add('active');
                break;
            case 'dispensing-screen':
                if (stepSelection) stepSelection.classList.add('completed');
                if (stepCart) stepCart.classList.add('completed');
                if (stepVerification) stepVerification.classList.add('completed');
                if (stepPayment) stepPayment.classList.add('completed');
                if (stepDispensing) stepDispensing.classList.add('active');
                break;
            case 'order-complete-screen':
                if (stepSelection) stepSelection.classList.add('completed');
                if (stepCart) stepCart.classList.add('completed');
                if (stepVerification) stepVerification.classList.add('completed');
                if (stepPayment) stepPayment.classList.add('completed');
                if (stepDispensing) stepDispensing.classList.add('completed');
                if (stepPickup) stepPickup.classList.add('active');
                break;
        }
    }
    
    function displayMessage(message, type = 'info') {
        // Create toast element
        const messageElement = document.createElement('div');
        messageElement.className = `message-toast position-fixed top-0 start-50 translate-middle-x p-3 mt-5 rounded shadow alert alert-${type}`;
        messageElement.style.zIndex = '9999';
        messageElement.style.maxWidth = '80%';
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.3s ease-in-out';
        messageElement.innerHTML = message;
        
        // Add to the body
        document.body.appendChild(messageElement);
        
        // Fade in
        setTimeout(() => {
            messageElement.style.opacity = '1';
        }, 10);
        
        // Automatically remove after a delay
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 3000);
    }

    // Webcam related functionality
    function startWebcam() {
        if (webcamActive) return;
        
        if (!webcamVideo) {
            showWebcamError('Webcam element not found');
            return;
        }
        
        // Hide start button, show capture button
        if (webcamStartBtn) webcamStartBtn.classList.add('d-none');
        if (webcamCaptureBtn) webcamCaptureBtn.classList.remove('d-none');
        
        // Show loading indicator
        const webcamLoading = document.getElementById('webcam-loading');
        if (webcamLoading) webcamLoading.classList.remove('d-none');
        
        // Access the webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoStream = stream;
                webcamVideo.srcObject = stream;
                webcamActive = true;
                
                // Hide loading indicator
                if (webcamLoading) webcamLoading.classList.add('d-none');
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
                showWebcamError(document.documentElement.lang === 'sk' ? 
                    'Nepodarilo sa pristúpiť ku kamere. Skontrolujte, či je pripojená a či ste povolili prístup.' : 
                    'Failed to access camera. Check if it is connected and if you have allowed access.'
                );
                
                // Hide loading indicator
                if (webcamLoading) webcamLoading.classList.add('d-none');
                
                // Show start button again
                if (webcamStartBtn) webcamStartBtn.classList.remove('d-none');
            });
    }
    
    function stopWebcam() {
        if (!webcamActive || !videoStream) return;
        
        // Stop all video tracks
        videoStream.getTracks().forEach(track => track.stop());
        webcamVideo.srcObject = null;
        webcamActive = false;
        videoStream = null;
        
        // Reset UI
        if (webcamStartBtn) webcamStartBtn.classList.remove('d-none');
        if (webcamCaptureBtn) webcamCaptureBtn.classList.add('d-none');
    }
    function captureWebcamImage() {
        if (!webcamActive || !webcamVideo || !webcamCanvas) {
            showWebcamError('Webcam not active');
            return;
        }
        
        // Draw the video frame to the canvas
        const context = webcamCanvas.getContext('2d');
        webcamCanvas.width = webcamVideo.videoWidth;
        webcamCanvas.height = webcamVideo.videoHeight;
        context.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
        
        // Get the data URL
        try {
            capturedImage = webcamCanvas.toDataURL('image/jpeg');
            
            // Hide webcam view, show result
            if (webcamVerification) webcamVerification.classList.add('d-none');
            if (webcamResult) {
                webcamResult.innerHTML = `
                    <div class="text-center">
                        <img src="${capturedImage}" alt="Captured" class="img-fluid mb-3 border rounded" style="max-height: 200px;">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">${document.documentElement.lang === 'sk' ? 'Overovanie...' : 'Verifying...'}</p>
                    </div>
                `;
                webcamResult.classList.remove('d-none');
            }
            
            // Stop the webcam
            stopWebcam();
            
            // Send the image for verification
            setTimeout(() => sendImageForVerification(capturedImage), 500);
            
        } catch (error) {
            console.error('Error capturing image:', error);
            showWebcamError(document.documentElement.lang === 'sk' ? 
                'Nepodarilo sa zachytiť fotografiu. Skúste znova.' : 
                'Failed to capture photo. Try again.'
            );
        }
    }
    
    function resetWebcam() {
        stopWebcam();
        if (webcamResult) webcamResult.classList.add('d-none');
        if (webcamVerification) webcamVerification.classList.remove('d-none');
    }
    
    function showWebcamError(message) {
        const webcamError = document.getElementById('webcam-error');
        if (webcamError) {
            webcamError.textContent = message;
            webcamError.classList.remove('d-none');
            
            // Hide after a delay
            setTimeout(() => {
                webcamError.classList.add('d-none');
            }, 5000);
        }
    }
    
    // Beverages that require age verification
    const beveragesRequiringVerification = ['beer', 'birel'];
    let beverageRequiringVerification = null;
    
    function sendImageForVerification(imageDataURL) {
        // Determine which beverage requires verification
        beverageRequiringVerification = null;
        for (const item of cartItems) {
            if (beveragesRequiringVerification.includes(item.beverage)) {
                beverageRequiringVerification = item.beverage;
                break;
            }
        }
        
        if (!beverageRequiringVerification) {
            // No verification needed, proceed to payment
            showScreen('payment-screen');
            return;
        }
        
        // Send the image to server for verification
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
                            console.log("Auto-transitioning to payment screen");
                            showScreen('payment-screen');
                        }, 3000);
                    } else {
                        webcamResult.innerHTML += `
                            <div class="text-center mt-3">
                                <button id="try-again-btn" class="btn btn-primary">
                                    ${language === 'sk' ? 'Skúsiť znova' : 'Try Again'} <i class="fas fa-redo ms-2"></i>
                                </button>
                                <button id="back-to-methods-btn" class="btn btn-outline-secondary ms-2">
                                    ${language === 'sk' ? 'Iný spôsob' : 'Other Method'} <i class="fas fa-exchange-alt ms-2"></i>
                                </button>
                            </div>
                        `;
                        
                        // Add event listeners
                        const tryAgainBtn = document.getElementById('try-again-btn');
                        if (tryAgainBtn) {
                            tryAgainBtn.addEventListener('click', resetWebcam);
                        }
                        
                        const backToMethodsBtn = document.getElementById('back-to-methods-btn');
                        if (backToMethodsBtn) {
                            backToMethodsBtn.addEventListener('click', () => {
                                if (verificationMethods) verificationMethods.classList.remove('d-none');
                                if (webcamResult) webcamResult.classList.add('d-none');
                            });
                        }
                    }
                } else {
                    // Error in verification process
                    const errorMessage = data.message || (language === 'sk' ? 
                        'Chyba pri overovaní. Skúste znova.' : 
                        'Error during verification. Please try again.');
                    
                    webcamResult.innerHTML = `
                        <div class="alert alert-danger mb-3">
                            <h5 class="alert-heading">${language === 'sk' ? 'Chyba overenia' : 'Verification Error'}</h5>
                            <p class="mb-0">${errorMessage}</p>
                        </div>
                        <div class="text-center mt-3">
                            <button id="try-again-btn" class="btn btn-primary">
                                ${language === 'sk' ? 'Skúsiť znova' : 'Try Again'} <i class="fas fa-redo ms-2"></i>
                            </button>
                        </div>
                    `;
                    
                    const tryAgainBtn = document.getElementById('try-again-btn');
                    if (tryAgainBtn) {
                        tryAgainBtn.addEventListener('click', resetWebcam);
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error during verification:', error);
            if (webcamResult) {
                const language = document.documentElement.lang || 'en';
                webcamResult.innerHTML = `
                    <div class="alert alert-danger mb-3">
                        <h5 class="alert-heading">${language === 'sk' ? 'Chyba komunikácie' : 'Communication Error'}</h5>
                        <p class="mb-0">${language === 'sk' ? 
                            'Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie a skúste znova.' : 
                            'Failed to connect to server. Check your connection and try again.'}</p>
                    </div>
                    <div class="text-center mt-3">
                        <button id="try-again-btn" class="btn btn-primary">
                            ${language === 'sk' ? 'Skúsiť znova' : 'Try Again'} <i class="fas fa-redo ms-2"></i>
                        </button>
                    </div>
                `;
                
                const tryAgainBtn = document.getElementById('try-again-btn');
                if (tryAgainBtn) {
                    tryAgainBtn.addEventListener('click', resetWebcam);
                }
            }
        });
    }

    // Dispensing functionality
    function startDispensing() {
        // Reset dispensing state
        dispensingComplete = false;
        
        // Initialize dispensing UI
        const dispensingStatus = document.getElementById('dispensing-status');
        const dispensingProgress = document.getElementById('dispensing-progress');
        
        if (dispensingStatus) {
            dispensingStatus.textContent = document.documentElement.lang === 'sk' ? 
                'Pripravujem čapovací systém...' : 
                'Preparing dispensing system...';
        }
        
        if (dispensingProgress) {
            dispensingProgress.style.width = '10%';
            dispensingProgress.setAttribute('aria-valuenow', '10');
        }
        
        // Send request to start dispensing
        fetch('/api/start_dispensing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_items: cartItems
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Start monitoring dispensing progress
                monitorOrderProgress();
            } else {
                // Display error
                if (dispensingStatus) {
                    dispensingStatus.textContent = document.documentElement.lang === 'sk' ? 
                        'Chyba pri spúšťaní: ' + data.message : 
                        'Error starting dispense: ' + data.message;
                }
                
                // Stop monitoring after a delay and return to cart
                setTimeout(() => {
                    showScreen('shopping-cart');
                    displayMessage(document.documentElement.lang === 'sk' ? 
                        'Čapovanie zlyhalo. Skúste znova.' : 
                        'Dispensing failed. Please try again.',
                        'danger'
                    );
                }, 3000);
            }
        })
        .catch(error => {
            console.error('Error starting dispensing:', error);
            if (dispensingStatus) {
                dispensingStatus.textContent = document.documentElement.lang === 'sk' ? 
                    'Chyba komunikácie so systémom.' : 
                    'Error communicating with the system.';
            }
        });
    }
    
    function monitorOrderProgress() {
        // Clear any existing interval
        if (dispensingMonitorInterval) {
            clearInterval(dispensingMonitorInterval);
        }
        
        // Set up progress monitoring
        dispensingMonitorInterval = setInterval(() => {
            fetch('/api/dispensing_status')
                .then(response => response.json())
                .then(data => {
                    updateDispenseUI(data);
                    
                    // Check if dispensing is complete
                    if (data.status === 'complete') {
                        // Stop monitoring
                        clearInterval(dispensingMonitorInterval);
                        dispensingMonitorInterval = null;
                        
                        // Show completion screen after a delay
                        setTimeout(() => {
                            showOrderComplete();
                        }, 1000);
                    }
                })
                .catch(error => {
                    console.error('Error monitoring progress:', error);
                });
        }, 1000);
    }
    
    function updateDispenseUI(state) {
        const dispensingStatus = document.getElementById('dispensing-status');
        const dispensingProgress = document.getElementById('dispensing-progress');
        
        if (!dispensingStatus || !dispensingProgress) return;
        
        const language = document.documentElement.lang || 'en';
        
        // Update status text
        switch(state.status) {
            case 'preparing':
                dispensingStatus.textContent = language === 'sk' ? 
                    'Pripravujem čapovací systém...' : 
                    'Preparing dispensing system...';
                break;
            case 'dispensing_cup':
                dispensingStatus.textContent = language === 'sk' ? 
                    'Podávam pohár...' : 
                    'Dispensing cup...';
                break;
            case 'pouring':
                dispensingStatus.textContent = language === 'sk' ? 
                    `Čapujem ${state.current_item ? state.current_item.beverage : 'nápoj'}...` : 
                    `Pouring ${state.current_item ? state.current_item.beverage : 'beverage'}...`;
                break;
            case 'delivering':
                dispensingStatus.textContent = language === 'sk' ? 
                    'Doručujem pohár...' : 
                    'Delivering cup...';
                break;
            case 'complete':
                dispensingStatus.textContent = language === 'sk' ? 
                    'Hotovo! Váš nápoj je pripravený.' : 
                    'Complete! Your beverage is ready.';
                break;
            case 'error':
                dispensingStatus.textContent = language === 'sk' ? 
                    `Chyba: ${state.message || 'Neznáma chyba'}` : 
                    `Error: ${state.message || 'Unknown error'}`;
                break;
            default:
                dispensingStatus.textContent = language === 'sk' ? 
                    'Spracovávam...' : 
                    'Processing...';
        }
        
        // Update progress bar
        const progress = state.progress || 0;
        dispensingProgress.style.width = `${progress}%`;
        dispensingProgress.setAttribute('aria-valuenow', String(progress));
    }
    
    function showOrderComplete() {
        // Reset cart
        cartItems = [];
        updateCartDisplay();
        
        // Save state
        saveState();
        
        // Show complete screen
        showScreen('order-complete-screen');
    }
});
