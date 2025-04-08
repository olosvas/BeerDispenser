/* customer.js - JavaScript for the beverage dispensing customer interface */

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing customer interface');
    
    // Customer interface global state variables
    const cartItems = [];
    let selectedBeverage = null;
    let selectedSize = null;
    let currentQuantity = 1;
    let beveragesRequiringVerification = ['beer', 'birel']; // Types that require age verification

    // DOM element references
    const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
    const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
    // No beverage type display in the HTML, so we'll skip updating it
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const continueShopping = document.getElementById('continue-shopping-btn');
    const quantityInput = document.getElementById('quantity-input');
    const increaseQuantityBtn = document.getElementById('increase-quantity-btn');
    const decreaseQuantityBtn = document.getElementById('decrease-quantity-btn');
    const cartCount = document.getElementById('cart-count');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const orderProgress = document.getElementById('order-progress');
    const messageContainer = document.getElementById('message-container');

    // Age verification elements
    const verificationMethods = document.getElementById('verification-methods');
    const webcamVerification = document.getElementById('webcam-verification');
    const webcamVerifyBtn = document.getElementById('webcam-verify-btn');
    const webcamContainer = document.getElementById('webcam-container');
    const webcamFeed = document.getElementById('webcam-feed');
    const capturedImage = document.getElementById('captured-image');
    const webcamStartBtn = document.getElementById('webcam-start-btn');
    const webcamCaptureBtn = document.getElementById('webcam-capture-btn');
    const webcamBackBtn = document.getElementById('webcam-back-btn');
    const captureResult = document.getElementById('capture-result');
    const webcamRetryBtn = document.getElementById('webcam-retry-btn');
    const webcamUseBtn = document.getElementById('webcam-use-btn');

    // Payment elements
    const paymentScreen = document.getElementById('payment-screen');
    const paymentTotal = document.getElementById('payment-total');
    const paymentItems = document.getElementById('payment-items');
    const startPaymentBtn = document.getElementById('start-payment-btn');

    // Dispensing elements
    const dispensingScreen = document.getElementById('dispensing-screen');
    const dispensingStatus = document.getElementById('dispensing-status');
    const dispensingProgress = document.getElementById('dispensing-progress');

    // Screen elements
    const screens = document.querySelectorAll('.screen');

    // Webcam
    let webcamStream = null;

    // Log DOM element references for debugging
    console.log('DOM Elements:');
    console.log('beverageTypeOptions:', beverageTypeOptions ? beverageTypeOptions.length : 'not found');
    console.log('beverageSizeOptions:', beverageSizeOptions ? beverageSizeOptions.length : 'not found');
    console.log('beverageTypeDisplay:', beverageTypeDisplay ? 'found' : 'not found');
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
    console.log('cartItemsList:', cartItemsList ? 'found' : 'not found');
    console.log('cartTotalPrice:', cartTotalPrice ? 'found' : 'not found');

    // Initialize the UI
    initializeUI();
    attachEventListeners();
    restoreState();
    
    // Show the initial screen
    showScreen('beverage-type-selection');
    
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
                showScreen('beverage-type-selection');
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
                showScreen('beverage-type-selection');
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
        
        // We don't have a beverageTypeDisplay element in the HTML
        // so we're skipping this part of the code
        
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
        }
    }
    
    function calculatePrice(beverage, size) {
        console.log(`Calculating price for ${beverage} size ${size}`);
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
        const finalPrice = basePrice[beverage] * sizeMultiplier[size];
        console.log(`Price calculated: ${finalPrice}`);
        return finalPrice;
    }
    
    function updateCartCount() {
        console.log('Updating cart count');
        // Calculate total items
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        console.log('Cart total items:', totalItems);
        
        // Update cart count badge
        if (cartCount) {
            cartCount.textContent = totalItems;
            console.log('Cart count updated to:', totalItems);
            
            // Show or hide the badge
            if (totalItems > 0) {
                cartCount.classList.remove('d-none');
            } else {
                cartCount.classList.add('d-none');
            }
        } else {
            console.error('cartCount element not found');
        }
        
        // Enable or disable checkout button
        if (checkoutBtn) {
            const enable = totalItems > 0;
            checkoutBtn.disabled = !enable;
            console.log('Checkout button ' + (enable ? 'enabled' : 'disabled'));
        }
    }
    
    function updateCartDisplay() {
        console.log('Updating cart display');
        if (!cartItemsList || !cartTotalPrice) {
            console.error('Cart elements not found');
            return;
        }
        
        // Clear current items
        cartItemsList.innerHTML = '';
        
        // Check if cart is empty
        if (cartItems.length === 0) {
            const emptyCartMessage = document.createElement('li');
            emptyCartMessage.className = 'list-group-item text-center';
            const language = document.documentElement.lang || 'en';
            emptyCartMessage.textContent = language === 'sk' ? 'Váš košík je prázdny' : 'Your cart is empty';
            cartItemsList.appendChild(emptyCartMessage);
            cartTotalPrice.textContent = '0.00';
            console.log('Cart is empty');
            return;
        }
        
        // Add items to the list
        let totalPrice = 0;
        
        cartItems.forEach((item, index) => {
            const language = document.documentElement.lang || 'en';
            
            // Get beverage name in correct language
            let beverageName = item.beverage;
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
            }
            
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            const contentDiv = document.createElement('div');
            
            const title = document.createElement('h6');
            title.className = 'mb-0';
            title.textContent = `${beverageName} (${item.size}ml)`;
            
            const details = document.createElement('small');
            details.className = 'text-muted';
            details.textContent = `${item.quantity}x €${(item.price / item.quantity).toFixed(2)}`;
            
            contentDiv.appendChild(title);
            contentDiv.appendChild(details);
            
            const priceActions = document.createElement('div');
            priceActions.className = 'd-flex align-items-center';
            
            const price = document.createElement('span');
            price.className = 'me-3';
            price.textContent = `€${item.price.toFixed(2)}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-sm btn-outline-danger';
            removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
            removeBtn.addEventListener('click', () => removeFromCart(index));
            
            priceActions.appendChild(price);
            priceActions.appendChild(removeBtn);
            
            li.appendChild(contentDiv);
            li.appendChild(priceActions);
            
            cartItemsList.appendChild(li);
            
            totalPrice += item.price;
        });
        
        // Update total price
        cartTotalPrice.textContent = totalPrice.toFixed(2);
        console.log('Cart display updated with total price:', totalPrice.toFixed(2));
    }
    
    function removeFromCart(index) {
        console.log('Removing item from cart at index:', index);
        // Remove the item from the cart
        cartItems.splice(index, 1);
        
        // Update the cart display
        updateCartDisplay();
        
        // Update cart count
        updateCartCount();
        
        // Save state
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
        // Try to restore state from localStorage
        try {
            const savedState = localStorage.getItem('beverageDispenser');
            
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Restore cart items if they exist
                if (state.cartItems && Array.isArray(state.cartItems)) {
                    // Clear current cart items
                    cartItems.length = 0;
                    
                    // Add saved items to cart
                    state.cartItems.forEach(item => cartItems.push(item));
                    
                    console.log('Restored cart items:', cartItems);
                    
                    // Update the cart UI
                    updateCartCount();
                    updateCartDisplay();
                }
            }
        } catch (error) {
            console.error('Error restoring state:', error);
        }
    }
    
    function saveState() {
        console.log('Saving state to local storage');
        // Save state to localStorage
        try {
            const state = {
                cartItems: cartItems
            };
            
            localStorage.setItem('beverageDispenser', JSON.stringify(state));
            console.log('State saved successfully');
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }
    
    function getCurrentScreen() {
        for (const screen of screens) {
            if (!screen.classList.contains('d-none')) {
                return screen.id;
            }
        }
        return null;
    }
    
    function showScreen(screenName) {
        console.log('Showing screen:', screenName);
        // Hide all screens
        screens.forEach(screen => {
            screen.classList.add('d-none');
        });
        
        // Show the requested screen
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.remove('d-none');
            
            // If switching to cart, update its display
            if (screenName === 'shopping-cart') {
                updateCartDisplay();
            }
            
            // If switching to payment, update payment info
            if (screenName === 'payment-screen') {
                updatePaymentSummary();
            }
        } else {
            console.error('Screen not found:', screenName);
        }
    }
    
    function updateProgressBar(currentStep) {
        console.log('Updating progress bar to step:', currentStep);
        if (!orderProgress) return;
        
        const steps = orderProgress.querySelectorAll('.progress-step');
        let activeFound = false;
        
        steps.forEach(step => {
            const stepId = step.getAttribute('data-step');
            
            if (stepId === currentStep) {
                step.classList.add('active');
                activeFound = true;
            } else if (!activeFound) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else {
                step.classList.remove('completed', 'active');
            }
        });
    }
    
    function displayMessage(message, type = 'info') {
        console.log(`Displaying message: ${message} (${type})`);
        if (!messageContainer) return;
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `alert alert-${type} alert-dismissible fade show`;
        messageEl.setAttribute('role', 'alert');
        
        messageEl.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to container
        messageContainer.appendChild(messageEl);
        
        // Auto-remove after delay
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                messageContainer.removeChild(messageEl);
            }, 150);
        }, 5000);
    }
    
    function startWebcam() {
        console.log('Starting webcam');
        if (!webcamFeed) return;
        
        // Hide result and buttons
        if (captureResult) captureResult.classList.add('d-none');
        if (webcamRetryBtn) webcamRetryBtn.classList.add('d-none');
        if (webcamUseBtn) webcamUseBtn.classList.add('d-none');
        
        // Show webcam feed and capture button
        if (webcamContainer) webcamContainer.classList.remove('d-none');
        if (webcamCaptureBtn) webcamCaptureBtn.classList.remove('d-none');
        
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                webcamStream = stream;
                webcamFeed.srcObject = stream;
                webcamFeed.classList.remove('d-none');
                if (capturedImage) capturedImage.classList.add('d-none');
                console.log('Webcam started successfully');
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
                showWebcamError(error.message);
            });
    }
    
    function stopWebcam() {
        console.log('Stopping webcam');
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
            console.log('Webcam stopped');
        }
    }
    
    function captureWebcamImage() {
        console.log('Capturing webcam image');
        if (!webcamFeed || !capturedImage) return;
        
        // Create a canvas to capture the image
        const canvas = document.createElement('canvas');
        canvas.width = webcamFeed.videoWidth;
        canvas.height = webcamFeed.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(webcamFeed, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const imageDataURL = canvas.toDataURL('image/jpeg');
        
        // Display the captured image
        capturedImage.src = imageDataURL;
        capturedImage.classList.remove('d-none');
        webcamFeed.classList.add('d-none');
        
        // Show result panel and buttons
        if (captureResult) captureResult.classList.remove('d-none');
        if (webcamRetryBtn) webcamRetryBtn.classList.remove('d-none');
        if (webcamUseBtn) webcamUseBtn.classList.remove('d-none');
        
        // Hide capture button
        if (webcamCaptureBtn) webcamCaptureBtn.classList.add('d-none');
        
        console.log('Image captured successfully');
    }
    
    function resetWebcam() {
        console.log('Resetting webcam');
        // Hide result and buttons
        if (captureResult) captureResult.classList.add('d-none');
        if (webcamRetryBtn) webcamRetryBtn.classList.add('d-none');
        if (webcamUseBtn) webcamUseBtn.classList.add('d-none');
        
        // Show webcam feed and capture button
        if (capturedImage) capturedImage.classList.add('d-none');
        if (webcamFeed) webcamFeed.classList.remove('d-none');
        if (webcamCaptureBtn) webcamCaptureBtn.classList.remove('d-none');
    }
    
    function showWebcamError(message) {
        console.error('Webcam error:', message);
        if (!captureResult) return;
        
        // Hide webcam elements
        if (webcamContainer) webcamContainer.classList.add('d-none');
        if (webcamCaptureBtn) webcamCaptureBtn.classList.add('d-none');
        
        // Show error message
        captureResult.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
            <button class="btn btn-secondary" id="webcam-back-error-btn">
                <i class="fas fa-arrow-left me-2"></i> Back
            </button>
        `;
        captureResult.classList.remove('d-none');
        
        // Add event listener for back button
        const backBtn = document.getElementById('webcam-back-error-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (verificationMethods) verificationMethods.classList.remove('d-none');
                if (webcamVerification) webcamVerification.classList.add('d-none');
            });
        }
    }
    
    function sendImageForVerification(imageDataURL) {
        console.log('Sending image for verification');
        // Get the beverage type to verify against
        const verifyingForBeverage = cartItems.find(item => 
            beveragesRequiringVerification.includes(item.beverage)
        )?.beverage || 'beer'; // Default to beer if no specific beverage found
        
        // Display loading state
        if (captureResult) {
            captureResult.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Verifying your age...</p>
            `;
        }
        
        // Send the image data to the server
        fetch('/api/verify-age', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_data: imageDataURL,
                beverage_type: verifyingForBeverage
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Verification response:', data);
            
            // Check if age verification passed
            if (data.passed) {
                // Show success message
                if (captureResult) {
                    captureResult.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            ${data.message}
                        </div>
                    `;
                }
                
                // Proceed to payment after a delay
                setTimeout(() => {
                    showScreen('payment-screen');
                    updateProgressBar('payment');
                    stopWebcam();
                }, 2000);
            } else {
                // Show failure message
                if (captureResult) {
                    captureResult.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-times-circle me-2"></i>
                            ${data.message}
                        </div>
                        <button class="btn btn-primary mt-3" id="retry-verification-btn">
                            Try Again
                        </button>
                    `;
                    
                    // Add event listener for retry button
                    const retryBtn = document.getElementById('retry-verification-btn');
                    if (retryBtn) {
                        retryBtn.addEventListener('click', resetWebcam);
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error verifying age:', error);
            
            // Show error message
            if (captureResult) {
                captureResult.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error verifying age. Please try again.
                    </div>
                    <button class="btn btn-primary mt-3" id="retry-verification-btn">
                        Try Again
                    </button>
                `;
                
                // Add event listener for retry button
                const retryBtn = document.getElementById('retry-verification-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', resetWebcam);
                }
            }
        });
    }
    
    function updatePaymentSummary() {
        console.log('Updating payment summary');
        if (!paymentTotal || !paymentItems) return;
        
        // Clear the items
        paymentItems.innerHTML = '';
        
        // Calculate total
        let total = 0;
        
        // Add each item
        cartItems.forEach(item => {
            const language = document.documentElement.lang || 'en';
            
            // Get beverage name in correct language
            let beverageName = item.beverage;
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
            }
            
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between';
            
            const itemSpan = document.createElement('span');
            itemSpan.textContent = `${beverageName} (${item.size}ml) x${item.quantity}`;
            
            const priceSpan = document.createElement('span');
            priceSpan.textContent = `€${item.price.toFixed(2)}`;
            
            li.appendChild(itemSpan);
            li.appendChild(priceSpan);
            paymentItems.appendChild(li);
            
            total += item.price;
        });
        
        // Update total
        paymentTotal.textContent = total.toFixed(2);
        console.log('Payment summary updated with total:', total.toFixed(2));
    }
    
    function startDispensing() {
        console.log('Starting dispensing process');
        showScreen('dispensing-screen');
        updateProgressBar('dispensing');
        
        // Prepare cart data for sending
        const orderData = {
            items: cartItems.map(item => ({
                beverage_type: item.beverage,
                size_ml: parseInt(item.size),
                quantity: item.quantity
            }))
        };
        
        // Send order to the dispensing system
        fetch('/api/dispense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Dispensing initiated:', data);
            
            if (data.success) {
                // Start monitoring the dispensing progress
                monitorOrderProgress();
                
                // Clear the cart after successfully starting dispensing
                cartItems.length = 0;
                saveState();
            } else {
                // Show error
                if (dispensingStatus) {
                    dispensingStatus.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            ${data.message || 'Failed to start dispensing'}
                        </div>
                        <button class="btn btn-primary mt-3" id="return-to-cart-btn">
                            Return to Cart
                        </button>
                    `;
                    
                    // Add event listener for return button
                    const returnBtn = document.getElementById('return-to-cart-btn');
                    if (returnBtn) {
                        returnBtn.addEventListener('click', () => {
                            showScreen('shopping-cart');
                        });
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error starting dispensing:', error);
            
            // Show error
            if (dispensingStatus) {
                dispensingStatus.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error contacting dispensing system. Please try again.
                    </div>
                    <button class="btn btn-primary mt-3" id="return-to-cart-btn">
                        Return to Cart
                    </button>
                `;
                
                // Add event listener for return button
                const returnBtn = document.getElementById('return-to-cart-btn');
                if (returnBtn) {
                    returnBtn.addEventListener('click', () => {
                        showScreen('shopping-cart');
                    });
                }
            }
        });
    }
    
    function monitorOrderProgress() {
        console.log('Monitoring order progress');
        let progressInterval = null;
        let retryCount = 0;
        const maxRetries = 5;
        
        // Function to check status
        const checkStatus = () => {
            fetch('/api/dispense-status')
                .then(response => response.json())
                .then(data => {
                    console.log('Dispensing status update:', data);
                    updateDispenseUI(data);
                    
                    // If complete or error, stop polling
                    if (data.status === 'complete' || data.status === 'error') {
                        clearInterval(progressInterval);
                        
                        if (data.status === 'complete') {
                            showOrderComplete();
                        }
                    }
                    
                    // Reset retry counter on successful fetch
                    retryCount = 0;
                })
                .catch(error => {
                    console.error('Error checking dispensing status:', error);
                    retryCount++;
                    
                    if (retryCount >= maxRetries) {
                        clearInterval(progressInterval);
                        
                        // Show error
                        if (dispensingStatus) {
                            dispensingStatus.innerHTML = `
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    Lost connection to dispensing system. Your order might still be in progress.
                                </div>
                                <button class="btn btn-primary mt-3" id="done-anyway-btn">
                                    Done
                                </button>
                            `;
                            
                            // Add event listener for done button
                            const doneBtn = document.getElementById('done-anyway-btn');
                            if (doneBtn) {
                                doneBtn.addEventListener('click', () => {
                                    showScreen('beverage-type-selection');
                                    updateProgressBar('selection');
                                });
                            }
                        }
                    }
                });
        };
        
        // Initial check
        checkStatus();
        
        // Set up polling every 2 seconds
        progressInterval = setInterval(checkStatus, 2000);
    }
    
    function updateDispenseUI(data) {
        console.log('Updating dispense UI with data:', data);
        if (!dispensingStatus || !dispensingProgress) return;
        
        // Update progress bar
        let progressPercent = 0;
        
        switch (data.status) {
            case 'preparing':
                progressPercent = 10;
                break;
            case 'dispensing_cup':
                progressPercent = 30;
                break;
            case 'pouring_beverage':
                progressPercent = 60;
                break;
            case 'delivering':
                progressPercent = 90;
                break;
            case 'complete':
                progressPercent = 100;
                break;
            default:
                progressPercent = 5;
        }
        
        dispensingProgress.style.width = `${progressPercent}%`;
        dispensingProgress.setAttribute('aria-valuenow', progressPercent);
        
        // Update status message
        const language = document.documentElement.lang || 'en';
        let statusMessage = '';
        
        if (language === 'sk') {
            switch (data.status) {
                case 'preparing':
                    statusMessage = 'Pripravujeme váš nápoj...';
                    break;
                case 'dispensing_cup':
                    statusMessage = 'Dávkovanie pohára...';
                    break;
                case 'pouring_beverage':
                    statusMessage = 'Čapovanie nápoja...';
                    break;
                case 'delivering':
                    statusMessage = 'Doručovanie pohára...';
                    break;
                case 'complete':
                    statusMessage = 'Hotovo! Váš nápoj je pripravený.';
                    break;
                case 'error':
                    statusMessage = `Chyba: ${data.message || 'Nastala neočakávaná chyba'}`;
                    break;
                default:
                    statusMessage = 'Inicializácia...';
            }
        } else {
            switch (data.status) {
                case 'preparing':
                    statusMessage = 'Preparing your beverage...';
                    break;
                case 'dispensing_cup':
                    statusMessage = 'Dispensing cup...';
                    break;
                case 'pouring_beverage':
                    statusMessage = 'Pouring beverage...';
                    break;
                case 'delivering':
                    statusMessage = 'Delivering cup...';
                    break;
                case 'complete':
                    statusMessage = 'Complete! Your beverage is ready.';
                    break;
                case 'error':
                    statusMessage = `Error: ${data.message || 'An unexpected error occurred'}`;
                    break;
                default:
                    statusMessage = 'Initializing...';
            }
        }
        
        // If error, show error state
        if (data.status === 'error') {
            dispensingStatus.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${statusMessage}
                </div>
                <button class="btn btn-primary mt-3" id="return-to-cart-btn">
                    ${language === 'sk' ? 'Späť do košíka' : 'Return to Cart'}
                </button>
            `;
            
            // Add event listener for return button
            const returnBtn = document.getElementById('return-to-cart-btn');
            if (returnBtn) {
                returnBtn.addEventListener('click', () => {
                    showScreen('shopping-cart');
                });
            }
        } else {
            // Normal status update
            dispensingStatus.innerHTML = `
                <h3 class="mb-4">${statusMessage}</h3>
                <div class="progress mb-4" style="height: 20px;">
                    <div id="dispensing-progress" class="progress-bar progress-bar-striped progress-bar-animated" 
                        role="progressbar" style="width: ${progressPercent}%;" 
                        aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
            `;
        }
    }
    
    function showOrderComplete() {
        console.log('Order complete');
        const language = document.documentElement.lang || 'en';
        
        if (dispensingStatus) {
            dispensingStatus.innerHTML = `
                <div class="text-center mb-4">
                    <i class="fas fa-check-circle text-success" style="font-size: 5rem;"></i>
                    <h2 class="mt-3">${language === 'sk' ? 'Hotovo!' : 'Complete!'}</h2>
                    <p class="lead">${language === 'sk' ? 'Váš nápoj je pripravený.' : 'Your beverage is ready.'}</p>
                </div>
                <button class="btn btn-primary btn-lg" id="done-btn">
                    ${language === 'sk' ? 'Hotovo' : 'Done'}
                </button>
            `;
            
            // Add event listener for done button
            const doneBtn = document.getElementById('done-btn');
            if (doneBtn) {
                doneBtn.addEventListener('click', () => {
                    showScreen('beverage-type-selection');
                    updateProgressBar('selection');
                });
            }
        }
    }
});
