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
    // List of beverages requiring age verification
    const beveragesRequiringVerification = ['beer', 'birel'];
    let beverageRequiringVerification = null;
    
    // Verification retry state variables
    let verificationRetryCount = 0;
    const MAX_VERIFICATION_RETRIES = 5;
    let currentVerificationImage = null;
    
    
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
        
        // Update the payment screen elements
        if (payItemsTotal) payItemsTotal.textContent = `€${itemsTotal.toFixed(2)}`;
        if (payVat) payVat.textContent = `€${vatAmount.toFixed(2)}`;
        if (payTotal) payTotal.textContent = `€${totalAmount.toFixed(2)}`;
    }
    
    // Initialize payment screen elements
    function initializePaymentScreen() {
        updatePaymentSummary();
        
        // Add click handlers for payment method options
        if (paymentMethodOptions) {
            paymentMethodOptions.forEach(option => {
                option.addEventListener('click', () => {
                    // Remove selected class from all options
                    paymentMethodOptions.forEach(opt => opt.classList.remove('selected'));
                    
                    // Add selected class to clicked option
                    option.classList.add('selected');
                    
                    // Update selected payment method
                    selectedPaymentMethod = option.dataset.method;
                    
                    // Enable the pay button
                    if (payNowBtn) payNowBtn.disabled = false;
                });
            });
        }
        
        // Add click handler for pay now button
        if (payNowBtn) {
            payNowBtn.addEventListener('click', startDispensing);
        }
        
        // Add click handler for back button
        if (backToVerificationBtn) {
            backToVerificationBtn.addEventListener('click', () => {
                // Check if we need age verification for any item in the cart
                const needsVerification = cartItems.some(item => 
                    beveragesRequiringVerification.includes(item.beverage)
                );
                
                if (needsVerification) {
                    showScreen('age-verification');
                } else {
                    showScreen('shopping-cart');
                }
            });
        }
    }
    
    // Initialize the UI
    function initializeUI() {
        // Set up event listeners for beverage type selection
        if (beverageTypeOptions) {
            beverageTypeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const type = option.dataset.type;
                    selectBeverage(type);
                });
            });
        }
        
        // Set up event listeners for beverage size selection
        if (beverageSizeOptions) {
            beverageSizeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const size = option.dataset.size;
                    selectSize(size);
                });
            });
        }
        
        // Quantity adjustment events
        if (increaseBtn) {
            increaseBtn.addEventListener('click', increaseQuantity);
        }
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', decreaseQuantity);
        }
        
        if (quickQuantityBtns) {
            quickQuantityBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentQuantity = parseInt(btn.dataset.value, 10);
                    updateQuantityDisplay();
                });
            });
        }
        
        attachEventListeners();
        
        // Initialize the default screen
        showScreen('beverage-type-selection');
        updateProgressBar('selection');
        
        // Initialize payment screen
        initializePaymentScreen();
        
        // Restore any saved state
        restoreState();
    }
    
    function attachEventListeners() {
        // Button event listeners
        if (continueTypeBtn) {
            continueTypeBtn.addEventListener('click', () => {
                if (selectedBeverage) {
                    showScreen('beverage-size-selection');
                }
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
                // Check if age verification is needed
                const needsVerification = cartItems.some(item => 
                    beveragesRequiringVerification.includes(item.beverage)
                );
                
                if (needsVerification) {
                    showScreen('age-verification');
                    updateProgressBar('verification');
                } else {
                    showScreen('payment-screen');
                    updateProgressBar('payment');
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
                if (webcamResult) {
                    webcamResult.classList.add('d-none');
                    webcamResult.innerHTML = '';
                }
            });
        }
        
        if (idCardVerifyBtn) {
            idCardVerifyBtn.addEventListener('click', () => {
                const language = document.documentElement.lang || 'en';
                displayMessage(
                    language === 'sk' ? 
                    'Funkcia overenia pomocou občianskeho preukazu nie je momentálne dostupná' : 
                    'ID card verification is not currently available', 
                    'warning'
                );
            });
        }
        
        if (backToCartBtn) {
            backToCartBtn.addEventListener('click', () => {
                // Go back to cart from verification screen
                stopWebcam();
                showScreen('shopping-cart');
            });
        }
    }
    
    function selectBeverage(type) {
        // Update selected beverage
        selectedBeverage = type;
        
        // Update UI
        if (beverageTypeOptions) {
            beverageTypeOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.type === type) {
                    option.classList.add('selected');
                }
            });
        }
        
        // Update the beverage type display
        if (beverageTypeDisplay) {
            const language = document.documentElement.lang || 'en';
            let beverageName = '';
            
            switch(type) {
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
                    beverageName = type;
            }
            
            beverageTypeDisplay.textContent = beverageName;
        }
        
        // Enable the continue button
        if (continueTypeBtn) {
            continueTypeBtn.disabled = false;
        }
        
        // Save state
        saveState();
    }
    
    function selectSize(size) {
        // Update selected size
        selectedSize = size;
        
        // Update UI
        if (beverageSizeOptions) {
            beverageSizeOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.size === size) {
                    option.classList.add('selected');
                }
            });
        }
        
        // Enable the add to cart button
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
        }
        
        // Save state
        saveState();
    }
    
    function updateQuantityDisplay() {
        if (quantityInput) {
            quantityInput.value = currentQuantity;
        }
    }
    
    function increaseQuantity() {
        currentQuantity++;
        updateQuantityDisplay();
    }
    
    function decreaseQuantity() {
        if (currentQuantity > 1) {
            currentQuantity--;
            updateQuantityDisplay();
        }
    }
    
    function addToCart() {
        if (!selectedBeverage || !selectedSize) return;
        
        // Calculate the price
        const price = calculatePrice(selectedBeverage, selectedSize) * currentQuantity;
        
        // Add to cart
        cartItems.push({
            beverage: selectedBeverage,
            size: selectedSize,
            quantity: currentQuantity,
            price: price
        });
        
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
        }
    }
    
    function calculatePrice(beverage, size) {
        // Base prices
        const basePrice = {
            beer: 2.50,
            kofola: 1.80,
            birel: 2.20
        };
        
        // Size multipliers
        const sizeMultiplier = {
            '300': 1,
            '500': 1.6
        };
        
        // Calculate and return the price
        return basePrice[beverage] * sizeMultiplier[size];
    }
    
    function updateCartCount() {
        // Calculate total items
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        
        // Update cart count badge
        if (cartCount) {
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartCount.classList.remove('d-none');
                if (cartIconContainer) cartIconContainer.classList.add('has-items');
            } else {
                cartCount.classList.add('d-none');
                if (cartIconContainer) cartIconContainer.classList.remove('has-items');
            }
        }
        
        // Update checkout button state
        if (checkoutBtn) {
            checkoutBtn.disabled = totalItems === 0;
        }
    }
    
    function updateCartDisplay() {
        if (!cartItemsContainer) return;
        
        // Clear existing items
        cartItemsContainer.innerHTML = '';
        
        // Check if cart is empty
        if (cartItems.length === 0) {
            if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
            if (cartTotalItems) cartTotalItems.textContent = '0';
            if (cartTotal) cartTotal.textContent = '€0.00';
            return;
        }
        
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
            
            // Item HTML
            itemCard.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title">${beverageName}</h5>
                            <p class="card-text text-muted">
                                ${item.size} ml × ${item.quantity}
                            </p>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="fw-bold me-3">€${item.price.toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemCard);
            
            // Add event listener to remove button
            const removeButton = itemCard.querySelector('.remove-item');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    removeFromCart(index);
                });
            }
        });
        
        // Update totals
        if (cartTotalItems) cartTotalItems.textContent = totalItems;
        if (cartTotal) cartTotal.textContent = `€${totalPrice.toFixed(2)}`;
    }
    
    function removeFromCart(index) {
        // Remove the item at the specified index
        cartItems.splice(index, 1);
        
        // Update cart display
        updateCartDisplay();
        
        // Update cart count
        updateCartCount();
        
        // Save state
        saveState();
    }
    
    function restoreState() {
        // Try to restore state from sessionStorage
        try {
            const savedCart = sessionStorage.getItem('cartItems');
            if (savedCart) {
                cartItems = JSON.parse(savedCart);
                updateCartDisplay();
                updateCartCount();
            }
            
            const savedScreen = sessionStorage.getItem('currentScreen');
            if (savedScreen) {
                showScreen(savedScreen);
                
                // Update progress bar
                let step = 'selection';
                if (savedScreen === 'shopping-cart') step = 'cart';
                else if (savedScreen === 'age-verification') step = 'verification';
                else if (savedScreen === 'payment-screen') step = 'payment';
                else if (savedScreen === 'dispensing-screen') step = 'dispensing';
                else if (savedScreen === 'order-complete-screen') step = 'pickup';
                
                updateProgressBar(step);
            }
        } catch (error) {
            console.error('Error restoring state:', error);
        }
    }
    
    function saveState() {
        // Save state to sessionStorage
        try {
            sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
            const currentScreen = getCurrentScreen();
            if (currentScreen) {
                sessionStorage.setItem('currentScreen', currentScreen);
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }
    
    function getCurrentScreen() {
        if (!bevTypeSelectionScreen || !sizeSelectionScreen || !cartScreen || 
            !verificationScreen || !paymentScreen || !dispensingScreen || !orderCompleteScreen) {
            return null;
        }
        
        if (!bevTypeSelectionScreen.classList.contains('d-none')) return 'beverage-type-selection';
        if (!sizeSelectionScreen.classList.contains('d-none')) return 'beverage-size-selection';
        if (!cartScreen.classList.contains('d-none')) return 'shopping-cart';
        if (!verificationScreen.classList.contains('d-none')) return 'age-verification';
        if (!paymentScreen.classList.contains('d-none')) return 'payment-screen';
        if (!dispensingScreen.classList.contains('d-none')) return 'dispensing-screen';
        if (!orderCompleteScreen.classList.contains('d-none')) return 'order-complete-screen';
        
        return null;
    }
    
    function showScreen(screenName) {
        // Hide all screens
        const screens = [
            bevTypeSelectionScreen,
            sizeSelectionScreen,
            cartScreen,
            verificationScreen,
            paymentScreen,
            dispensingScreen,
            orderCompleteScreen
        ];
        
        screens.forEach(screen => {
            if (screen) screen.classList.add('d-none');
        });
        
        // Show the requested screen
        let screenToShow = null;
        
        switch(screenName) {
            case 'beverage-type-selection':
                screenToShow = bevTypeSelectionScreen;
                updateProgressBar('selection');
                break;
            case 'beverage-size-selection':
                screenToShow = sizeSelectionScreen;
                updateProgressBar('selection');
                break;
            case 'shopping-cart':
                screenToShow = cartScreen;
                updateCartDisplay(); // Refresh cart contents
                updateProgressBar('cart');
                break;
            case 'age-verification':
                screenToShow = verificationScreen;
                updateProgressBar('verification');
                break;
            case 'payment-screen':
                screenToShow = paymentScreen;
                updatePaymentSummary(); // Refresh payment summary
                updateProgressBar('payment');
                break;
            case 'dispensing-screen':
                screenToShow = dispensingScreen;
                updateProgressBar('dispensing');
                break;
            case 'order-complete-screen':
                screenToShow = orderCompleteScreen;
                updateProgressBar('pickup');
                break;
        }
        
        if (screenToShow) {
            screenToShow.classList.remove('d-none');
            saveState();
        }
    }
    
    function updateProgressBar(currentStep) {
        if (!progressContainer) return;
        
        // Define steps
        const steps = [
            { id: 'selection', element: stepSelection },
            { id: 'cart', element: stepCart },
            { id: 'verification', element: stepVerification },
            { id: 'payment', element: stepPayment },
            { id: 'dispensing', element: stepDispensing },
            { id: 'pickup', element: stepPickup }
        ];
        
        // Find current step index
        const currentIndex = steps.findIndex(step => step.id === currentStep);
        if (currentIndex === -1) return;
        
        // Update classes for each step
        steps.forEach((step, index) => {
            if (!step.element) return;
            
            // Remove existing classes
            step.element.classList.remove('active', 'completed');
            
            // Set appropriate class
            if (index < currentIndex) {
                step.element.classList.add('completed');
            } else if (index === currentIndex) {
                step.element.classList.add('active');
            }
        });
    }
    
    function displayMessage(message, type = 'info') {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        messageContainer.style.zIndex = '5';
        
        const messageElement = document.createElement('div');
        messageElement.className = `toast align-items-center border-0 bg-${type}`;
        messageElement.setAttribute('role', 'alert');
        messageElement.setAttribute('aria-live', 'assertive');
        messageElement.setAttribute('aria-atomic', 'true');
        
        messageElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body text-white">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        document.body.appendChild(messageContainer);
        messageContainer.appendChild(messageElement);
        
        // Show the message
        messageElement.classList.add('show');
        
        // Auto-hide after a delay
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => {
                messageContainer.removeChild(messageElement);
            }, 300);
        }, 5000);
    }
    
    // Manage webcam
    function startWebcam() {
        if (webcamVideo) {
            // Hide previous results if any
            if (webcamResult) {
                webcamResult.classList.add("d-none");
                webcamResult.innerHTML = "";
            }
            
            // Reset verification retry count
            verificationRetryCount = 0;
            capturedImage = null;
            
            // Hide the start button and show the video
            if (webcamStartBtn) webcamStartBtn.classList.add("d-none");
            webcamVideo.classList.remove("d-none");
            
            // Show the capture button
            if (webcamCaptureBtn) webcamCaptureBtn.classList.remove("d-none");
            
            // Initialize webcam
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoStream = stream;
                    webcamVideo.srcObject = stream;
                    webcamActive = true;
                })
                .catch(error => {
                    console.error("Webcam error:", error);
                    showWebcamError(error.message);
                });
        }
    }
    
    function stopWebcam() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        
        if (webcamVideo) {
            webcamVideo.srcObject = null;
            webcamVideo.classList.add('d-none');
        }
        
        // Show the start button again
        if (webcamStartBtn) webcamStartBtn.classList.remove('d-none');
        
        // Hide the capture button
        if (webcamCaptureBtn) webcamCaptureBtn.classList.add('d-none');
        
        webcamActive = false;
    }
    
    function captureWebcamImage() {
        if (!webcamActive || !webcamVideo || !webcamCanvas) return;
        
        // Hide any previous result
        if (webcamResult) webcamResult.innerHTML = '';
        
        // Set canvas dimensions to match video
        webcamCanvas.width = webcamVideo.videoWidth;
        webcamCanvas.height = webcamVideo.videoHeight;
        
        // Draw video frame to canvas
        const context = webcamCanvas.getContext('2d');
        context.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
        
        // Get image from canvas as data URL
        capturedImage = webcamCanvas.toDataURL('image/jpeg');
        
        // Stop the webcam
        stopWebcam();
        
        // Show the result container
        if (webcamResult) webcamResult.classList.remove('d-none');
        
        // Show loading indicator in result container
        const language = document.documentElement.lang || 'en';
        webcamResult.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>${language === 'sk' ? 'Prebieha overovanie veku...' : 'Verifying age...'}</p>
            </div>
        `;
        
        // Proceed to verification after a short delay
        setTimeout(() => sendImageForVerification(capturedImage), 500);
    }
    
    function resetWebcam() {
        // Hide result
        if (webcamResult) {
            webcamResult.classList.add('d-none');
            webcamResult.innerHTML = '';
        }
        
        // Reset the verification retry count
        verificationRetryCount = 0;
        
        // Show video container
        if (webcamVerification) webcamVerification.classList.remove('d-none');
        
        // Start webcam again
        startWebcam();
    }
    
    function showWebcamError(message) {
        if (webcamVideo) webcamVideo.classList.add('d-none');
        if (webcamStartBtn) webcamStartBtn.classList.add('d-none');
        if (webcamCaptureBtn) webcamCaptureBtn.classList.add('d-none');
        
        const language = document.documentElement.lang || 'en';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <h5 class="alert-heading">${language === 'sk' ? 'Chyba kamery' : 'Camera Error'}</h5>
            <p>${message}</p>
            <hr>
            <p class="mb-0">${language === 'sk' ? 'Skúste povoliť prístup ku kamere alebo použiť iný spôsob overenia.' : 'Try allowing camera access or use another verification method.'}</p>
        `;
        
        if (webcamVerification) {
            // Clear and append error
            webcamVerification.querySelectorAll('.alert-danger').forEach(el => el.remove());
            webcamVerification.prepend(errorDiv);
        }
    }
    
    
    function sendImageForVerification(imageDataURL, isRetry = false) {
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
            showScreen("payment-screen");
            return;
        }
        
        // Store the current image for potential retries
        if (!isRetry) {
            currentVerificationImage = imageDataURL;
            verificationRetryCount = 0;
        }
        
        // Update UI to show retries if applicable
        if (webcamResult && isRetry) {
            const language = document.documentElement.lang || 'en';
            webcamResult.innerHTML = `
                <div class="alert alert-info mb-3">
                    <h5 class="alert-heading">${language === 'sk' ? 'Prebieha overenie' : 'Verification in Progress'}</h5>
                    <p class="mb-0">${language === 'sk' ? 
                        `Opakujem pokus o overenie (${verificationRetryCount}/${MAX_VERIFICATION_RETRIES})...` : 
                        `Retrying verification (${verificationRetryCount}/${MAX_VERIFICATION_RETRIES})...`}</p>
                    <div class="progress mt-2">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             role="progressbar" style="width: 100%"></div>
                    </div>
                </div>
            `;
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
                    
                    // If verification failed but we have retries remaining, try again automatically
                    if (!isVerified && verificationRetryCount < MAX_VERIFICATION_RETRIES) {
                        verificationRetryCount++;
                        console.log(`Verification failed. Retrying (${verificationRetryCount}/${MAX_VERIFICATION_RETRIES})...`);
                        
                        // Show retry message
                        webcamResult.innerHTML = `
                            <div class="alert alert-warning mb-3">
                                <h5 class="alert-heading">${language === 'sk' ? 'Overenie zlyhalo' : 'Verification Failed'}</h5>
                                <p class="mb-0">${language === 'sk' ? 
                                    `Prebieha automatické opakovanie (${verificationRetryCount}/${MAX_VERIFICATION_RETRIES})...` : 
                                    `Automatic retry in progress (${verificationRetryCount}/${MAX_VERIFICATION_RETRIES})...`}</p>
                                <div class="progress mt-2">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                                         role="progressbar" style="width: 100%"></div>
                                </div>
                            </div>
                        `;
                        
                        // Retry after a short delay
                        setTimeout(() => {
                            sendImageForVerification(currentVerificationImage, true);
                        }, 1000);
                        return;
                    }
                    
                    // Display final result after all retries or successful verification
                    const message = data.message || (isVerified ? 
                        (language === 'sk' ? 'Overenie veku úspešné!' : 'Age verification successful!') : 
                        (language === 'sk' ? 'Overenie veku zlyhalo. Skúste znova alebo použite iný spôsob overenia.' : 'Age verification failed. Try again or use another verification method.'));
                    
                    let retryInfo = '';
                    if (verificationRetryCount > 0) {
                        retryInfo = `<p class="text-muted small">${language === 'sk' ? 
                            `(Úspešne po ${verificationRetryCount} pokusoch)` : 
                            `(Successful after ${verificationRetryCount} retries)`}</p>`;
                    }
                    
                    webcamResult.innerHTML = `
                        <div class="alert alert-${isVerified ? 'success' : 'danger'} mb-3">
                            <h5 class="alert-heading">${isVerified ? 
                                (language === 'sk' ? 'Overenie úspešné' : 'Verification Successful') : 
                                (language === 'sk' ? 'Overenie zlyhalo' : 'Verification Failed')}</h5>
                            <p>${message}</p>
                            ${retryInfo}
                        </div>
                        
                        <div class="d-grid gap-2">
                            ${isVerified ? `
                                <button class="btn btn-primary btn-lg" id="proceed-to-payment-btn">
                                    ${language === 'sk' ? 'Pokračovať k platbe' : 'Proceed to Payment'}
                                    <i class="fas fa-chevron-right ms-2"></i>
                                </button>
                            ` : `
                                <button class="btn btn-primary btn-lg" id="retry-verification-btn">
                                    <i class="fas fa-redo me-2"></i>
                                    ${language === 'sk' ? 'Skúsiť znova' : 'Try Again'}
                                </button>
                            `}
                            
                            <button class="btn btn-outline-secondary btn-lg" id="change-method-btn">
                                <i class="fas fa-exchange-alt me-2"></i>
                                ${language === 'sk' ? 'Zmeniť spôsob overenia' : 'Change Verification Method'}
                            </button>
                        </div>
                    `;
                    
                    // Add event listeners to the buttons
                    const proceedBtn = document.getElementById('proceed-to-payment-btn');
                    const retryBtn = document.getElementById('retry-verification-btn');
                    const changeBtn = document.getElementById('change-method-btn');
                    
                    if (proceedBtn) {
                        proceedBtn.addEventListener('click', () => {
                            showScreen('payment-screen');
                        });
                    }
                    
                    if (retryBtn) {
                        retryBtn.addEventListener('click', resetWebcam);
                    }
                    
                    if (changeBtn) {
                        changeBtn.addEventListener('click', () => {
                            // Show verification methods
                            if (verificationMethods) verificationMethods.classList.remove('d-none');
                            if (webcamVerification) webcamVerification.classList.add('d-none');
                            if (webcamResult) {
                                webcamResult.classList.add('d-none');
                                webcamResult.innerHTML = '';
                            }
                            
                            // Reset webcam and verification state
                            stopWebcam();
                            verificationRetryCount = 0;
                        });
                    }
                } else {
                    // Error handling
                    webcamResult.innerHTML = `
                        <div class="alert alert-danger mb-3">
                            <h5 class="alert-heading">${language === 'sk' ? 'Chyba overenia' : 'Verification Error'}</h5>
                            <p>${data.message || (language === 'sk' ? 'Nastala neočakávaná chyba pri overovaní. Skúste znova.' : 'An unexpected error occurred during verification. Please try again.')}</p>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary btn-lg" id="retry-verification-btn">
                                <i class="fas fa-redo me-2"></i>
                                ${language === 'sk' ? 'Skúsiť znova' : 'Try Again'}
                            </button>
                            
                            <button class="btn btn-outline-secondary btn-lg" id="change-method-btn">
                                <i class="fas fa-exchange-alt me-2"></i>
                                ${language === 'sk' ? 'Zmeniť spôsob overenia' : 'Change Verification Method'}
                            </button>
                        </div>
                    `;
                    
                    // Add event listeners
                    const retryBtn = document.getElementById('retry-verification-btn');
                    const changeBtn = document.getElementById('change-method-btn');
                    
                    if (retryBtn) {
                        retryBtn.addEventListener('click', resetWebcam);
                    }
                    
                    if (changeBtn) {
                        changeBtn.addEventListener('click', () => {
                            // Show verification methods
                            if (verificationMethods) verificationMethods.classList.remove('d-none');
                            if (webcamVerification) webcamVerification.classList.add('d-none');
                            if (webcamResult) {
                                webcamResult.classList.add('d-none');
                                webcamResult.innerHTML = '';
                            }
                            
                            // Reset webcam and verification state
                            stopWebcam();
                            verificationRetryCount = 0;
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
                        <p>${language === 'sk' ? 'Nastala chyba pri pripojení k serveru. Skontrolujte pripojenie a skúste znova.' : 'A connection error occurred. Check your connection and try again.'}</p>
                        <p class="small text-muted mt-2">${error.message}</p>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary btn-lg" id="retry-verification-btn">
                            <i class="fas fa-redo me-2"></i>
                            ${language === 'sk' ? 'Skúsiť znova' : 'Try Again'}
                        </button>
                        
                        <button class="btn btn-outline-secondary btn-lg" id="change-method-btn">
                            <i class="fas fa-exchange-alt me-2"></i>
                            ${language === 'sk' ? 'Zmeniť spôsob overenia' : 'Change Verification Method'}
                        </button>
                    </div>
                `;
                
                // Add event listeners
                const retryBtn = document.getElementById('retry-verification-btn');
                const changeBtn = document.getElementById('change-method-btn');
                
                if (retryBtn) {
                    retryBtn.addEventListener('click', resetWebcam);
                }
                
                if (changeBtn) {
                    changeBtn.addEventListener('click', () => {
                        // Show verification methods
                        if (verificationMethods) verificationMethods.classList.remove('d-none');
                        if (webcamVerification) webcamVerification.classList.add('d-none');
                        if (webcamResult) {
                            webcamResult.classList.add('d-none');
                            webcamResult.innerHTML = '';
                        }
                        
                        // Reset webcam and verification state
                        stopWebcam();
                        verificationRetryCount = 0;
                    });
                }
            }
        });
    }
    
    function startDispensing() {
        // Store current cart items in session data for the server
        saveStateToServer();
        
        // Show dispensing screen
        showScreen('dispensing-screen');
        
        // Start the actual dispensing process via API
        fetch('/api/start_dispensing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cartItems
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Start monitoring the dispensing progress
                monitorOrderProgress();
            } else {
                displayMessage(
                    data.message || 'An error occurred while starting the dispensing process.', 
                    'danger'
                );
            }
        })
        .catch(error => {
            console.error('Error starting dispensing:', error);
            displayMessage('An error occurred while communicating with the server.', 'danger');
        });
    }
    
    function saveStateToServer() {
        fetch('/api/save_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cart_items: cartItems,
                screen: getCurrentScreen()
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.warn('Failed to save state to server:', data.message);
            }
        })
        .catch(error => {
            console.error('Error saving state to server:', error);
        });
    }
    
    function monitorOrderProgress() {
        // Clear any existing interval
        if (dispensingMonitorInterval) {
            clearInterval(dispensingMonitorInterval);
        }
        
        // Set up status monitoring
        dispensingMonitorInterval = setInterval(() => {
            fetch('/api/dispense_status')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateDispenseUI(data);
                        
                        // Check if dispensing is complete
                        if (data.status === 'complete') {
                            // Show the order complete screen
                            showOrderComplete();
                            
                            // Clear the interval
                            clearInterval(dispensingMonitorInterval);
                            dispensingMonitorInterval = null;
                        } else if (data.status === 'error') {
                            // Handle error in dispensing
                            displayMessage(
                                data.message || 'An error occurred during the dispensing process.', 
                                'danger'
                            );
                            
                            // Clear the interval
                            clearInterval(dispensingMonitorInterval);
                            dispensingMonitorInterval = null;
                        }
                    } else {
                        console.error('Error checking dispense status:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error monitoring dispensing:', error);
                });
        }, 1000); // Check every second
    }
    
    function updateDispenseUI(data) {
        // Get dispensing progress elements
        const statusElement = document.getElementById('dispensing-status');
        const progressBar = document.getElementById('dispensing-progress');
        const progressText = document.getElementById('dispensing-progress-text');
        
        if (!statusElement || !progressBar || !progressText) return;
        
        // Update the status message
        const language = document.documentElement.lang || 'en';
        let statusMessage = '';
        
        switch(data.step) {
            case 'idle':
                statusMessage = language === 'sk' ? 'Čakám na začiatok...' : 'Waiting to start...';
                break;
            case 'dispensing_cup':
                statusMessage = language === 'sk' ? 'Pripravujem pohár...' : 'Dispensing cup...';
                break;
            case 'pouring_beverage':
                statusMessage = language === 'sk' ? 'Nalievam nápoj...' : 'Pouring beverage...';
                break;
            case 'delivering_cup':
                statusMessage = language === 'sk' ? 'Doručujem pohár...' : 'Delivering cup...';
                break;
            case 'complete':
                statusMessage = language === 'sk' ? 'Hotovo!' : 'Complete!';
                break;
            case 'error':
                statusMessage = language === 'sk' ? 'Nastala chyba' : 'An error occurred';
                break;
            default:
                statusMessage = data.step;
        }
        
        statusElement.textContent = statusMessage;
        
        // Update progress percentage
        let progressPercent = data.progress || 0;
        progressBar.style.width = `${progressPercent}%`;
        progressBar.setAttribute('aria-valuenow', progressPercent);
        progressText.textContent = `${progressPercent}%`;
        
        // Set color based on status
        if (data.status === 'error') {
            progressBar.classList.remove('bg-primary', 'bg-success');
            progressBar.classList.add('bg-danger');
        } else if (data.status === 'complete') {
            progressBar.classList.remove('bg-primary', 'bg-danger');
            progressBar.classList.add('bg-success');
        } else {
            progressBar.classList.remove('bg-success', 'bg-danger');
            progressBar.classList.add('bg-primary');
        }
    }
    
    function showOrderComplete() {
        // Show the order complete screen
        showScreen('order-complete-screen');
        
        // Clear cart after successful order
        cartItems = [];
        updateCartDisplay();
        updateCartCount();
        saveState();
        
        // Set a timeout to return to the beverage selection screen after some time
        setTimeout(() => {
            // Only reset if we're still on the complete screen
            if (getCurrentScreen() === 'order-complete-screen') {
                showScreen('beverage-type-selection');
            }
        }, 15000); // 15 seconds
    }
    
    // Initialize the UI when the DOM is loaded
    initializeUI();
});
