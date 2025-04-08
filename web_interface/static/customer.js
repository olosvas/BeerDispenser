/* customer.js - JavaScript for the beverage dispensing customer interface */

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing customer interface');
    
    // Screens
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
    
    // Customer interface global state variables
    const cartItems = [];
    let selectedBeverage = null;
    let selectedSize = null;
    let currentQuantity = 1;
    let beveragesRequiringVerification = ['beer', 'birel']; // Types that require age verification

    // DOM element references
    const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
    const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
    const beverageTypeDisplay = document.getElementById('beverage-type-display');
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const continueShopping = document.getElementById('continue-shopping-btn');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotalItems = document.getElementById('cart-total-items');
    const orderProgress = document.getElementById('order-progress');
    const messageContainer = document.getElementById('message-container');
    
    // Quantity controls
    const quantityInput = document.querySelector('.quantity-input');
    const increaseQuantityBtn = document.querySelector('.inc-quantity');
    const decreaseQuantityBtn = document.querySelector('.dec-quantity');
    const quickQuantityBtns = document.querySelectorAll('.quick-quantity-btn');

    // Age verification elements
    const verificationMethods = document.getElementById('verification-methods');
    const webcamVerification = document.getElementById('webcam-verification');
    const webcamVerifyBtn = document.getElementById('webcam-verify-btn');
    const webcamContainer = document.getElementById('webcam-container');
    const webcamFeed = document.getElementById('webcam-video');
    const capturedImage = document.getElementById('captured-image');
    const webcamStartBtn = document.getElementById('webcam-start-btn');
    const webcamCaptureBtn = document.getElementById('webcam-capture-btn');
    const webcamBackBtn = document.getElementById('webcam-back-btn');
    const captureResult = document.getElementById('webcam-result');
    const webcamRetryBtn = document.getElementById('webcam-retry-btn');
    const webcamUseBtn = document.getElementById('webcam-use-btn');

    // Payment elements
    const paymentTotal = document.getElementById('payment-total');
    const paymentItems = document.getElementById('payment-items');
    const startPaymentBtn = document.getElementById('start-payment-btn');

    // Screen elements
    const screens = document.querySelectorAll('.screen');

    // Webcam
    let webcamStream = null;

    // Log DOM element references for debugging
    console.log('DOM Elements:');
    console.log('beverageTypeOptions:', beverageTypeOptions ? beverageTypeOptions.length : 'not found');
    console.log('beverageSizeOptions:', beverageSizeOptions ? beverageSizeOptions.length : 'not found');
    console.log('continueTypeBtn:', continueTypeBtn ? 'found' : 'not found');
    console.log('backToTypeBtn:', backToTypeBtn ? 'found' : 'not found');
    console.log('addToCartBtn:', addToCartBtn ? 'found' : 'not found');
    console.log('viewCartBtn:', viewCartBtn ? 'found' : 'not found');
    console.log('viewCartFromSizeBtn:', viewCartFromSizeBtn ? 'found' : 'not found');
    console.log('checkoutBtn:', checkoutBtn ? 'found' : 'not found');
    console.log('continueShopping:', continueShopping ? 'found' : 'not found');
    console.log('quantityInput:', quantityInput ? 'found' : 'not found');
    console.log('increaseQuantityBtn:', increaseQuantityBtn ? 'found' : 'not found');
    console.log('decreaseQuantityBtn:', decreaseQuantityBtn ? 'found' : 'not found');
    console.log('cartCount:', cartCount ? 'found' : 'not found');
    console.log('cartItemsContainer:', cartItemsContainer ? 'found' : 'not found');
    console.log('cartTotalPrice:', cartTotalPrice ? 'found' : 'not found');

    // Initialize the UI
    initializeUI();
    attachEventListeners();
    restoreState();
    
    // Show the initial screen
    showScreen('selection-screen');
    
    function initializeUI() {
        console.log('Initializing UI elements');
        // Set up event listeners for beverage type selection
        if (beverageTypeOptions) {
            beverageTypeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const type = option.dataset.type;
                    console.log('Beverage type clicked:', type);
                    selectBeverage(type);
                });
            });
        }
        
        // Set up event listeners for beverage size selection
        if (beverageSizeOptions) {
            beverageSizeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const size = option.dataset.size;
                    console.log('Beverage size clicked:', size);
                    selectSize(size);
                });
            });
        }
        
        // Set up event listeners for quantity control
        if (increaseQuantityBtn) {
            increaseQuantityBtn.addEventListener('click', increaseQuantity);
        }
        
        if (decreaseQuantityBtn) {
            decreaseQuantityBtn.addEventListener('click', decreaseQuantity);
        }
        
        // Set up quick quantity buttons
        if (quickQuantityBtns) {
            quickQuantityBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const qty = parseInt(btn.dataset.quantity, 10);
                    currentQuantity = qty;
                    updateQuantityDisplay();
                });
            });
        }
        
        // Initial quantity display
        updateQuantityDisplay();
    }
    
    function attachEventListeners() {
        console.log('Attaching event listeners');
        // Button event listeners
        if (continueTypeBtn) {
            continueTypeBtn.addEventListener('click', () => {
                console.log('Continue to size button clicked');
                if (selectedBeverage) {
                    showScreen('beverage-size-selection');
                }
            });
        } else {
            console.error('continueTypeBtn not found');
        }
        
        if (backToTypeBtn) {
            backToTypeBtn.addEventListener('click', () => {
                console.log('Back to type button clicked');
                showScreen('selection-screen');
            });
        }
        
        if (addToCartBtn) {
            console.log('Adding click event to addToCartBtn');
            addToCartBtn.addEventListener('click', function() {
                console.log('Add to cart button clicked');
                addToCart();
            });
        } else {
            console.error('addToCartBtn element not found');
        }
        
        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                console.log('View cart button clicked');
                showScreen('shopping-cart');
            });
        }
        
        if (viewCartFromSizeBtn) {
            viewCartFromSizeBtn.addEventListener('click', () => {
                console.log('View cart from size button clicked');
                showScreen('shopping-cart');
            });
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                console.log('Checkout button clicked');
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
                console.log('Continue shopping button clicked');
                showScreen('selection-screen');
            });
        }
        
        // Age verification controls
        if (webcamVerifyBtn) {
            webcamVerifyBtn.addEventListener('click', () => {
                console.log('Webcam verify button clicked');
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
                console.log('Webcam back button clicked');
                stopWebcam();
                if (verificationMethods) verificationMethods.classList.remove('d-none');
                if (webcamVerification) webcamVerification.classList.add('d-none');
            });
        }
        
        if (webcamRetryBtn) {
            webcamRetryBtn.addEventListener('click', resetWebcam);
        }
        
        if (webcamUseBtn) {
            webcamUseBtn.addEventListener('click', () => {
                console.log('Using captured image for verification');
                if (capturedImage && capturedImage.src) {
                    sendImageForVerification(capturedImage.src);
                } else {
                    console.error('No captured image available');
                    displayMessage('No captured image available', 'error');
                }
            });
        }
        
        if (startPaymentBtn) {
            startPaymentBtn.addEventListener('click', startDispensing);
        }
    }
    
    function selectBeverage(type) {
        console.log('selectBeverage called with type:', type);
        // Update selected beverage
        selectedBeverage = type;
        console.log('selectedBeverage set to:', selectedBeverage);
        
        // Update UI
        if (beverageTypeOptions) {
            beverageTypeOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.type === type) {
                    option.classList.add('selected');
                }
            });
        } else {
            console.error('beverageTypeOptions not found');
        }
        
        // Update the beverage type display
        if (beverageTypeDisplay) {
            const displayName = type === 'beer' ? (document.documentElement.lang === 'sk' ? 'Pivo' : 'Beer') :
                               type === 'kofola' ? 'Kofola' :
                               type === 'birel' ? 'Birel' : type;
            beverageTypeDisplay.textContent = displayName;
        }
        
        // Enable the continue button
        if (continueTypeBtn) {
            continueTypeBtn.disabled = false;
            console.log('continueTypeBtn enabled');
        } else {
            console.error('continueTypeBtn not found');
        }
    }
    
    function selectSize(size) {
        console.log('selectSize called with size:', size);
        // Update selected size
        selectedSize = size;
        console.log('selectedSize set to:', selectedSize);
        
        // Update UI
        if (beverageSizeOptions) {
            beverageSizeOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.size === size) {
                    option.classList.add('selected');
                }
            });
        } else {
            console.error('beverageSizeOptions not found');
        }
        
        // Enable the add to cart button
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
            console.log('addToCartBtn enabled');
        } else {
            console.error('addToCartBtn not found');
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
        console.log('Increasing quantity');
        if (currentQuantity < 10) {
            currentQuantity++;
            updateQuantityDisplay();
        }
    }
    
    function decreaseQuantity() {
        console.log('Decreasing quantity');
        if (currentQuantity > 1) {
            currentQuantity--;
            updateQuantityDisplay();
        }
    }
    
    function addToCart() {
        console.log('addToCart function called');
        console.log('selectedBeverage:', selectedBeverage);
        console.log('selectedSize:', selectedSize);
        
        if (!selectedBeverage || !selectedSize) {
            console.error('Missing beverage or size selection');
            return;
        }
        
        // Calculate the price
        const price = calculatePrice(selectedBeverage, selectedSize) * currentQuantity;
        console.log('Price calculated:', price);
        
        // Add to cart
        cartItems.push({
            beverage: selectedBeverage,
            size: selectedSize,
            quantity: currentQuantity,
            price: price
        });
        console.log('Item added to cart. New cart:', JSON.stringify(cartItems));
        
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
            console.log('addToCartBtn disabled after adding item');
        } else {
            console.error('addToCartBtn not found when trying to disable it');
        }
        
        // Show the view cart button
        if (viewCartFromSizeBtn) {
            viewCartFromSizeBtn.classList.remove('d-none');
            console.log('viewCartFromSizeBtn shown');
        } else {
            console.error('viewCartFromSizeBtn not found');
        }
    }
    
    function calculatePrice(beverage, size) {
        // Base prices
        const basePrice = {
            'beer': {'300': 2.50, '500': 3.80},
            'kofola': {'300': 1.50, '500': 2.20},
            'birel': {'300': 2.20, '500': 3.50}
        };
        
        return basePrice[beverage][size] || 0;
    }
    
    function updateCartCount() {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            // Show cart icon if there are items
            document.getElementById('cart-icon-container').classList.toggle('d-none', totalItems === 0);
        }
        
        if (cartTotalItems) {
            cartTotalItems.textContent = totalItems;
        }
    }
    
    function updateCartDisplay() {
        console.log('Updating cart display');
        
        if (!cartItemsContainer) {
            console.error('Cart items container element not found');
            return;
        }
        
        // Clear existing items
        cartItemsContainer.innerHTML = '';
        
        // Toggle empty cart message
        if (emptyCartMessage) {
            emptyCartMessage.classList.toggle('d-none', cartItems.length > 0);
        }
        
        // Update checkout button state
        if (checkoutBtn) {
            checkoutBtn.disabled = cartItems.length === 0;
        }
        
        if (cartItems.length === 0) {
            console.log('Cart is empty, nothing to display');
            return;
        }
        
        let totalPrice = 0;
        
        // Add each item to the display
        cartItems.forEach((item, index) => {
            const itemRow = document.createElement('div');
            itemRow.className = 'card mb-3';
            
            // Determine beverage name based on type
            const bevName = item.beverage === 'beer' ? (document.documentElement.lang === 'sk' ? 'Pivo' : 'Beer') :
                           item.beverage === 'kofola' ? 'Kofola' :
                           item.beverage === 'birel' ? 'Birel' : item.beverage;
            
            // Determine size name based on value
            const sizeName = item.size === '300' ? '300ml' : '500ml';
            
            itemRow.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">${bevName} ${sizeName}</h5>
                            <p class="text-muted mb-0">${document.documentElement.lang === 'sk' ? 'Množstvo' : 'Quantity'}: ${item.quantity}</p>
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
            
            cartItemsContainer.appendChild(itemRow);
            
            // Add event listener to the remove button
            const removeBtn = itemRow.querySelector('.remove-item');
            removeBtn.addEventListener('click', () => removeFromCart(index));
            
            totalPrice += item.price;
        });
        
        // Update total price
        if (cartTotalPrice) {
            cartTotalPrice.textContent = `€${totalPrice.toFixed(2)}`;
        }
        
        // Update payment screen items if it exists
        if (paymentItems) {
            paymentItems.innerHTML = '';
            
            cartItems.forEach(item => {
                const bevName = item.beverage === 'beer' ? (document.documentElement.lang === 'sk' ? 'Pivo' : 'Beer') :
                               item.beverage === 'kofola' ? 'Kofola' :
                               item.beverage === 'birel' ? 'Birel' : item.beverage;
                
                const sizeName = item.size === '300' ? '300ml' : '500ml';
                
                const paymentItem = document.createElement('div');
                paymentItem.className = 'd-flex justify-content-between mb-2';
                paymentItem.innerHTML = `
                    <span>${bevName} ${sizeName} x ${item.quantity}</span>
                    <span>€${item.price.toFixed(2)}</span>
                `;
                
                paymentItems.appendChild(paymentItem);
            });
        }
        
        // Update payment total if it exists
        if (paymentTotal) {
            paymentTotal.textContent = `€${totalPrice.toFixed(2)}`;
        }
    }
    
    function removeFromCart(index) {
        console.log('Removing item from cart at index:', index);
        
        if (index < 0 || index >= cartItems.length) {
            console.error('Invalid index for cart removal:', index);
            return;
        }
        
        // Remove the item
        cartItems.splice(index, 1);
        
        // Update UI
        updateCartCount();
        updateCartDisplay();
        
        // Save updated cart
        saveState();
        
        // Show feedback
        const language = document.documentElement.lang || 'en';
        displayMessage(
            language === 'sk' ? 'Položka odstránená z košíka' : 'Item removed from cart', 
            'info'
        );
    }
    
    function restoreState() {
        console.log('Restoring state from local storage');
        try {
            const savedState = localStorage.getItem('beverageSystemState');
            
            if (savedState) {
                const state = JSON.parse(savedState);
                
                if (state.cartItems && Array.isArray(state.cartItems)) {
                    // Copy saved cart items to our cart
                    cartItems.length = 0; // Clear current cart
                    state.cartItems.forEach(item => cartItems.push(item));
                    
                    // Update cart display
                    updateCartCount();
                    updateCartDisplay();
                }
                
                // Restore current screen if specified
                if (state.currentScreen) {
                    console.log('Restoring screen:', state.currentScreen);
                    showScreen(state.currentScreen);
                }
                
                // Restore beverage selection if on that screen
                if (state.selectedBeverage && state.currentScreen === 'beverage-type-selection') {
                    selectBeverage(state.selectedBeverage);
                }
                
                // Restore size selection if on that screen
                if (state.selectedSize && state.currentScreen === 'beverage-size-selection') {
                    selectSize(state.selectedSize);
                }
            } else {
                console.log('No saved state found');
            }
        } catch (error) {
            console.error('Error restoring state:', error);
        }
    }
    
    function saveState() {
        console.log('Saving state to local storage');
        const state = {
            cartItems: cartItems,
            selectedBeverage: selectedBeverage,
            selectedSize: selectedSize,
            currentScreen: getCurrentScreen()
        };
        
        localStorage.setItem('beverageSystemState', JSON.stringify(state));
    }
    
    function getCurrentScreen() {
        // Find the screen that's currently visible
        const visibleScreen = Array.from(document.querySelectorAll('.container:not(.d-none)')).find(screen => {
            // Only consider our main screens
            return screen.id === 'beverage-type-selection' ||
                   screen.id === 'beverage-size-selection' ||
                   screen.id === 'shopping-cart' ||
                   screen.id === 'payment-screen' ||
                   screen.id === 'age-verification' ||
                   screen.id === 'dispensing-screen' ||
                   screen.id === 'order-complete-screen';
        });
        
        return visibleScreen ? visibleScreen.id : 'beverage-type-selection';
    }
    
    function showScreen(screenName) {
        console.log('Showing screen:', screenName);
        
        // Hide all screens
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.add('d-none');
        });
        
        // Show the requested screen
        const screenToShow = document.getElementById(screenName);
        if (screenToShow) {
            screenToShow.classList.remove('d-none');
            
            // Update progress bar for the current step
            updateProgressBar(screenName);
        } else {
            console.error('Screen not found:', screenName);
        }
        
        // Save the current state
        saveState();
    }
    
    function updateProgressBar(currentStep) {
        // Map screen IDs to progress steps
        const stepMapping = {
            'selection-screen': 'selection',
            'beverage-size-selection': 'selection',
            'shopping-cart': 'cart',
            'age-verification': 'verification',
            'payment-screen': 'payment',
            'dispensing-screen': 'dispensing',
            'order-complete-screen': 'pickup'
        };
        
        const step = typeof currentStep === 'string' ? 
                    (stepMapping[currentStep] || currentStep) : 
                    currentStep;
        
        // Reset all steps
        stepSelection.classList.remove('active', 'completed');
        stepCart.classList.remove('active', 'completed');
        stepVerification.classList.remove('active', 'completed');
        stepPayment.classList.remove('active', 'completed');
        stepDispensing.classList.remove('active', 'completed');
        stepPickup.classList.remove('active', 'completed');
        
        // Reset all lines
        document.querySelectorAll('.progress-line').forEach(line => {
            line.classList.remove('active');
        });
        
        // Mark steps as active or completed based on current step
        if (step === 'selection' || step === 'cart' || step === 'verification' || 
            step === 'payment' || step === 'dispensing' || step === 'pickup') {
            stepSelection.classList.add('completed');
        }
        
        if (step === 'cart' || step === 'verification' || step === 'payment' || 
            step === 'dispensing' || step === 'pickup') {
            stepCart.classList.add('completed');
            // Activate the line between selection and cart
            document.querySelectorAll('.progress-line')[0].classList.add('active');
        }
        
        if (step === 'verification' || step === 'payment' || step === 'dispensing' || step === 'pickup') {
            stepVerification.classList.add('completed');
            // Activate the line between cart and verification
            document.querySelectorAll('.progress-line')[1].classList.add('active');
        }
        
        if (step === 'payment' || step === 'dispensing' || step === 'pickup') {
            stepPayment.classList.add('completed');
            // Activate the line between verification and payment
            document.querySelectorAll('.progress-line')[2].classList.add('active');
        }
        
        if (step === 'dispensing' || step === 'pickup') {
            stepDispensing.classList.add('completed');
            // Activate the line between payment and dispensing
            document.querySelectorAll('.progress-line')[3].classList.add('active');
        }
        
        if (step === 'pickup') {
            stepPickup.classList.add('completed');
            // Activate the line between dispensing and pickup
            document.querySelectorAll('.progress-line')[4].classList.add('active');
        }
        
        // Mark the current step as active
        if (step === 'selection') stepSelection.classList.add('active');
        if (step === 'cart') stepCart.classList.add('active');
        if (step === 'verification') stepVerification.classList.add('active');
        if (step === 'payment') stepPayment.classList.add('active');
        if (step === 'dispensing') stepDispensing.classList.add('active');
        if (step === 'pickup') stepPickup.classList.add('active');
    }
    
    function displayMessage(message, type = 'info') {
        // Create a Bootstrap toast for displaying messages
        const toast = document.createElement('div');
        toast.className = `toast message-toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000
        });
        bsToast.show();
        
        // Remove from DOM after hidden
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toast);
        });
    }
    
    function startWebcam() {
        // Hide the capture result and show webcam
        document.getElementById("webcam-result").classList.add("d-none");
        document.getElementById("webcam-verification").classList.remove("d-none");
        
        // Hide capture button until webcam is ready
        if (webcamCaptureBtn) webcamCaptureBtn.classList.add("d-none");
        
        // Hide any previous errors
        const errorElement = document.getElementById("webcam-error");
        if (errorElement) errorElement.classList.add("d-none");
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    webcamStream = stream;
                    if (webcamFeed) {
                        webcamFeed.srcObject = stream;
                        webcamFeed.play();
                        
                        // Show capture button now that webcam is ready
                        if (webcamCaptureBtn) webcamCaptureBtn.classList.remove("d-none");
                        // Hide start button
                        if (webcamStartBtn) webcamStartBtn.classList.add("d-none");
                    }
                })
                .catch(function(err) {
                    console.error("Error accessing webcam: ", err);
                    showWebcamError(document.documentElement.lang === "sk" ? 
                        "Chyba pri prístupe ku kamere. Povoľte prosím prístup ku kamere." : 
                        "Error accessing camera. Please allow camera access.");
                });
        } else {
            showWebcamError(document.documentElement.lang === "sk" ? 
                "Váš prehliadač nepodporuje prístup ku kamere." : 
                "Your browser does not support camera access.");
        }}
    
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => {
                track.stop();
            });
            webcamStream = null;
        }
    }
    
    function captureWebcamImage() {
        if (!webcamFeed || !capturedImage) {
            console.error('Webcam or captured image elements not found');
            return;
        }
        
        // Create a canvas to capture the image
        const canvas = document.createElement('canvas');
        canvas.width = webcamFeed.videoWidth;
        canvas.height = webcamFeed.videoHeight;
        
        const ctx = canvas.getContext('2d');
        // Flip horizontally to create mirror image
        ctx.scale(-1, 1);
        ctx.drawImage(webcamFeed, -canvas.width, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const imageDataURL = canvas.toDataURL('image/jpeg');
        
        // Display the captured image
        capturedImage.src = imageDataURL;
        
        // Show the image and hide the webcam
        if (webcamContainer) webcamContainer.classList.add('d-none');
        if (captureResult) captureResult.classList.remove('d-none');
    }
    
    function resetWebcam() {
        // Hide the captured image and show the webcam again
        if (webcamContainer) webcamContainer.classList.remove('d-none');
        if (captureResult) captureResult.classList.add('d-none');
        
        // Clear the captured image
        if (capturedImage) capturedImage.src = '';
    }
    
    function showWebcamError(message) {
        const errorElement = document.getElementById('webcam-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
    }
    
    function sendImageForVerification(imageDataURL) {
        // Show loading state
        const verifyBtn = document.getElementById('webcam-use-btn');
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${document.documentElement.lang === 'sk' ? 'Overovanie...' : 'Verifying...'}`;
        }
        
        // We need to send only the base64 data without the data URL prefix
        const base64Data = imageDataURL.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        
        // Send the image for verification
        fetch('/api/verify_age', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_data: imageDataURL, // Send the full data URL
                beverage_type: cartItems.map(item => item.beverage).filter((value, index, self) => self.indexOf(value) === index)[0] || 'beer'
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Verification response:', data);
            
            // Reset button state
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = document.documentElement.lang === 'sk' ? 'Použiť túto fotku' : 'Use this photo';
            }
            
            if (data.verified) {
                // Age verification successful
                displayMessage(
                    document.documentElement.lang === 'sk' ? 
                    'Overenie veku úspešné. Môžete pokračovať k platbe.' : 
                    'Age verification successful. You can proceed to payment.',
                    'success'
                );
                
                // Proceed to payment screen
                showScreen('payment-screen');
                updateProgressBar('payment');
            } else {
                // Age verification failed
                displayMessage(
                    document.documentElement.lang === 'sk' ? 
                    'Overenie veku zlyhalo. ' + (data.message || 'Skúste to znova s lepšou fotografiou.') : 
                    'Age verification failed. ' + (data.message || 'Please try again with a better photo.'),
                    'danger'
                );
                
                // Reset webcam to try again
                resetWebcam();
            }
        })
        .catch(error => {
            console.error('Error during verification:', error);
            
            // Reset button state
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = document.documentElement.lang === 'sk' ? 'Použiť túto fotku' : 'Use this photo';
            }
            
            // Show error message
            displayMessage(
                document.documentElement.lang === 'sk' ? 
                'Chyba pri overovaní. Skúste to znova.' : 
                'Verification error. Please try again.',
                'danger'
            );
            
            // Reset webcam to try again
            resetWebcam();
        });
    }
    
    function startDispensing() {
        // Show the dispensing screen
        showScreen('dispensing-screen');
        updateProgressBar('dispensing');
        
        // Reset the dispensing progress
        if (dispensingProgress) {
            dispensingProgress.style.width = '0%';
            dispensingProgress.setAttribute('aria-valuenow', '0');
        }
        
        // Start monitoring the order progress
        monitorOrderProgress();
    }
    
    function monitorOrderProgress() {
        let progress = 0;
        const progressInterval = setInterval(() => {
            // Fetch the current progress from the server
            fetch('/api/dispensing_status')
                .then(response => response.json())
                .then(data => {
                    console.log('Order status:', data);
                    updateDispenseUI(data);
                    
                    if (data.status === 'completed') {
                        // Order is complete
                        clearInterval(progressInterval);
                        showOrderComplete();
                    } else if (data.status === 'failed') {
                        // Order failed
                        clearInterval(progressInterval);
                        displayMessage(
                            document.documentElement.lang === 'sk' ? 
                            'Nastala chyba pri príprave nápoja: ' + data.message : 
                            'Error preparing your beverage: ' + data.message,
                            'danger'
                        );
                    }
                })
                .catch(error => {
                    console.error('Error checking order status:', error);
                    clearInterval(progressInterval);
                    displayMessage(
                        document.documentElement.lang === 'sk' ? 
                        'Chyba pri komunikácii so serverom' : 
                        'Error communicating with the server',
                        'danger'
                    );
                });
        }, 1000); // Check every second
    }
    
    function updateDispenseUI(data) {
        if (!dispensingStatus || !dispensingProgress) {
            console.error('Dispensing UI elements not found');
            return;
        }
        
        // Update the status message
        dispensingStatus.textContent = data.message || '';
        
        // Update the progress bar
        if (data.progress !== undefined) {
            const progressValue = Math.round(data.progress * 100);
            dispensingProgress.style.width = progressValue + '%';
            dispensingProgress.setAttribute('aria-valuenow', progressValue);
        }
    }
    
    function showOrderComplete() {
        // Show the order complete screen
        showScreen('order-complete-screen');
        updateProgressBar('pickup');
        
        // Clear cart
        cartItems.length = 0;
        updateCartCount();
        updateCartDisplay();
        
        // Save state
        saveState();
        
        // Set a timer to return to the start screen
        setTimeout(() => {
            showScreen('selection-screen');
            updateProgressBar('selection');
        }, 10000); // Return after 10 seconds
    }
});
