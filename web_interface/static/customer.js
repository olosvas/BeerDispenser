document.addEventListener('DOMContentLoaded', function() {
    // Get elements from the DOM
    
    // Beverage selection elements
    const beverageTypeSelection = document.getElementById('beverage-type-selection');
    const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
    const beverageTypeDisplay = document.getElementById('beverage-type-display').querySelector('span');
    const continueTypeBtn = document.getElementById('continue-type-btn');
    
    // Size selection elements
    const beverageSizeSelection = document.getElementById('beverage-size-selection');
    const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
    
    // Cart elements
    const cartIconContainer = document.getElementById('cart-icon-container');
    const cartCount = document.getElementById('cart-count');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const shoppingCart = document.getElementById('shopping-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotalItems = document.getElementById('cart-total-items');
    const continueShopping = document.getElementById('continue-shopping-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Progress tracking elements
    const progressContainer = document.getElementById('progress-container');
    const stepSelection = document.getElementById('step-selection');
    const stepCart = document.getElementById('step-cart');
    const stepVerification = document.getElementById('step-verification');
    const stepPayment = document.getElementById('step-payment');
    const stepDispensing = document.getElementById('step-dispensing');
    const stepPickup = document.getElementById('step-pickup');
    
    // Age verification elements
    const ageVerification = document.getElementById('age-verification');
    const verificationMethods = document.getElementById('verification-methods');
    const webcamVerifyBtn = document.getElementById('webcam-verify-btn');
    const idVerifyBtn = document.getElementById('id-verify-btn');
    
    // ID verification form elements
    const verificationForm = document.getElementById('verification-form');
    const backToMethodsBtn = document.getElementById('back-to-methods-btn');
    const verifyAgeBtn = document.getElementById('verify-age-btn');
    const idNumber = document.getElementById('id-number');
    const birthDate = document.getElementById('birth-date');
    const ageConfirmation = document.getElementById('age-confirmation');
    
    // Webcam verification elements
    const webcamVerification = document.getElementById('webcam-verification');
    const webcamResult = document.getElementById('webcam-result');
    const webcamContainer = document.getElementById('webcam-container');
    const webcamVideo = document.getElementById('webcam-video');
    const webcamCanvas = document.getElementById('webcam-canvas');
    const webcamPlaceholder = document.getElementById('webcam-placeholder');
    const webcamStartBtn = document.getElementById('webcam-start-btn');
    const webcamCaptureBtn = document.getElementById('webcam-capture-btn');
    const webcamBackBtn = document.getElementById('webcam-back-btn');
    const webcamResultMessage = document.getElementById('webcam-result-message');
    const webcamProceedBtn = document.getElementById('webcam-proceed-btn');
    const webcamRetryBtn = document.getElementById('webcam-retry-btn');
    const webcamControls = document.getElementById('webcam-controls');
    
    // Processing, error, and result elements
    const verificationProcessing = document.getElementById('verification-processing');
    const verificationError = document.getElementById('verification-error');
    const verificationErrorMessage = document.getElementById('verification-error-message');
    const errorBackBtn = document.getElementById('error-back-btn');
    
    // Payment elements
    const paymentScreen = document.getElementById('payment-screen');
    const paymentCartSummary = document.getElementById('payment-cart-summary');
    const paymentTotal = document.getElementById('payment-total');
    const paymentMethodOptions = document.querySelectorAll('.payment-method-option');
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    const processPaymentBtn = document.getElementById('process-payment-btn');
    const paymentProcessing = document.getElementById('payment-processing');

    // Dispensing elements
    const dispensing = document.getElementById('dispensing');
    const currentBeverageName = document.getElementById('current-beverage-name');
    const statusMessage = document.getElementById('status-message');
    const dispensingProgress = document.getElementById('dispensing-progress');
    const itemsProgress = document.getElementById('items-progress');
    const liquidEl = document.getElementById('liquid');
    const foamEl = document.getElementById('foam');
    
    // Order complete elements (the "ready" screen)
    const ready = document.getElementById('ready');
    const dispensedBeveragesList = document.getElementById('dispensed-beverages-list');
    const newOrderBtn = document.getElementById('new-order-btn');
    
    // Store selected options
    let selectedBeverageType = null;
    let selectedSize = null;
    let requiresAgeVerification = false;
    let webcamStream = null;
    let selectedPaymentMethod = null;
    
    // Cart data
    let cartItems = [];
    let dispensingQueue = [];
    let currentDispensingIndex = 0;
    
    // Initialize event listeners
    
    // Beverage type selection
    beverageTypeOptions.forEach(option => {
        if (option) {
            option.addEventListener('click', function() {
                // Remove 'selected' class from all options
                beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add 'selected' class to the clicked option
                this.classList.add('selected');
                
                // Store the selected beverage type
                selectedBeverageType = this.dataset.type;
                
                // Update the display
                beverageTypeDisplay.textContent = selectedBeverageType.charAt(0).toUpperCase() + selectedBeverageType.slice(1);
                
                // Enable the continue button
                continueTypeBtn.disabled = false;
            });
        }
    });
    
    // Beverage size selection
    beverageSizeOptions.forEach(option => {
        if (option) {
            option.addEventListener('click', function() {
                // Remove 'selected' class from all options
                beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add 'selected' class to the clicked option
                this.classList.add('selected');
                
                // Store the selected size
                selectedSize = this.dataset.size;
                
                // Enable the continue button
                addToCartBtn.disabled = false;
            });
        }
    });
    
    // Continue Type Button - Move to size selection
    if (continueTypeBtn) {
        continueTypeBtn.addEventListener('click', function() {
            beverageTypeSelection.classList.add('d-none');
            beverageSizeSelection.classList.remove('d-none');
        });
    }
    
    // Back to Type Selection
    if (backToTypeBtn) {
        backToTypeBtn.addEventListener('click', function() {
            beverageSizeSelection.classList.add('d-none');
            beverageTypeSelection.classList.remove('d-none');
        });
    }
    
    // Add to cart button
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // Create new cart item
            const cartItem = {
                id: Date.now(), // unique id
                type: selectedBeverageType,
                size: selectedSize,
                isAlcoholic: selectedBeverageType === 'beer' // assuming only beer is alcoholic
            };
            
            // Add to cart
            cartItems.push(cartItem);
            
            // Update cart UI
            updateCartUI();
            
            // Show cart navigation elements
            cartIconContainer.classList.remove('d-none');
            viewCartFromSizeBtn.classList.remove('d-none');
            
            // Reset selection
            beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
            addToCartBtn.disabled = true;
            
            // Show feedback to user
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success alert-dismissible fade show';
            alertDiv.innerHTML = `
                <strong>Added to cart!</strong> ${selectedBeverageType.charAt(0).toUpperCase() + selectedBeverageType.slice(1)} (${selectedSize}ml)
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            
            beverageSizeSelection.insertBefore(alertDiv, beverageSizeSelection.firstChild);
            
            // Auto-dismiss after 3 seconds
            setTimeout(() => {
                alertDiv.classList.remove('show');
                setTimeout(() => alertDiv.remove(), 150);
            }, 3000);
            
            // Reset selected beverage size
            selectedSize = null;
        });
    }
    
    // View cart from size selection
    if (viewCartFromSizeBtn) {
        viewCartFromSizeBtn.addEventListener('click', function() {
            showCartScreen();
        });
    }
    
    // View cart button
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', function() {
            showCartScreen();
        });
    }
    
    // Continue shopping button
    if (continueShopping) {
        continueShopping.addEventListener('click', function() {
            // Hide cart, show beverage selection
            shoppingCart.classList.add('d-none');
            beverageTypeSelection.classList.remove('d-none');
            
            // Reset progress steps
            stepSelection.classList.remove('completed');
            stepSelection.classList.add('active');
            stepCart.classList.remove('active', 'completed');
            progressContainer.classList.add('d-none');
        });
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            // Check if verification is needed
            const needsVerification = cartItems.some(item => item.isAlcoholic);
            
            // Show progress steps
            stepCart.classList.remove('active');
            stepCart.classList.add('completed');
            
            if (needsVerification) {
                stepVerification.classList.add('active');
                ageVerification.classList.remove('d-none');
                shoppingCart.classList.add('d-none');
                requiresAgeVerification = true;
            } else {
                // Skip verification, go to payment
                stepVerification.classList.remove('active');
                stepPayment.classList.add('active');
                showPaymentScreen();
            }
        });
    }
    
    // Payment method selection
    paymentMethodOptions.forEach(option => {
        if (option) {
            option.addEventListener('click', function() {
                // Remove 'selected' class from all options
                paymentMethodOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add 'selected' class to the clicked option
                this.classList.add('selected');
                
                // Store the selected payment method
                selectedPaymentMethod = this.dataset.method;
                
                // Enable the process payment button
                processPaymentBtn.disabled = false;
            });
        }
    });
    
    // Back to cart from payment
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', function() {
            paymentScreen.classList.add('d-none');
            shoppingCart.classList.remove('d-none');
            
            // Update progress steps
            stepPayment.classList.remove('active');
            stepCart.classList.add('active');
        });
    }
    
    // Process payment button
    if (processPaymentBtn) {
        processPaymentBtn.addEventListener('click', function() {
            // Show payment processing
            paymentScreen.classList.add('d-none');
            paymentProcessing.classList.remove('d-none');
            
            // Simulate payment processing
            setTimeout(() => {
                // Hide payment processing
                paymentProcessing.classList.add('d-none');
                
                // Update progress steps
                stepPayment.classList.remove('active');
                stepPayment.classList.add('completed');
                stepDispensing.classList.add('active');
                
                // Prepare dispensing queue
                dispensingQueue = [...cartItems];
                currentDispensingIndex = 0;
                
                // Start dispensing process
                startDispensing();
            }, 3000);
        });
    }
    
    // ID Verification Method Button
    if (idVerifyBtn) {
        idVerifyBtn.addEventListener('click', function() {
            verificationMethods.classList.add('d-none');
            verificationForm.classList.remove('d-none');
        });
    }
    
    // Back to Methods Button
    if (backToMethodsBtn) {
        backToMethodsBtn.addEventListener('click', function() {
            verificationForm.classList.add('d-none');
            verificationMethods.classList.remove('d-none');
        });
    }
    
    // Error Back Button
    if (errorBackBtn) {
        errorBackBtn.addEventListener('click', function() {
            verificationError.classList.add('d-none');
            verificationMethods.classList.remove('d-none');
        });
    }
    
    // ID Verification Form Submit
    if (verificationForm) {
        verificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!verificationForm.checkValidity()) {
                e.stopPropagation();
                verificationForm.classList.add('was-validated');
                return;
            }
            
            // Show processing state
            verificationForm.classList.add('d-none');
            verificationProcessing.classList.remove('d-none');
            
            // Send verification request (in real system - in our demo we'll just simulate success)
            setTimeout(() => {
                verificationProcessing.classList.add('d-none');
                
                // Proceed to payment
                ageVerification.classList.add('d-none');
                stepVerification.classList.remove('active');
                stepVerification.classList.add('completed');
                stepPayment.classList.add('active');
                
                showPaymentScreen();
            }, 2000);
        });
    }
    
    // Webcam Verification Button
    if (webcamVerifyBtn) {
        webcamVerifyBtn.addEventListener('click', function() {
            verificationMethods.classList.add('d-none');
            webcamVerification.classList.remove('d-none');
        });
    }
    
    // Webcam Back Button
    if (webcamBackBtn) {
        webcamBackBtn.addEventListener('click', function() {
            stopWebcam();
            webcamVerification.classList.add('d-none');
            webcamResult.classList.add('d-none');
            verificationMethods.classList.remove('d-none');
        });
    }
    
    // Webcam Start Button
    if (webcamStartBtn) {
        webcamStartBtn.addEventListener('click', function() {
            startWebcam();
        });
    }
    
    // Webcam Capture Button
    if (webcamCaptureBtn) {
        webcamCaptureBtn.addEventListener('click', function() {
            captureImage();
        });
    }
    
    // Webcam Retry Button
    if (webcamRetryBtn) {
        webcamRetryBtn.addEventListener('click', function() {
            webcamResult.classList.add('d-none');
            webcamProceedBtn.classList.add('d-none');
            if (webcamControls) webcamControls.classList.remove('d-none');
            startWebcam();
        });
    }
    
    // Webcam Proceed Button
    if (webcamProceedBtn) {
        webcamProceedBtn.addEventListener('click', function() {
            stopWebcam();
            webcamVerification.classList.add('d-none');
            webcamResult.classList.add('d-none');
            
            // Proceed to payment
            ageVerification.classList.add('d-none');
            stepVerification.classList.remove('active');
            stepVerification.classList.add('completed');
            stepPayment.classList.add('active');
            
            showPaymentScreen();
        });
    }
    
    // Verify Age Button - Handle ID verification submission
    if (verifyAgeBtn) {
        verifyAgeBtn.addEventListener('click', function() {
            // Form validation is handled by the form submit event
        });
    }
    
    // New Order Button - Reset to start
    if (newOrderBtn) {
        newOrderBtn.addEventListener("click", function() {
            // Reset to initial state
            resetUI();
        });
    }
    
    // Show cart screen and update UI
    function showCartScreen() {
        // Hide other sections, show cart
        beverageTypeSelection.classList.add('d-none');
        beverageSizeSelection.classList.add('d-none');
        shoppingCart.classList.remove('d-none');
        
        // Show progress steps
        progressContainer.classList.remove('d-none');
        stepSelection.classList.add('completed');
        stepSelection.classList.remove('active');
        stepCart.classList.add('active');
        
        // Update cart UI
        updateCartUI();
    }
    
    // Show payment screen
    function showPaymentScreen() {
        shoppingCart.classList.add('d-none');
        paymentScreen.classList.remove('d-none');
        
        // Update payment summary
        updatePaymentSummary();
    }
    
    // Update cart UI based on current items
    function updateCartUI() {
        // Update count badge
        cartCount.textContent = cartItems.length;
        cartTotalItems.textContent = cartItems.length;
        
        // Enable checkout button if cart has items
        checkoutBtn.disabled = cartItems.length === 0;
        
        // Show/hide empty cart message
        if (cartItems.length === 0) {
            emptyCartMessage.classList.remove('d-none');
            cartItemsContainer.querySelectorAll('.cart-item').forEach(item => item.remove());
        } else {
            emptyCartMessage.classList.add('d-none');
            
            // Clear existing items
            cartItemsContainer.querySelectorAll('.cart-item').forEach(item => item.remove());
            
            // Add each item to the cart
            cartItems.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item d-flex justify-content-between align-items-center py-2';
                cartItemElement.innerHTML = `
                    <div>
                        <h6 class="mb-0">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</h6>
                        <small class="text-muted">${item.size}ml</small>
                    </div>
                    <div>
                        <span class="badge ${item.isAlcoholic ? 'bg-info' : 'bg-success'}">
                            ${item.isAlcoholic ? 'Alcoholic' : 'Non-Alcoholic'}
                        </span>
                        <button class="btn btn-sm btn-outline-danger ms-2 remove-item-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                cartItemsContainer.appendChild(cartItemElement);
                
                // Add event listener to remove button
                const removeBtn = cartItemElement.querySelector('.remove-item-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        const itemId = parseInt(this.dataset.id);
                        removeCartItem(itemId);
                    });
                }
            });
        }
    }
    
    // Update payment summary
    function updatePaymentSummary() {
        // Clear existing items
        paymentCartSummary.innerHTML = '';
        
        // Add each item to the summary
        cartItems.forEach(item => {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'd-flex justify-content-between mb-2';
            summaryItem.innerHTML = `
                <span>${item.type.charAt(0).toUpperCase() + item.type.slice(1)} (${item.size}ml)</span>
                <span>${calculateItemPrice(item)}€</span>
            `;
            
            paymentCartSummary.appendChild(summaryItem);
        });
        
        // Update total
        paymentTotal.textContent = `${calculateTotalPrice()}€`;
    }
    
    // Calculate price for an item (just a simple demo calculation)
    function calculateItemPrice(item) {
        const basePrice = item.isAlcoholic ? 2.50 : 1.50;
        const sizeMultiplier = item.size === '500' ? 1.5 : 1;
        return (basePrice * sizeMultiplier).toFixed(2);
    }
    
    // Calculate total price
    function calculateTotalPrice() {
        return cartItems.reduce((total, item) => {
            return total + parseFloat(calculateItemPrice(item));
        }, 0).toFixed(2);
    }
    
    // Remove an item from the cart
    function removeCartItem(itemId) {
        cartItems = cartItems.filter(item => item.id !== itemId);
        updateCartUI();
    }
    
    // Start the dispensing process for multiple beverages
    function startDispensing() {
        // Show dispensing screen
        paymentProcessing.classList.add('d-none');
        dispensing.classList.remove('d-none');
        
        // Update initial UI
        updateDispensingUI();
        
        // Process next item in queue
        processNextBeverage();
    }
    
    // Process the next beverage in the queue
    function processNextBeverage() {
        if (currentDispensingIndex >= dispensingQueue.length) {
            // All beverages dispensed
            completeDispensing();
            return;
        }
        
        const item = dispensingQueue[currentDispensingIndex];
        const beverageName = `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} (${item.size}ml)`;
        
        // Update UI
        if (currentBeverageName) currentBeverageName.textContent = beverageName;
        if (statusMessage) statusMessage.textContent = 'Preparing...';
        if (itemsProgress) itemsProgress.textContent = `Item ${currentDispensingIndex + 1} of ${dispensingQueue.length}`;
        
        // Set appropriate beverage class for animation
        if (liquidEl) {
            liquidEl.classList.remove('beer', 'kofola', 'birel');
            liquidEl.classList.add(item.type);
        }
        
        // Reset liquid height
        if (liquidEl) liquidEl.style.height = '0%';
        if (foamEl) foamEl.style.bottom = '0%';
        
        // Update progress bar
        if (dispensingProgress) {
            dispensingProgress.style.width = '10%';
            dispensingProgress.setAttribute('aria-valuenow', '10');
        }
        
        // Simulate dispensing stages
        setTimeout(() => {
            // Cup dispensing
            if (statusMessage) statusMessage.textContent = 'Dispensing cup...';
            if (dispensingProgress) {
                dispensingProgress.style.width = '30%';
                dispensingProgress.setAttribute('aria-valuenow', '30');
            }
            
            setTimeout(() => {
                // Pouring
                if (statusMessage) statusMessage.textContent = `Pouring ${item.type}...`;
                if (dispensingProgress) {
                    dispensingProgress.style.width = '60%';
                    dispensingProgress.setAttribute('aria-valuenow', '60');
                }
                
                // Animate liquid
                if (liquidEl) liquidEl.style.height = '80%';
                if (foamEl && item.type === 'beer') foamEl.style.bottom = '80%';
                
                setTimeout(() => {
                    // Delivery
                    if (statusMessage) statusMessage.textContent = 'Delivering...';
                    if (dispensingProgress) {
                        dispensingProgress.style.width = '100%';
                        dispensingProgress.setAttribute('aria-valuenow', '100');
                    }
                    
                    // Send dispense request to server
                    fetch('/api/dispense', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            beverage_type: item.type,
                            volume_ml: item.size
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Dispensing response:', data);
                        
                        // Move to next item after a delay
                        setTimeout(() => {
                            currentDispensingIndex++;
                            processNextBeverage();
                        }, 1500);
                    })
                    .catch(error => {
                        console.error('Error dispensing:', error);
                        
                        // Continue anyway in demo
                        setTimeout(() => {
                            currentDispensingIndex++;
                            processNextBeverage();
                        }, 1500);
                    });
                }, 4000); // 4 second pour stage
            }, 2000); // 2 second cup dispensing
        }, 1000); // 1 second initial delay
    }
    
    // Update the dispensing UI based on progress
    function updateDispensingUI() {
        const percent = dispensingQueue.length > 0 
            ? Math.round((currentDispensingIndex / dispensingQueue.length) * 100) 
            : 0;
            
        if (dispensingProgress) {
            dispensingProgress.style.width = `${percent}%`;
            dispensingProgress.setAttribute('aria-valuenow', percent.toString());
        }
        
        if (itemsProgress) {
            itemsProgress.textContent = `Item ${currentDispensingIndex + 1} of ${dispensingQueue.length}`;
        }
    }
    
    // Complete the dispensing process
    function completeDispensing() {
        // Update progress steps
        stepDispensing.classList.remove('active');
        stepDispensing.classList.add('completed');
        stepPickup.classList.add('active');
        
        // Show complete screen
        dispensing.classList.add('d-none');
        ready.classList.remove('d-none');
        
        // Generate unique order ID
        const orderId = `#${Math.floor(Math.random() * 10000)}`;
        document.getElementById('ready-order-id').textContent = orderId;
        
        // Display dispensed beverages
        if (dispensedBeveragesList) {
            dispensedBeveragesList.innerHTML = '';
            dispensingQueue.forEach(item => {
                const listItem = document.createElement('div');
                listItem.innerHTML = `<strong>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}:</strong> ${item.size}ml<br>`;
                dispensedBeveragesList.appendChild(listItem);
            });
        }
    }
    
    // Function to start webcam
    function startWebcam() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Hide placeholder, show video
            if (webcamPlaceholder) webcamPlaceholder.style.display = 'none';
            if (webcamVideo) webcamVideo.style.display = 'block';
            
            // Access webcam
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    webcamStream = stream;
                    if (webcamVideo) webcamVideo.srcObject = stream;
                    if (webcamCaptureBtn) webcamCaptureBtn.disabled = false;
                    if (webcamStartBtn) webcamStartBtn.disabled = true;
                })
                .catch(function(error) {
                    console.error('Error accessing webcam:', error);
                    if (webcamPlaceholder) webcamPlaceholder.innerHTML = `
                        <i class="fas fa-exclamation-circle fa-3x text-danger mb-2"></i>
                        <span class="text-danger">Could not access camera</span>
                    `;
                });
        } else {
            console.error('getUserMedia not supported');
            if (webcamPlaceholder) webcamPlaceholder.innerHTML = `
                <i class="fas fa-exclamation-circle fa-3x text-danger mb-2"></i>
                <span class="text-danger">Camera not supported by your browser</span>
            `;
        }
    }
    
    // Function to stop webcam
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
        
        if (webcamVideo) webcamVideo.style.display = 'none';
        if (webcamStartBtn) webcamStartBtn.disabled = false;
        if (webcamCaptureBtn) webcamCaptureBtn.disabled = true;
        if (webcamPlaceholder) {
            webcamPlaceholder.style.display = 'flex';
            webcamPlaceholder.innerHTML = `
                <i class="fas fa-camera fa-3x text-muted mb-2"></i>
                <span class="text-muted">Camera inactive</span>
            `;
        }
    }
    
    // Function to capture image from webcam
    function captureImage() {
        if (!webcamVideo || !webcamCanvas) return;
        
        // Show canvas, hide video
        webcamCanvas.style.display = 'block';
        webcamVideo.style.display = 'none';
        
        // Set canvas dimensions
        webcamCanvas.width = webcamVideo.videoWidth;
        webcamCanvas.height = webcamVideo.videoHeight;
        
        // Draw video frame to canvas
        const ctx = webcamCanvas.getContext('2d');
        ctx.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
        
        // Hide capture controls
        if (webcamControls) webcamControls.classList.add('d-none');
        
        // Show processing message
        webcamResult.classList.remove('d-none');
        const resultAlert = webcamResult.querySelector('.alert');
        if (resultAlert) {
            resultAlert.className = 'alert alert-info';
            resultAlert.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status"></div> Processing image...';
        }
        
        // Get image data for sending to server (in a real app)
        // const imageData = webcamCanvas.toDataURL('image/jpeg');
        
        // Simulate age verification with the server
        setTimeout(function() {
            // Always approve in this demo
            const approved = true;
            
            if (approved) {
                if (resultAlert) {
                    resultAlert.className = 'alert alert-success';
                    resultAlert.innerHTML = '<i class="fas fa-check-circle me-2"></i> Verification successful!';
                }
                
                if (webcamProceedBtn) webcamProceedBtn.classList.remove('d-none');
            } else {
                if (resultAlert) {
                    resultAlert.className = 'alert alert-danger';
                    resultAlert.innerHTML = '<i class="fas fa-times-circle me-2"></i> Verification failed. Please try again.';
                }
            }
        }, 2500);
    }
    
    // Reset the UI to initial state
    function resetUI() {
        // Reset selection state
        selectedBeverageType = null;
        selectedSize = null;
        requiresAgeVerification = false;
        selectedPaymentMethod = null;
        
        // Reset cart
        cartItems = [];
        dispensingQueue = [];
        currentDispensingIndex = 0;
        
        // Reset selection highlights
        beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
        beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
        paymentMethodOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Reset buttons
        if (continueTypeBtn) continueTypeBtn.disabled = true;
        if (addToCartBtn) addToCartBtn.disabled = true;
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (processPaymentBtn) processPaymentBtn.disabled = true;
        
        // Reset step indicators
        if (stepSelection) stepSelection.classList.remove('completed');
        if (stepSelection) stepSelection.classList.add('active');
        if (stepCart) stepCart.classList.remove('active', 'completed');
        if (stepVerification) stepVerification.classList.remove('active', 'completed');
        if (stepPayment) stepPayment.classList.remove('active', 'completed');
        if (stepDispensing) stepDispensing.classList.remove('active', 'completed');
        if (stepPickup) stepPickup.classList.remove('active');
        
        // Reset displays
        if (beverageTypeDisplay) beverageTypeDisplay.textContent = 'None';
        if (cartCount) cartCount.textContent = '0';
        
        // Reset form
        if (verificationForm) {
            verificationForm.reset();
            verificationForm.classList.remove('was-validated');
        }
        
        // Reset webcam state
        stopWebcam();
        if (webcamResult) webcamResult.classList.add('d-none');
        
        // Reset liquid animation
        if (liquidEl) {
            liquidEl.style.height = '0%';
            liquidEl.classList.remove('beer', 'kofola', 'birel');
        }
        if (foamEl) foamEl.style.bottom = '0%';
        
        // Show initial screen, hide others
        if (beverageTypeSelection) beverageTypeSelection.classList.remove('d-none');
        if (beverageSizeSelection) beverageSizeSelection.classList.add('d-none');
        if (ageVerification) ageVerification.classList.add('d-none');
        if (dispensing) dispensing.classList.add('d-none');
        if (ready) ready.classList.add('d-none');
        if (progressContainer) progressContainer.classList.add('d-none');
        if (shoppingCart) shoppingCart.classList.add('d-none');
        if (paymentScreen) paymentScreen.classList.add('d-none');
        if (paymentProcessing) paymentProcessing.classList.add('d-none');
        if (verificationMethods) verificationMethods.classList.remove('d-none');
        if (verificationForm) verificationForm.classList.add('d-none');
        if (webcamVerification) webcamVerification.classList.add('d-none');
        if (verificationProcessing) verificationProcessing.classList.add('d-none');
        if (verificationError) verificationError.classList.add('d-none');
        if (cartIconContainer) cartIconContainer.classList.add('d-none');
        if (viewCartFromSizeBtn) viewCartFromSizeBtn.classList.add('d-none');
    }
    
    // Initialize UI
    resetUI();
});