document.addEventListener('DOMContentLoaded', function() {
    // Global elements
    const bevTypeSelectionScreen = document.getElementById('beverage-type-selection');
    const sizeSelectionScreen = document.getElementById('size-selection');
    const quantitySelectionScreen = document.getElementById('quantity-selection');
    const cartScreen = document.getElementById('cart-review');
    const paymentScreen = document.getElementById('payment');
    const verificationScreen = document.getElementById('age-verification');
    const dispensingScreen = document.getElementById('dispensing');
    const orderCompleteScreen = document.getElementById('order-complete');
    
    // Progress bar steps
    const progressContainer = document.getElementById('progress-container');
    const stepSelection = document.getElementById('step-selection');
    const stepCart = document.getElementById('step-cart');
    const stepVerification = document.getElementById('step-verification');
    const stepPayment = document.getElementById('step-payment');
    const stepDispensing = document.getElementById('step-dispensing');
    const stepPickup = document.getElementById('step-pickup');
    
    // Beverage selection elements
    const beerBtn = document.getElementById('beer-btn');
    const kofolaBtn = document.getElementById('kofola-btn');
    const birelBtn = document.getElementById('birel-btn');
    
    // Size selection elements
    const smallBtn = document.getElementById('small-btn');
    const largeBtn = document.getElementById('large-btn');
    
    // Quantity selection elements
    const quantityValue = document.getElementById('quantity-value');
    const increaseBtn = document.getElementById('increase-btn');
    const decreaseBtn = document.getElementById('decrease-btn');
    
    // Cart elements
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const addMoreBtn = document.getElementById('add-more-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Verification elements
    const verificationMethods = document.getElementById('verification-methods');
    const webcamVerification = document.getElementById('webcam-verification');
    const webcamBtn = document.getElementById('webcam-btn');
    const idCardBtn = document.getElementById('id-card-btn');
    const webcamFeed = document.getElementById('webcam-feed');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const webcamResult = document.getElementById('webcam-result');
    const proceedBtn = document.getElementById('webcam-proceed-btn');
    
    // Current selections
    let currentBeverageType = null;
    let currentSize = null;
    let currentQuantity = 1;
    
    // Cart items
    let cartItems = [];
    
    // Video streaming
    let videoStream = null;
    let videoElement = null;
    
    // Webcam setup and functions
    function startWebcam() {
        videoElement = document.getElementById('webcam-feed');
        
        if (!videoElement) {
            console.error('Webcam feed element not found');
            return;
        }
        
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showWebcamError('Your browser does not support webcam access.');
            return;
        }
        
        // Attempt to get webcam access
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function(stream) {
                videoStream = stream;
                videoElement.srcObject = stream;
                
                // Show the capture button once webcam is ready
                const captureBtn = document.getElementById('capture-btn');
                if (captureBtn) captureBtn.classList.remove('d-none');
                
                // Hide any previous errors
                const errorElement = document.getElementById('webcam-error');
                if (errorElement) errorElement.classList.add('d-none');
            })
            .catch(function(error) {
                console.error('Error accessing webcam:', error);
                showWebcamError('Error accessing webcam: ' + error.message);
            });
    }
    
    function stopWebcam() {
        if (videoStream) {
            const tracks = videoStream.getTracks();
            tracks.forEach(track => track.stop());
            videoStream = null;
            
            if (videoElement) {
                videoElement.srcObject = null;
            }
        }
    }
    
    function captureWebcamImage() {
        if (!videoStream) {
            showWebcamError('Webcam not started.');
            return;
        }
        
        // Get the video element and create a canvas to capture the image
        const video = document.getElementById('webcam-feed');
        const capturedImage = document.getElementById('captured-image');
        const canvas = document.createElement('canvas');
        
        if (!video || !capturedImage) {
            console.error('Video or capture elements not found');
            return;
        }
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get the image data URL
        const imageDataURL = canvas.toDataURL('image/jpeg');
        
        // Display the captured image
        capturedImage.src = imageDataURL;
        capturedImage.classList.remove('d-none');
        
        // Hide webcam, show captured image
        video.classList.add('d-none');
        document.getElementById('capture-btn').classList.add('d-none');
        document.getElementById('retake-btn').classList.remove('d-none');
        
        // Show verification status
        const statusElement = document.getElementById('verification-status');
        if (statusElement) {
            statusElement.textContent = "Overujem vek...";
            statusElement.parentElement.classList.remove('d-none');
        }
        
        // Send image for verification
        sendImageForVerification(imageDataURL);
    }
    
    function resetWebcam() {
        // Hide captured image and show webcam feed
        const capturedImage = document.getElementById('captured-image');
        const webcamFeed = document.getElementById('webcam-feed');
        
        if (capturedImage) capturedImage.classList.add('d-none');
        if (webcamFeed) webcamFeed.classList.remove('d-none');
        
        // Show capture button, hide retake button
        const captureBtn = document.getElementById('capture-btn');
        const retakeBtn = document.getElementById('retake-btn');
        
        if (captureBtn) captureBtn.classList.remove('d-none');
        if (retakeBtn) retakeBtn.classList.add('d-none');
        
        // Hide verification status
        const statusContainer = document.querySelector('#verification-status').parentElement;
        if (statusContainer) statusContainer.classList.add('d-none');
    }
    
    function showWebcamError(message) {
        const errorElement = document.getElementById('webcam-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
    }
    
    function sendImageForVerification(imageDataURL) {
        // Determine the beverage type for verification (use the first item in cart)
        const beverageType = cartItems.length > 0 ? cartItems[0].beverage : 'beer';
        
        fetch('/api/verify_age', {
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
            console.log('Verification response:', data);
            
            const statusElement = document.getElementById('verification-status');
                
            if (data.verified) {
                // Success
                if (statusElement) {
                    statusElement.textContent = "Vek úspešne overený! Pokračujem na platbu...";
                    statusElement.parentElement.className = "alert alert-success";
                }
                
                // Show estimated age if available
                const ageElement = document.getElementById('estimated-age');
                if (ageElement && data.estimated_age) {
                    ageElement.textContent = `Odhadovaný vek: ${data.estimated_age} rokov`;
                }
                
                // We don't need the proceed button anymore
                // const proceedBtn = document.getElementById('webcam-proceed-btn');
                // if (proceedBtn) {
                //     proceedBtn.classList.remove('d-none');
                // }
                
                // Proceed to payment screen immediately
                setTimeout(() => {
                    hideAllScreens();
                    if (paymentScreen) paymentScreen.classList.remove('d-none');
                    if (stepPayment) stepPayment.classList.add('active');
                    
                    // Stop webcam
                    stopWebcam();
                    
                    // Show success message
                    displayMessage("Overenie veku úspešné! Prejdite k platbe.", "success");
                }, 1500);
            } else {
                // Failed verification
                if (statusElement) {
                    statusElement.textContent = data.message || "Overenie zlyhalo. Skúste znova alebo použite iný spôsob overenia.";
                    statusElement.parentElement.className = "alert alert-danger";
                }
                
                // Show retake button
                const retakeBtn = document.getElementById('retake-btn');
                if (retakeBtn) {
                    retakeBtn.classList.remove('d-none');
                }
            }
        })
        .catch(error => {
            console.error('Error during verification:', error);
            
            const statusElement = document.getElementById('verification-status');
            if (statusElement) {
                statusElement.textContent = "Chyba pri overovaní. Skúste znova.";
                statusElement.parentElement.className = "alert alert-danger";
            }
            
            // Show retake button
            const retakeBtn = document.getElementById('retake-btn');
            if (retakeBtn) {
                retakeBtn.classList.remove('d-none');
            }
        });
    }
    
    function initializeUI() {
        console.log("Initializing UI...");
        
        // Try to restore previous session state
        restoreUIState();
        
        // Attach event listeners
        attachEventListeners();
        
        // Hide all screens initially and show first screen
        hideAllScreens();
        if (bevTypeSelectionScreen) {
            bevTypeSelectionScreen.classList.remove('d-none');
            console.log("Showing beverage type selection screen");
        }
    }
    
    function attachEventListeners() {
        console.log("Attaching event listeners...");
        
        // Beverage selection
        if (beerBtn) beerBtn.addEventListener('click', () => selectBeverage('beer'));
        if (kofolaBtn) kofolaBtn.addEventListener('click', () => selectBeverage('kofola'));
        if (birelBtn) birelBtn.addEventListener('click', () => selectBeverage('birel'));
        
        // Size selection
        if (smallBtn) smallBtn.addEventListener('click', () => selectSize(300));
        if (largeBtn) largeBtn.addEventListener('click', () => selectSize(500));
        
        // Quantity selection
        if (increaseBtn) increaseBtn.addEventListener('click', increaseQuantity);
        if (decreaseBtn) decreaseBtn.addEventListener('click', decreaseQuantity);
        if (document.getElementById('quantity-confirm-btn')) 
            document.getElementById('quantity-confirm-btn').addEventListener('click', addToCart);
        
        // Cart interactions
        if (addMoreBtn) addMoreBtn.addEventListener('click', () => {
            hideAllScreens();
            if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
        });
        
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
            hideAllScreens();
            if (verificationScreen) verificationScreen.classList.remove('d-none');
            if (progressContainer) progressContainer.classList.remove('d-none');
            if (stepVerification) stepVerification.classList.add('active');
        });
        
        // Age verification
        if (webcamBtn) webcamBtn.addEventListener('click', () => {
            if (verificationMethods) verificationMethods.classList.add('d-none');
            if (webcamVerification) webcamVerification.classList.remove('d-none');
            startWebcam();
        });
        
        if (idCardBtn) idCardBtn.addEventListener('click', () => {
            // ID card verification would be implemented here
            // For now, simulate successful verification
            const statusElement = document.getElementById('verification-methods');
            statusElement.innerHTML = '<div class="alert alert-success">ID overené úspešne!</div>';
            
            // Proceed to payment after delay
            setTimeout(() => {
                hideAllScreens();
                if (paymentScreen) paymentScreen.classList.remove('d-none');
                if (stepPayment) stepPayment.classList.add('active');
            }, 1500);
        });
        
        if (captureBtn) captureBtn.addEventListener('click', captureWebcamImage);
        if (retakeBtn) retakeBtn.addEventListener('click', resetWebcam);
        if (proceedBtn) proceedBtn.addEventListener('click', () => {
            hideAllScreens();
            if (paymentScreen) paymentScreen.classList.remove('d-none');
            if (stepPayment) stepPayment.classList.add('active');
            
            // Stop webcam
            stopWebcam();
        });
        
        // Payment processing
        if (document.getElementById('pay-btn')) {
            document.getElementById('pay-btn').addEventListener('click', () => {
                // Simulate payment processing
                const paymentStatus = document.getElementById('payment-status');
                if (paymentStatus) {
                    paymentStatus.textContent = "Spracovávam platbu...";
                    paymentStatus.className = "alert alert-info";
                }
                
                // After successful payment, proceed to dispensing
                setTimeout(() => {
                    hideAllScreens();
                    if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                    if (stepDispensing) stepDispensing.classList.add('active');
                    
                    // Start dispensing
                    startDispensing();
                }, 2000);
            });
        }
        
        // Language switching
        const langBtns = document.querySelectorAll('.language-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.getAttribute('data-lang');
                
                fetch(`/set_language?lang=${lang}`, {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Reload the page to apply the new language
                        window.location.reload();
                    }
                });
            });
        });
        
        // Reset session button
        if (document.getElementById('reset-session-btn')) {
            document.getElementById('reset-session-btn').addEventListener('click', () => {
                fetch('/reset_session', {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Reset cart and UI
                        cartItems = [];
                        currentBeverageType = null;
                        currentSize = null;
                        currentQuantity = 1;
                        
                        // Reload the page
                        window.location.reload();
                    }
                });
            });
        }
    }
    
    function selectBeverage(type) {
        currentBeverageType = type;
        saveStateToServer();
        
        // Update the UI to show the selected beverage
        const beverageButtons = [beerBtn, kofolaBtn, birelBtn];
        beverageButtons.forEach(btn => {
            if (btn) btn.classList.remove('selected');
        });
        
        if (type === 'beer' && beerBtn) beerBtn.classList.add('selected');
        else if (type === 'kofola' && kofolaBtn) kofolaBtn.classList.add('selected');
        else if (type === 'birel' && birelBtn) birelBtn.classList.add('selected');
        
        // Move to size selection
        hideAllScreens();
        if (sizeSelectionScreen) sizeSelectionScreen.classList.remove('d-none');
    }
    
    function selectSize(size) {
        currentSize = size;
        saveStateToServer();
        
        // Update the UI to show the selected size
        if (smallBtn) smallBtn.classList.remove('selected');
        if (largeBtn) largeBtn.classList.remove('selected');
        
        if (size === 300 && smallBtn) smallBtn.classList.add('selected');
        else if (size === 500 && largeBtn) largeBtn.classList.add('selected');
        
        // Move to quantity selection
        hideAllScreens();
        if (quantitySelectionScreen) quantitySelectionScreen.classList.remove('d-none');
        if (quantityValue) quantityValue.textContent = currentQuantity;
    }
    
    function increaseQuantity() {
        if (currentQuantity < 5) { // Maximum 5 drinks at once
            currentQuantity++;
            if (quantityValue) quantityValue.textContent = currentQuantity;
        }
    }
    
    function decreaseQuantity() {
        if (currentQuantity > 1) {
            currentQuantity--;
            if (quantityValue) quantityValue.textContent = currentQuantity;
        }
    }
    
    function addToCart() {
        if (!currentBeverageType || !currentSize) {
            console.error('Cannot add to cart: beverage or size not selected');
            return;
        }
        
        // Create cart item
        const item = {
            beverage: currentBeverageType,
            size: currentSize,
            quantity: currentQuantity,
            price: calculatePrice(currentBeverageType, currentSize) * currentQuantity
        };
        
        // Add to cart
        cartItems.push(item);
        
        // Save cart state to server
        saveStateToServer();
        
        // Reset current selections
        currentQuantity = 1;
        
        // Update cart display
        updateCartDisplay();
        
        // Show cart screen
        hideAllScreens();
        if (cartScreen) cartScreen.classList.remove('d-none');
        if (progressContainer) progressContainer.classList.remove('d-none');
        if (stepSelection) stepSelection.classList.add('active');
        if (stepCart) stepCart.classList.add('active');
    }
    
    function calculatePrice(beverage, size) {
        const basePrice = (beverage === 'beer') ? 2.50 : (beverage === 'kofola' ? 1.50 : 2.00);
        return (size === 300) ? basePrice : basePrice * 1.5;
    }
    
    function updateCartDisplay() {
        if (!cartItemsContainer) return;
        
        // Clear current items
        cartItemsContainer.innerHTML = '';
        
        // Calculate total
        let total = 0;
        
        // Add each item to the display
        cartItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            // Format beverage name nicely
            let beverageName = item.beverage.charAt(0).toUpperCase() + item.beverage.slice(1);
            
            itemElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <span class="fw-bold">${beverageName}</span>
                        <span class="text-muted">${item.size}ml × ${item.quantity}</span>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="price me-3">${item.price.toFixed(2)}€</span>
                        <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemElement);
            
            // Add to total
            total += item.price;
        });
        
        // Update total display
        if (cartTotal) cartTotal.textContent = total.toFixed(2) + '€';
        
        // Add remove event listeners
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
        
        // Show/hide checkout button based on cart contents
        if (checkoutBtn) {
            checkoutBtn.style.display = cartItems.length > 0 ? 'block' : 'none';
        }
    }
    
    function removeFromCart(index) {
        if (index >= 0 && index < cartItems.length) {
            cartItems.splice(index, 1);
            updateCartDisplay();
            saveStateToServer();
        }
    }
    
    function saveStateToServer() {
        // Save the current state to the server
        fetch('/api/save_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentScreen: getCurrentScreen(),
                cartItems: cartItems,
                currentBeverageType: currentBeverageType,
                currentSize: currentSize,
                currentQuantity: currentQuantity
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Saved screen:', data.currentScreen);
        })
        .catch(error => {
            console.error('Error saving state:', error);
        });
    }
    
    function getCurrentScreen() {
        if (!bevTypeSelectionScreen) return null;
        
        if (!bevTypeSelectionScreen.classList.contains('d-none')) return 'beverage-type-selection';
        if (!sizeSelectionScreen.classList.contains('d-none')) return 'size-selection';
        if (!quantitySelectionScreen.classList.contains('d-none')) return 'quantity-selection';
        if (!cartScreen.classList.contains('d-none')) return 'cart-review';
        if (!verificationScreen.classList.contains('d-none')) return 'age-verification';
        if (!paymentScreen.classList.contains('d-none')) return 'payment';
        if (!dispensingScreen.classList.contains('d-none')) return 'dispensing';
        if (!orderCompleteScreen.classList.contains('d-none')) return 'order-complete';
        
        return null;
    }
    
    function restoreUIState(screenName) {
        fetch('/api/get_state')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.state) {
                    const state = data.state;
                    
                    // Restore cart items
                    if (state.cartItems && state.cartItems.length > 0) {
                        cartItems = state.cartItems;
                        updateCartDisplay();
                    }
                    
                    // Restore current selections
                    currentBeverageType = state.currentBeverageType;
                    currentSize = state.currentSize;
                    currentQuantity = state.currentQuantity || 1;
                    
                    // Restore previous screen if specified
                    if (screenName || state.currentScreen) {
                        const screenToShow = screenName || state.currentScreen;
                        console.log('Screen not found:', screenName, 'showing beverage-type-selection');
                        hideAllScreens();
                        
                        if (screenToShow === 'beverage-type-selection' && bevTypeSelectionScreen) 
                            bevTypeSelectionScreen.classList.remove('d-none');
                        else if (screenToShow === 'size-selection' && sizeSelectionScreen) 
                            sizeSelectionScreen.classList.remove('d-none');
                        else if (screenToShow === 'quantity-selection' && quantitySelectionScreen) 
                            quantitySelectionScreen.classList.remove('d-none');
                        else if (screenToShow === 'cart-review' && cartScreen) {
                            cartScreen.classList.remove('d-none');
                            if (progressContainer) progressContainer.classList.remove('d-none');
                            if (stepSelection) stepSelection.classList.add('active');
                            if (stepCart) stepCart.classList.add('active');
                        }
                        else if (screenToShow === 'age-verification' && verificationScreen) {
                            verificationScreen.classList.remove('d-none');
                            if (progressContainer) progressContainer.classList.remove('d-none');
                            if (stepSelection) stepSelection.classList.add('active');
                            if (stepCart) stepCart.classList.add('active');
                            if (stepVerification) stepVerification.classList.add('active');
                        }
                        else if (screenToShow === 'payment' && paymentScreen) {
                            paymentScreen.classList.remove('d-none');
                            if (progressContainer) progressContainer.classList.remove('d-none');
                            if (stepSelection) stepSelection.classList.add('active');
                            if (stepCart) stepCart.classList.add('active');
                            if (stepVerification) stepVerification.classList.add('active');
                            if (stepPayment) stepPayment.classList.add('active');
                        }
                        else if (screenToShow === 'dispensing' && dispensingScreen) {
                            dispensingScreen.classList.remove('d-none');
                            if (progressContainer) progressContainer.classList.remove('d-none');
                            if (stepSelection) stepSelection.classList.add('active');
                            if (stepCart) stepCart.classList.add('active');
                            if (stepVerification) stepVerification.classList.add('active');
                            if (stepPayment) stepPayment.classList.add('active');
                            if (stepDispensing) stepDispensing.classList.add('active');
                        }
                        else if (screenToShow === 'order-complete' && orderCompleteScreen) {
                            orderCompleteScreen.classList.remove('d-none');
                            if (progressContainer) progressContainer.classList.remove('d-none');
                            if (stepSelection) stepSelection.classList.add('active');
                            if (stepCart) stepCart.classList.add('active');
                            if (stepVerification) stepVerification.classList.add('active');
                            if (stepPayment) stepPayment.classList.add('active');
                            if (stepDispensing) stepDispensing.classList.add('active');
                            if (stepPickup) stepPickup.classList.add('active');
                        }
                        else {
                            // Default to first screen
                            if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
                        }
                    } else {
                        // Default to first screen
                        if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
                    }
                } else {
                    // No saved state, show first screen
                    if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
                }
            })
            .catch(error => {
                console.error('Error restoring state:', error);
                // Show first screen on error
                if (bevTypeSelectionScreen) bevTypeSelectionScreen.classList.remove('d-none');
            });
    }
    
    function hideAllScreens() {
        const screens = [
            bevTypeSelectionScreen,
            sizeSelectionScreen,
            quantitySelectionScreen,
            cartScreen,
            verificationScreen,
            paymentScreen,
            dispensingScreen,
            orderCompleteScreen
        ];
        
        screens.forEach(screen => {
            if (screen) screen.classList.add('d-none');
        });
    }
    
    function displayMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        messageContainer.appendChild(alertElement);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                messageContainer.removeChild(alertElement);
            }, 150); // Wait for fade out animation
        }, 5000);
    }
    
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
                statusElement.textContent = "Error communicating with server. Please seek assistance.";
                statusElement.className = "text-danger";
            }
        });
    }
    
    function monitorOrderProgress() {
        const statusElement = document.getElementById('dispensing-status');
        const progressElement = document.getElementById('dispensing-progress');
        
        let checkCount = 0;
        const maxChecks = 30; // Avoid infinite polling
        
        // Reset the progress and countdown at the start
        let dispensingComplete = false;
        
        // Poll the server for status updates
        const statusInterval = setInterval(() => {
            checkCount++;
            
            // If dispensing is already complete, don't make more requests
            if (dispensingComplete) {
                clearInterval(statusInterval);
                return;
            }
            
            fetch('/api/dispensing_status')
                .then(response => response.json())
                .then(data => {
                    // Update UI with status
                    updateDispenseUI(data);
                    
                    // Check if dispensing is complete
                    if (data.state === 'complete' || data.progress >= 100) {
                        dispensingComplete = true;
                        clearInterval(statusInterval);
                        showOrderComplete();
                    }
                    
                    // Check for timeout or errors
                    if (checkCount >= maxChecks || data.state === 'error') {
                        clearInterval(statusInterval);
                        dispensingComplete = true;
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
                        dispensingComplete = true;
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
