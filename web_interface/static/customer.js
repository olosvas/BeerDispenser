document.addEventListener('DOMContentLoaded', function() {
    // Common DOM elements
    const bevTypeSelectionScreen = document.getElementById('beverage-type-selection');
    const bevSizeSelectionScreen = document.getElementById('beverage-size-selection');
    const shoppingCartScreen = document.getElementById('shopping-cart');
    const ageVerificationScreen = document.getElementById('age-verification');
    const dispensingScreen = document.getElementById('dispensing-screen');
    const orderCompleteScreen = document.getElementById('order-complete-screen');
    const cartIconContainer = document.getElementById('cart-icon-container');
    const progressContainer = document.getElementById('progress-container');
    
    // Progress steps
    const stepSelection = document.getElementById('step-selection');
    const stepCart = document.getElementById('step-cart');
    const stepVerification = document.getElementById('step-verification');
    const stepPayment = document.getElementById('step-payment');
    const stepDispensing = document.getElementById('step-dispensing');
    const stepPickup = document.getElementById('step-pickup');
    
    // Global state
    let selectedBeverageType = '';
    let selectedSize = null;
    let cartItems = [];
    
    // Initialize UI
    function initializeUI() {
        console.log("Initializing UI...");
        
        // Force show beverage type selection by default 
        hideAllScreens();
        if (bevTypeSelectionScreen) {
            bevTypeSelectionScreen.classList.remove('d-none');
            console.log("Showing beverage type selection screen");
        } else {
            console.error("Could not find beverage type selection screen");
        }
        
        // Then restore if we have a saved state
        let savedScreen = document.getElementById('current_screen')?.value || '';
        console.log("Saved screen:", savedScreen);
        if (savedScreen && savedScreen !== '') {
            restoreUIState(savedScreen);
        }
        
        // Attach event listeners
        attachEventListeners();
        
        // Initial update of cart UI
        updateCartDisplay();
    }
    
    // Helper to save state to server
    function saveStateToServer() {
        fetch('/save_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_screen: getCurrentScreen(),
                selected_beverage: selectedBeverageType,
                selected_size: selectedSize,
                cart_items: cartItems
            })
        }).catch(error => console.error('Error saving state:', error));
    }
    
    // Get current visible screen
    function getCurrentScreen() {
        if (!bevTypeSelectionScreen.classList.contains('d-none')) return 'beverage-type-selection';
        if (!bevSizeSelectionScreen.classList.contains('d-none')) return 'beverage-size-selection';
        if (!shoppingCartScreen.classList.contains('d-none')) return 'shopping-cart';
        if (!ageVerificationScreen.classList.contains('d-none')) return 'age-verification';
        if (!dispensingScreen.classList.contains('d-none')) return 'dispensing-screen';
        if (!orderCompleteScreen.classList.contains('d-none')) return 'order-complete-screen';
        return ''; // Default empty
    }
    
    // Restore UI state based on server data
    function restoreUIState(screenName) {
        // Restore selections from hidden fields
        const storedBeverage = document.getElementById('selected_beverage')?.value || '';
        const storedSize = document.getElementById('selected_size')?.value || '';
        
        if (storedBeverage) {
            selectedBeverageType = storedBeverage;
            // Update beverage selection UI
            const bevOptions = document.querySelectorAll('.beverage-type-option');
            bevOptions.forEach(option => {
                if (option.dataset.type === selectedBeverageType) {
                    option.classList.add('selected');
                    // Update display text
                    const displayEl = document.getElementById('beverage-type-display');
                    if (displayEl && displayEl.querySelector('span')) {
                        displayEl.querySelector('span').textContent = option.querySelector('.card-title').textContent;
                    }
                } else {
                    option.classList.remove('selected');
                }
            });
        }
        
        if (storedSize) {
            selectedSize = parseInt(storedSize, 10);
            // Update size selection UI
            const sizeOptions = document.querySelectorAll('.beverage-size-option');
            sizeOptions.forEach(option => {
                if (parseInt(option.dataset.size, 10) === selectedSize) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }
        
        // Show the appropriate screen based on screenName
        if (screenName && screenName !== '') {
            hideAllScreens();
            const screenElement = document.getElementById(screenName);
            if (screenElement) {
                screenElement.classList.remove('d-none');
                console.log(`Showing screen: ${screenName}`);
            } else {
                console.error(`Screen not found: ${screenName}, showing beverage-type-selection`);
                if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
            }
            
            // Update progress steps as needed
            if (progressContainer) progressContainer.classList.remove('d-none');
            if (screenName === 'beverage-size-selection') {
                if (stepSelection) stepSelection.classList.add('active');
            } else if (screenName === 'shopping-cart') {
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
            } else if (screenName === 'age-verification') {
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
            } else if (screenName === 'dispensing-screen') {
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
                if (stepDispensing) stepDispensing.classList.add('active');
            } else if (screenName === 'order-complete-screen') {
                if (stepSelection) stepSelection.classList.add('active');
                if (stepCart) stepCart.classList.add('active');
                if (stepVerification) stepVerification.classList.add('active');
                if (stepDispensing) stepDispensing.classList.add('active');
                if (stepPickup) stepPickup.classList.add('active');
            }
        } else {
            // Fallback to showing beverage type selection if no screen is specified
            hideAllScreens();
            if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
        }
    }
    
    // Hide all screens
    function hideAllScreens() {
        if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.add('d-none');
        if (bevSizeSelectionScreen) bevSizeSelectionScreen.classList.add('d-none');
        if (shoppingCartScreen) shoppingCartScreen.classList.add('d-none');
        if (ageVerificationScreen) ageVerificationScreen.classList.add('d-none');
        if (dispensingScreen) dispensingScreen.classList.add('d-none');
        if (orderCompleteScreen) orderCompleteScreen.classList.add('d-none');
    }
    
    function updateCartDisplay() {
        // Update cart count badge
        const cartCount = document.getElementById('cart-count');
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
        
        // Show/hide cart icon
        if (cartIconContainer) {
            if (totalItems > 0) {
                cartIconContainer.classList.remove('d-none');
            } else {
                cartIconContainer.classList.add('d-none');
            }
        }
        
        // Update checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = totalItems === 0;
        }
        
        // Update cart items in shopping cart screen
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartTotalItems = document.getElementById('cart-total-items');
        const cartTotalPrice = document.getElementById('cart-total-price');
        
        if (!cartItemsContainer) return;
        
        // Clear existing items
        while (cartItemsContainer.firstChild && cartItemsContainer.firstChild !== emptyCartMessage) {
            cartItemsContainer.removeChild(cartItemsContainer.firstChild);
        }
        
        // Show/hide empty cart message
        if (emptyCartMessage) {
            if (cartItems.length === 0) {
                emptyCartMessage.classList.remove('d-none');
            } else {
                emptyCartMessage.classList.add('d-none');
            }
        }
        
        // Add items to cart
        let totalPrice = 0;
        cartItems.forEach((item, index) => {
            const itemPrice = item.size === 300 ? 1.50 : 2.50;
            const subtotal = itemPrice * item.quantity;
            totalPrice += subtotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item d-flex justify-content-between align-items-center py-2';
            itemElement.innerHTML = `
                <div>
                    <h5 class="mb-0">${getBeverageName(item.beverage)}</h5>
                    <p class="text-muted mb-0">${item.size}ml</p>
                </div>
                <div class="d-flex align-items-center">
                    <div class="quantity-selector me-3">
                        <button class="btn btn-sm btn-outline-secondary quantity-decrease" data-index="${index}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="text" class="form-control" value="${item.quantity}" readonly style="width: 40px; text-align: center;">
                        <button class="btn btn-sm btn-outline-secondary quantity-increase" data-index="${index}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="text-end" style="min-width: 80px;">
                        <p class="mb-0">€${subtotal.toFixed(2)}</p>
                    </div>
                    <button class="btn btn-sm btn-outline-danger ms-2 remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItemsContainer.insertBefore(itemElement, emptyCartMessage);
            
            // Add event listeners to the newly created buttons
            const decreaseBtn = itemElement.querySelector('.quantity-decrease');
            const increaseBtn = itemElement.querySelector('.quantity-increase');
            const removeBtn = itemElement.querySelector('.remove-item');
            
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index, 10);
                    if (cartItems[index].quantity > 1) {
                        cartItems[index].quantity--;
                        updateCartDisplay();
                        saveStateToServer();
                    }
                });
            }
            
            if (increaseBtn) {
                increaseBtn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index, 10);
                    if (cartItems[index].quantity < 10) {
                        cartItems[index].quantity++;
                        updateCartDisplay();
                        saveStateToServer();
                    }
                });
            }
            
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index, 10);
                    cartItems.splice(index, 1);
                    updateCartDisplay();
                    saveStateToServer();
                });
            }
        });
        
        // Update totals
        if (cartTotalItems) {
            cartTotalItems.textContent = totalItems;
        }
        
        if (cartTotalPrice) {
            cartTotalPrice.textContent = `€${totalPrice.toFixed(2)}`;
        }
    }
    
    function getBeverageName(type) {
        const names = {
            'beer': 'Šariš 10',
            'kofola': 'Kofola',
            'birel': 'Birel Pomelo&Grep'
        };
        return names[type] || type;
    }
    
    function attachEventListeners() {
        console.log("Attaching event listeners...");
        
        // Beverage Type Selection
        const beverageOptions = document.querySelectorAll('.beverage-type-option');
        const continueTypeBtn = document.getElementById('continue-type-btn');
        const typeDisplay = document.getElementById('beverage-type-display');
        
        beverageOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Update selection
                selectedBeverageType = this.dataset.type;
                
                // Update UI
                beverageOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Enable continue button
                if (continueTypeBtn) {
                    continueTypeBtn.disabled = false;
                }
                
                // Update display text
                if (typeDisplay && typeDisplay.querySelector('span')) {
                    typeDisplay.querySelector('span').textContent = this.querySelector('.card-title').textContent;
                }
            });
        });
        
        // Continue to Size Selection
        if (continueTypeBtn) {
            continueTypeBtn.addEventListener('click', function() {
                hideAllScreens();
                if (bevSizeSelectionScreen) bevSizeSelectionScreen.classList.remove('d-none');
                if (progressContainer) progressContainer.classList.remove('d-none');
                if (stepSelection) stepSelection.classList.add('active');
                
                // Save state
                saveStateToServer();
            });
        }
        
        // Beverage Size Selection
        const sizeOptions = document.querySelectorAll('.beverage-size-option');
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        const backToTypeBtn = document.getElementById('back-to-type-btn');
        const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
        
        sizeOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Update selection
                selectedSize = parseInt(this.dataset.size, 10);
                
                // Update UI
                sizeOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Enable add to cart button
                if (addToCartBtn) {
                    addToCartBtn.disabled = false;
                }
            });
        });
        
        // Back to Type Selection
        if (backToTypeBtn) {
            backToTypeBtn.addEventListener('click', function() {
                hideAllScreens();
                if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
            });
        }
        
        // Quantity controls
        const decQuantityBtn = document.querySelector('.dec-quantity');
        const incQuantityBtn = document.querySelector('.inc-quantity');
        const quantityInput = document.querySelector('.quantity-input');
        const quickQuantityBtns = document.querySelectorAll('.quick-quantity-btn');
        
        if (decQuantityBtn && quantityInput) {
            decQuantityBtn.addEventListener('click', function() {
                const currentVal = parseInt(quantityInput.value, 10);
                if (currentVal > 1) {
                    quantityInput.value = currentVal - 1;
                }
            });
        }
        
        if (incQuantityBtn && quantityInput) {
            incQuantityBtn.addEventListener('click', function() {
                const currentVal = parseInt(quantityInput.value, 10);
                if (currentVal < 10) {
                    quantityInput.value = parseInt(currentVal) + 1;
                }
            });
        }
        
        if (quickQuantityBtns.length && quantityInput) {
            quickQuantityBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    quantityInput.value = parseInt(this.dataset.quantity, 10);
                });
            });
        }
        
        // Add to Cart
        if (addToCartBtn && quantityInput) {
            addToCartBtn.addEventListener('click', function() {
                if (!selectedBeverageType || !selectedSize) return;
                
                const quantity = parseInt(quantityInput.value, 10);
                if (isNaN(quantity) || quantity < 1) return;
                
                // Create a new item
                const newItem = {
                    beverage: selectedBeverageType,
                    size: selectedSize,
                    quantity: quantity
                };
                
                // Add to cart
                cartItems.push(newItem);
                
                // Update cart UI
                updateCartDisplay();
                
                // Save state
                saveStateToServer();
                
                // Show success message
                const successToast = document.getElementById('add-to-cart-toast');
                if (successToast) {
                    // Set message content
                    const toastBody = successToast.querySelector('.toast-body');
                    if (toastBody) {
                        const msg = `${quantity}x ${getBeverageName(selectedBeverageType)} (${selectedSize}ml)`;
                        toastBody.textContent = msg;
                    }
                    
                    // Initialize Bootstrap toast
                    const bsToast = new bootstrap.Toast(successToast);
                    bsToast.show();
                }
                
                // Reset quantity
                quantityInput.value = "1";
                
                // Redirect to cart page
                hideAllScreens();
                if (shoppingCartScreen) shoppingCartScreen.classList.remove('d-none');
                if (stepCart) stepCart.classList.add('active');
            });
        }
        
        // View Cart from size selection
        if (viewCartFromSizeBtn) {
            viewCartFromSizeBtn.addEventListener('click', function() {
                hideAllScreens();
                if (shoppingCartScreen) shoppingCartScreen.classList.remove('d-none');
                if (stepCart) stepCart.classList.add('active');
            });
        }
        
        // Shopping Cart Controls
        const continueShoppingBtn = document.getElementById('continue-shopping-btn');
        const checkoutBtn = document.getElementById('checkout-btn');
        const cartIcon = document.getElementById('cart-icon');
        
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', function() {
                hideAllScreens();
                if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
            });
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cartItems.length === 0) return;
                
                // If any alcoholic beverage, go to age verification
                const hasAlcohol = cartItems.some(item => item.beverage === 'beer');
                if (hasAlcohol) {
                    hideAllScreens();
                    if (ageVerificationScreen) ageVerificationScreen.classList.remove('d-none');
                    if (stepVerification) stepVerification.classList.add('active');
                } else {
                    // Skip age verification for non-alcoholic beverages
                    hideAllScreens();
                    if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                    if (stepDispensing) stepDispensing.classList.add('active');
                    
                    // Start dispensing process
                    startDispensing();
                }
            });
        }
        
        if (cartIcon) {
            cartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                hideAllScreens();
                if (shoppingCartScreen) shoppingCartScreen.classList.remove('d-none');
                if (stepCart) stepCart.classList.add('active');
            });
        }
        
        // Age Verification - New event listeners for the new UI
        const webcamVerifyBtn = document.getElementById('webcam-verify-btn');
        const idCardVerifyBtn = document.getElementById('id-card-verify-btn');
        const webcamStartBtn = document.getElementById('webcam-start-btn');
        const webcamCaptureBtn = document.getElementById('webcam-capture-btn');
        const webcamBackBtn = document.getElementById('webcam-back-btn');
        const webcamProceedBtn = document.getElementById('webcam-proceed-btn');
        const webcamRetryBtn = document.getElementById('webcam-retry-btn');
        
        // Verification method selection
        if (webcamVerifyBtn) {
            webcamVerifyBtn.addEventListener('click', function() {
                // Show webcam verification UI
                document.getElementById('verification-methods').classList.add('d-none');
                document.getElementById('webcam-verification').classList.remove('d-none');
            });
        }
        
        if (idCardVerifyBtn) {
            idCardVerifyBtn.addEventListener('click', function() {
                // Show ID card verification UI
                document.getElementById('verification-methods').classList.add('d-none');
                document.getElementById('verification-form').classList.remove('d-none');
            });
        }
        
        // Webcam controls
        if (webcamStartBtn) {
            webcamStartBtn.addEventListener('click', startWebcam);
        }
        
        if (webcamCaptureBtn) {
            webcamCaptureBtn.addEventListener('click', captureWebcamImage);
        }
        
        if (webcamBackBtn) {
            webcamBackBtn.addEventListener('click', function() {
                // Stop webcam if running
                stopWebcam();
                
                // Go back to methods selection
                document.getElementById('webcam-verification').classList.add('d-none');
                document.getElementById('verification-methods').classList.remove('d-none');
                
                // Reset UI elements
                document.getElementById('webcam-result').classList.add('d-none');
                document.getElementById('webcam-loading').classList.add('d-none');
                document.getElementById('webcam-error').classList.add('d-none');
            });
        }
        
        if (webcamProceedBtn) {
            webcamProceedBtn.addEventListener('click', function() {
                // Proceed to dispensing
                hideAllScreens();
                if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                if (stepDispensing) stepDispensing.classList.add('active');
                
                // Stop webcam
                stopWebcam();
                
                // Start dispensing
                startDispensing();
            });
        }
        
        if (webcamRetryBtn) {
            webcamRetryBtn.addEventListener('click', function() {
                // Hide result and reset
                document.getElementById('webcam-result').classList.add('d-none');
                resetWebcam();
            });
        }
        
        // ID Card form submission
        const verificationForm = document.getElementById('verification-form');
        if (verificationForm) {
            verificationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Simple mock verification - in real system would call API
                const birthDateInput = document.getElementById('birthdate');
                if (!birthDateInput) return;
                
                const birthDate = new Date(birthDateInput.value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                // Verify age (18+ for alcohol)
                if (age >= 18) {
                    // Success - proceed to dispensing
                    hideAllScreens();
                    if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                    if (stepDispensing) stepDispensing.classList.add('active');
                    
                    // Start dispensing
                    startDispensing();
                } else {
                    // Too young - show error
                    alert('Je nám ľúto, ale pre nákup alkoholických nápojov musíte mať najmenej 18 rokov.');
                }
            });
        }
    }
    
    // Webcam management
    let webcamStream = null;
    
    function startWebcam() {
        const webcamElement = document.getElementById('webcam-video');
        const startButton = document.getElementById('webcam-start-btn');
        const captureButton = document.getElementById('webcam-capture-btn');
        const errorElement = document.getElementById('webcam-error');
        
        if (!webcamElement) {
            console.error("Webcam video element not found");
            return;
        }
        
        if (errorElement) errorElement.classList.add('d-none');
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            startButton.disabled = true;
            
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    webcamStream = stream;
                    webcamElement.srcObject = stream;
                    webcamElement.play();
                    
                    // Enable capture button once video is playing
                    webcamElement.onloadedmetadata = function() {
                        if (captureButton) captureButton.disabled = false;
                    };
                })
                .catch(function(error) {
                    console.error("Webcam error:", error);
                    showWebcamError("Nepodarilo sa pristúpiť ku kamere: " + error.message);
                    if (startButton) startButton.disabled = false;
                });
        } else {
            showWebcamError("Váš prehliadač nepodporuje prístup ku kamere");
        }
    }
    
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
    }
    
    function resetWebcam() {
        stopWebcam();
        startWebcam();
    }
    
    function captureWebcamImage() {
        const webcamElement = document.getElementById('webcam-video');
        const captureBtn = document.getElementById('webcam-capture-btn');
        const statusElement = document.getElementById('verification-status');
        const canvasElement = document.getElementById('webcam-canvas');
        const loadingElement = document.getElementById('webcam-loading');
        const resultElement = document.getElementById('webcam-result');
        
        if (!webcamElement || !canvasElement || !statusElement) {
            console.error("Required webcam elements not found");
            return;
        }
        
        // Show loading, hide controls
        if (loadingElement) loadingElement.classList.remove('d-none');
        if (resultElement) resultElement.classList.add('d-none');
        if (captureBtn) captureBtn.disabled = true;
        
        try {
            // Create canvas and capture image
            canvasElement.width = webcamElement.videoWidth;
            canvasElement.height = webcamElement.videoHeight;
            const ctx = canvasElement.getContext('2d');
            ctx.drawImage(webcamElement, 0, 0, canvasElement.width, canvasElement.height);
            
            // Get image data
            const imageData = canvasElement.toDataURL('image/jpeg');
            
            // Send to server for verification
            fetch('/api/verify_age', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_data: imageData,
                    beverage_type: 'beer' // We know we're verifying for beer if we're here
                })
            })
            .then(response => response.json())
            .then(data => {
                // Hide loading
                if (loadingElement) loadingElement.classList.add('d-none');
                if (resultElement) resultElement.classList.remove('d-none');
                
                if (data.verified) {
                    // Success
                    if (statusElement) {
                        statusElement.textContent = "Vek úspešne overený! Začínam čapovanie...";
                        statusElement.parentElement.className = "alert alert-success";
                    }
                    
                    // Show estimated age if available
                    const ageElement = document.getElementById('estimated-age');
                    if (ageElement && data.estimated_age) {
                        ageElement.textContent = `Odhadovaný vek: ${data.estimated_age} rokov`;
                    }
                    
                    // Show proceed button
                    const proceedBtn = document.getElementById('webcam-proceed-btn');
                    if (proceedBtn) {
                        proceedBtn.classList.remove('d-none');
                    }
                    
                    // Proceed to dispensing after delay
                    setTimeout(() => {
                        hideAllScreens();
                        if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                        if (stepDispensing) stepDispensing.classList.add('active');
                        
                        // Stop webcam
                        stopWebcam();
                        
                        // Start dispensing
                        startDispensing();
                    }, 3000);
                } else {
                    // Failed verification
                    if (statusElement) {
                        statusElement.textContent = data.message || "Overenie veku zlyhalo. Skúste to znova alebo požiadajte o pomoc.";
                        statusElement.parentElement.className = "alert alert-danger";
                    }
                    
                    // Enable retry button
                    if (captureBtn) captureBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error verifying age:', error);
                if (loadingElement) loadingElement.classList.add('d-none');
                if (resultElement) resultElement.classList.remove('d-none');
                
                if (statusElement) {
                    statusElement.textContent = "Chyba pri spracovaní overenia. Skúste to znova.";
                    statusElement.parentElement.className = "alert alert-danger";
                }
                
                if (captureBtn) captureBtn.disabled = false;
            });
        } catch (error) {
            console.error('Error capturing image:', error);
            if (loadingElement) loadingElement.classList.add('d-none');
            
            if (statusElement) {
                statusElement.textContent = "Chyba pri zachytení snímky. Skúste to znova.";
                statusElement.parentElement.className = "alert alert-danger";
            }
            
            if (captureBtn) captureBtn.disabled = false;
        }
    }
    
    function showWebcamError(message) {
        const errorElement = document.getElementById('webcam-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
    }
    
    // Dispensing process
    function startDispensing() {
        // Animate the cup filling process
        const cupFillElement = document.getElementById('cup-fill');
        const statusElement = document.getElementById('dispensing-status');
        
        if (cupFillElement) {
            cupFillElement.style.height = '0%';
            // Start at 0%
            let fillLevel = 0;
            
            // Create a smoother animation
            const fillAnimation = setInterval(() => {
                fillLevel += 0.5;
                cupFillElement.style.height = `${fillLevel}%`;
                
                if (fillLevel >= 100) {
                    clearInterval(fillAnimation);
                }
            }, 50);
        }
        
        if (statusElement) {
            statusElement.textContent = "Starting dispensing process...";
        }
        
        // Send dispensing request to server
        const firstItem = cartItems[0]; // For now, just dispense the first item
        
        fetch('/api/dispense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                beverage_type: firstItem.beverage,
                volume_ml: firstItem.size,
                quantity: firstItem.quantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Start monitoring progress
                monitorOrderProgress();
            } else {
                // Error starting dispensing
                if (statusElement) {
                    statusElement.textContent = data.message || "Error starting dispensing process.";
                    statusElement.className = "text-danger";
                }
            }
        })
        .catch(error => {
            console.error('Error starting dispensing:', error);
            if (statusElement) {
                statusElement.textContent = "Server error. Please try again or seek assistance.";
                statusElement.className = "text-danger";
            }
        });
    }
    
    function monitorOrderProgress() {
        const statusElement = document.getElementById('dispensing-status');
        const progressElement = document.getElementById('dispensing-progress');
        
        let checkCount = 0;
        const maxChecks = 30; // Avoid infinite polling
        
        // Poll the server for status updates
        const statusInterval = setInterval(() => {
            checkCount++;
            
            fetch('/api/dispensing_status')
                .then(response => response.json())
                .then(data => {
                    // Update UI with status
                    updateDispenseUI(data);
                    
                    // Check if dispensing is complete
                    if (data.state === 'complete' || data.progress >= 100) {
                        clearInterval(statusInterval);
                        showOrderComplete();
                    }
                    
                    // Check for timeout or errors
                    if (checkCount >= maxChecks || data.state === 'error') {
                        clearInterval(statusInterval);
                        if (data.state !== 'complete') {
                            // Show error if not complete
                            if (statusElement) {
                                statusElement.textContent = data.message || "Dispensing timed out. Please seek assistance.";
                                statusElement.className = "text-danger";
                            }
                        }
                    }
                })
                .catch(error => {
                    console.error('Error checking status:', error);
                    // Don't immediately clear interval on network errors
                    if (checkCount >= maxChecks) {
                        clearInterval(statusInterval);
                        if (statusElement) {
                            statusElement.textContent = "Error communicating with server. Please seek assistance.";
                            statusElement.className = "text-danger";
                        }
                    }
                });
        }, 1000); // Check every second
    }
    
    function updateDispenseUI(state) {
        const statusElement = document.getElementById('dispensing-status');
        const progressBar = document.getElementById('dispensing-progress');
        
        if (statusElement) {
            statusElement.textContent = state.message || "Dispensing in progress...";
            
            if (state.state === 'error') {
                statusElement.className = "text-danger";
            } else if (state.state === 'complete') {
                statusElement.className = "text-success";
            } else {
                statusElement.className = "text-primary";
            }
        }
        
        if (progressBar) {
            progressBar.style.width = `${state.progress || 0}%`;
            progressBar.setAttribute('aria-valuenow', state.progress || 0);
        }
    }
    
    function showOrderComplete() {
        hideAllScreens();
        if (orderCompleteScreen) orderCompleteScreen.classList.remove('d-none');
        if (stepPickup) stepPickup.classList.add('active');
        
        // Clear cart after successful dispensing
        cartItems = [];
        updateCartDisplay();
        saveStateToServer();
        
        // Automatically go back to selection after a delay
        setTimeout(() => {
            hideAllScreens();
            if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
            if (progressContainer) progressContainer.classList.add('d-none');
            
            // Reset active steps
            if (stepSelection) stepSelection.classList.remove('active');
            if (stepCart) stepCart.classList.remove('active');
            if (stepVerification) stepVerification.classList.remove('active');
            if (stepDispensing) stepDispensing.classList.remove('active');
            if (stepPickup) stepPickup.classList.remove('active');
        }, 10000); // 10 seconds to read completion message
    }
    
    // Error handling
    window.addEventListener('error', function(event) {
        console.error('Global error caught:', event.error);
    });
    
    // Initialize
    initializeUI();
});
