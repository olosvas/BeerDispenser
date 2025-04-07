document.addEventListener('DOMContentLoaded', function() {
    // State
    let selectedBeverageType = null;
    let selectedSize = null;
    let cartItems = [];
    let orderInProgress = false;
    
    // Function to save current state to server
    function saveStateToServer() {
        fetch('/customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cart_items: cartItems,
                selected_beverage: selectedBeverageType,
                selected_size: selectedSize,
                current_screen: getCurrentScreen()
            })
        })
        .then(response => response.json())
        .then(data => console.log('State saved to server'))
        .catch(error => console.error('Error saving state:', error));
    }
    
    // Function to determine current active screen
    function getCurrentScreen() {
        if (beverageTypeSelection && !beverageTypeSelection.classList.contains('d-none')) {
            return 'beverage-type';
        } else if (beverageSizeSelection && !beverageSizeSelection.classList.contains('d-none')) {
            return 'beverage-size';
        } else if (document.getElementById('shopping-cart') && !document.getElementById('shopping-cart').classList.contains('d-none')) {
            return 'shopping-cart';
        } else if (document.getElementById('payment-screen') && !document.getElementById('payment-screen').classList.contains('d-none')) {
            return 'payment';
        } else if (ageVerification && !ageVerification.classList.contains('d-none')) {
            return 'age-verification';
        } else if (dispensing && !dispensing.classList.contains('d-none')) {
            return 'dispensing';
        } else if (ready && !ready.classList.contains('d-none')) {
            return 'complete';
        }
        return 'beverage-type'; // Default to first screen
    }
    
    // Function to restore UI based on saved state
    function restoreUIState(screenName) {
        console.log('Restoring UI state to:', screenName);
        
        // Hide all screens first
        hideAllScreens();
        
        // Show the appropriate screen
        if (screenName === 'beverage-type') {
            beverageTypeSelection.classList.remove('d-none');
            progressContainer.classList.add('d-none');
        } else if (screenName === 'beverage-size') {
            beverageSizeSelection.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('active');
        } else if (screenName === 'shopping-cart') {
            const shoppingCart = document.getElementById('shopping-cart');
            if (shoppingCart) {
                shoppingCart.classList.remove('d-none');
                progressContainer.classList.remove('d-none');
                stepSelection.classList.add('completed');
                document.getElementById('step-cart').classList.add('active');
            }
        } else if (screenName === 'payment') {
            const paymentScreen = document.getElementById('payment-screen');
            if (paymentScreen) {
                paymentScreen.classList.remove('d-none');
                progressContainer.classList.remove('d-none');
                stepSelection.classList.add('completed');
                document.getElementById('step-cart').classList.add('completed');
                document.getElementById('step-payment').classList.add('active');
            }
        } else if (screenName === 'age-verification') {
            ageVerification.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('completed');
            stepVerification.classList.add('active');
        } else if (screenName === 'dispensing') {
            dispensing.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('completed');
            stepVerification.classList.add('completed');
            stepDispensing.classList.add('active');
        } else if (screenName === 'complete') {
            ready.classList.remove('d-none');
            progressContainer.classList.remove('d-none');
            stepSelection.classList.add('completed');
            stepVerification.classList.add('completed');
            stepDispensing.classList.add('completed');
            stepPickup.classList.add('active');
        }
    }
    
    // Hide all screens
    function hideAllScreens() {
        beverageTypeSelection.classList.add('d-none');
        beverageSizeSelection.classList.add('d-none');
        const shoppingCart = document.getElementById('shopping-cart');
        if (shoppingCart) shoppingCart.classList.add('d-none');
        const paymentScreen = document.getElementById('payment-screen');
        if (paymentScreen) paymentScreen.classList.add('d-none');
        ageVerification.classList.add('d-none');
        dispensing.classList.add('d-none');
        ready.classList.add('d-none');
    }
    
    // Elements - Selection
    const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
    const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const continueSizeBtn = document.getElementById('continue-size-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const backToSizeBtn = document.getElementById('back-to-size-btn');
    const beverageTypeDisplay = document.getElementById('beverage-type-display').querySelector('span');
    
    // Elements - Sections
    const progressContainer = document.getElementById('progress-container');
    const beverageTypeSelection = document.getElementById('beverage-type-selection');
    const beverageSizeSelection = document.getElementById('beverage-size-selection');
    const ageVerification = document.getElementById('age-verification');
    const dispensing = document.getElementById('dispensing');
    const ready = document.getElementById('ready');
    
    // Elements - Age Verification
    const verificationMethods = document.getElementById("verification-methods");
    const orderSummary = document.getElementById("order-summary");
    const verifyAgeBtn = document.getElementById("verify-age-btn");
    const verificationForm = document.getElementById("verification-form");
    const webcamVerification = document.getElementById("webcam-verification");
    const webcamCanvas = document.getElementById("webcam-canvas");
    const webcamPlaceholder = document.getElementById("webcam-placeholder");
    const webcamStartBtn = document.getElementById("webcam-start-btn");
    const webcamCaptureBtn = document.getElementById("webcam-capture-btn");
    const webcamBackBtn = document.getElementById("webcam-back-btn");
    const webcamResult = document.getElementById("webcam-result");
    const webcamResultMessage = document.getElementById("webcam-result-message");
    const webcamProceedBtn = document.getElementById("webcam-proceed-btn");
    const webcamRetryBtn = document.getElementById("webcam-retry-btn");
    const webcamVideo = document.getElementById("webcam-video");

    // State for webcam
    let webcamStream = null;
    let capturedImage = null;
    const verificationProcessing = document.getElementById('verification-processing');
    const verificationError = document.getElementById('verification-error');
    const verificationErrorMessage = document.getElementById('verification-error-message');
    
    // Elements - Dispensing
    const dispensingStepCup = document.getElementById('dispensing-step-cup');
    const dispensingStepPour = document.getElementById('dispensing-step-pour');
    const dispensingStepDeliver = document.getElementById('dispensing-step-deliver');
    const dispensingError = document.getElementById('dispensing-error');
    const dispensingErrorMessage = document.getElementById('dispensing-error-message');
    const liquid = document.getElementById('liquid');
    const foam = document.getElementById('foam');
    
    // Elements - Ready
    const readyBeverageType = document.getElementById('ready-beverage-type');
    const readyBeverageSize = document.getElementById('ready-beverage-size');
    const readyOrderId = document.getElementById('ready-order-id');
    const newOrderBtn = document.getElementById('new-order-btn');
    
    // Elements - Progress Steps
    const stepSelection = document.getElementById('step-selection');
    const stepVerification = document.getElementById('step-verification');
    const stepDispensing = document.getElementById('step-dispensing');
    const stepPickup = document.getElementById('step-pickup');
    
    // Beverage Type Selection
    beverageTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedBeverageType = this.dataset.type;
            continueTypeBtn.disabled = false;
            
            // Update beverage type display
            const beverageName = this.querySelector('h3').textContent;
            beverageTypeDisplay.textContent = beverageName;
        });
    });
    
    // Beverage Size Selection
    beverageSizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedSize = this.dataset.size;
            continueSizeBtn.disabled = false;
        });
    });
    
    // Continue Type Button - Go to size selection
    continueTypeBtn.addEventListener('click', function() {
        beverageTypeSelection.classList.add('d-none');
        beverageSizeSelection.classList.remove('d-none');
        progressContainer.classList.remove('d-none');
        stepSelection.classList.add('active');
    });
    
    // Back to Type Selection
    backToTypeBtn.addEventListener('click', function() {
        beverageSizeSelection.classList.add('d-none');
        beverageTypeSelection.classList.remove('d-none');
        progressContainer.classList.add('d-none');
        stepSelection.classList.remove('active');
    });
    
    // Continue Size Button - Start dispensing or trigger age verification
    continueSizeBtn.addEventListener('click', function() {
        fetch('/api/dispense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                beverage_type: selectedBeverageType,
                size: selectedSize
            })
        })
        .then(response => {
            if (response.status === 403) {
                // Age verification is required
                beverageSizeSelection.classList.add('d-none');
                ageVerification.classList.remove('d-none');
                stepSelection.classList.remove('active');
                stepSelection.classList.add('completed');
                stepVerification.classList.add('active');
                return Promise.reject('age_verification_required');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // No age verification needed, beverage dispensing started directly
                // Skip age verification step and go directly to dispensing
                beverageSizeSelection.classList.add('d-none');
                dispensing.classList.remove('d-none');
                stepSelection.classList.remove('active');
                stepSelection.classList.add('completed');
                stepVerification.classList.add('completed');
                stepDispensing.classList.add('active');
                
                // Reset dispensing animation
                liquid.style.height = '0%';
                foam.style.bottom = '100%';
                
                // Start monitoring the order
                orderInProgress = true;
                monitorOrderProgress();
            } else {
                // Error starting dispensing
                dispensingErrorMessage.textContent = data.message || 'Failed to start the order. Please try again.';
                dispensingError.classList.remove('d-none');
            }
        })
        .catch(error => {
            // If this is not the expected age verification redirect, show an error
            if (error !== 'age_verification_required') {
                console.error('Error:', error);
                dispensingErrorMessage.textContent = 'An error occurred. Please try again.';
                dispensingError.classList.remove('d-none');
            }
        });
    });
    
    // Back to Size Selection
    backToSizeBtn.addEventListener('click', function() {
        ageVerification.classList.add('d-none');
        beverageSizeSelection.classList.remove('d-none');
        stepVerification.classList.remove('active');
        stepSelection.classList.remove('completed');
        stepSelection.classList.add('active');
    });
    
    // Verification method selection
    document.getElementById("webcam-verify-btn").addEventListener("click", function() {
        verificationMethods.classList.add("d-none");
        webcamVerification.classList.remove("d-none");
        resetWebcam();
    });
    
    document.getElementById("id-verify-btn").addEventListener("click", function() {
        verificationMethods.classList.add("d-none");
        verificationForm.classList.remove("d-none");
    });
    
    // Back button handlers
    document.getElementById("back-to-methods-btn").addEventListener("click", function() {
        verificationForm.classList.add("d-none");
        verificationMethods.classList.remove("d-none");
    });
    
    webcamBackBtn.addEventListener("click", function() {
        stopWebcam();
        webcamVerification.classList.add("d-none");
        verificationMethods.classList.remove("d-none");
    });
    
    document.getElementById("error-back-btn").addEventListener("click", function() {
        verificationError.classList.add("d-none");
        verificationMethods.classList.remove("d-none");
    });

    // Webcam control buttons
    webcamStartBtn.addEventListener("click", function() {
        startWebcam();
    });
    
    webcamCaptureBtn.addEventListener("click", function() {
        captureWebcamImage();
    });
    
    webcamRetryBtn.addEventListener("click", function() {
        resetWebcam();
    });
    
    webcamProceedBtn.addEventListener("click", function() {
        // We have a successful age verification, proceed to dispensing
        stopWebcam();
        startDispensing();
    });
    
    // Verify Age and Start Order
    verifyAgeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Simple form validation
        const idNumber = document.getElementById('id-number').value;
        const birthDate = document.getElementById('birth-date').value;
        const ageConfirmation = document.getElementById('age-confirmation').checked;
        
        if (!idNumber || !birthDate || !ageConfirmation) {
            verificationForm.classList.add('was-validated');
            return;
        }
        
        // Show processing state
        verificationForm.classList.add('d-none');
        verificationProcessing.classList.remove('d-none');
        verificationError.classList.add('d-none');
        
        // API call to verify age
        const verificationData = {
            id_number: idNumber,
            birth_date: birthDate,
            beverage_type: selectedBeverageType
        };
        
        fetch('/api/verify_age', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(verificationData)
        })
        .then(response => response.json())
        .then(data => {
            verificationProcessing.classList.add('d-none');
            
            if (data.success) {
                // Age successfully verified, proceed to dispensing
                startDispensing();
            } else {
                // Verification failed
                verificationError.classList.remove('d-none');
                verificationErrorMessage.textContent = data.message || 'Age verification failed. Please try another method.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            verificationProcessing.classList.add('d-none');
            verificationError.classList.remove('d-none');
            verificationErrorMessage.textContent = 'An error occurred. Please try again.';
        });
    });
    
    // Start dispensing process
    function startDispensing() {
        // Hide verification and show dispensing UI
        ageVerification.classList.add('d-none');
        dispensing.classList.remove('d-none');
        
        // Update progress steps
        stepVerification.classList.remove('active');
        stepVerification.classList.add('completed');
        stepDispensing.classList.add('active');
        
        // Reset dispensing animation
        liquid.style.height = '0%';
        foam.style.bottom = '100%';
        
        // Start the dispensing process via API
        fetch('/api/dispense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                beverage_type: selectedBeverageType,
                size: selectedSize,
                age_verified: true
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                orderInProgress = true;
                monitorOrderProgress();
            } else {
                dispensingErrorMessage.textContent = data.message || 'Failed to start dispensing. Please try again.';
                dispensingError.classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            dispensingErrorMessage.textContent = 'An error occurred. Please try again.';
            dispensingError.classList.remove('d-none');
        });
    }
    
    // Monitor order progress
    function monitorOrderProgress() {
        if (!orderInProgress) return;
        
        fetch('/api/order_status')
        .then(response => response.json())
        .then(data => {
            updateDispenseUI(data);
            
            if (data.status === 'completed') {
                orderInProgress = false;
                showOrderComplete(data);
            } else if (data.status === 'error') {
                orderInProgress = false;
                dispensingErrorMessage.textContent = data.message || 'An error occurred during dispensing.';
                dispensingError.classList.remove('d-none');
            } else {
                // Continue polling if order is still in progress
                setTimeout(monitorOrderProgress, 1000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setTimeout(monitorOrderProgress, 2000);  // Retry with longer delay on error
        });
    }
    
    // Update dispensing UI based on status
    function updateDispenseUI(state) {
        // Reset all steps to default state
        dispensingStepCup.classList.remove('completed', 'in-progress', 'error');
        dispensingStepPour.classList.remove('completed', 'in-progress', 'error');
        dispensingStepDeliver.classList.remove('completed', 'in-progress', 'error');
        
        const step = state.step || '';
        const progress = state.progress || 0;
        
        // Update cup dispensing step
        if (step === 'cup_dispensing' || step === 'pouring' || step === 'delivery' || step === 'completed') {
            dispensingStepCup.classList.add('completed');
        }
        
        // Update pouring step
        if (step === 'pouring') {
            dispensingStepPour.classList.add('in-progress');
            // Animate liquid level based on progress
            liquid.style.height = `${progress * 0.7}%`;  // Fill to 70% with liquid
            if (progress > 70) {
                // Start showing foam after 70% progress
                const foamProgress = (progress - 70) * (100 / 30);  // Scale to 0-100% for the remaining 30%
                foam.style.bottom = `${70 - Math.min(20, foamProgress * 0.2)}%`;  // Foam fills the top 20%
            }
        } else if (step === 'delivery' || step === 'completed') {
            dispensingStepPour.classList.add('completed');
            liquid.style.height = '70%';
            foam.style.bottom = '50%';
        }
        
        // Update delivery step
        if (step === 'delivery') {
            dispensingStepDeliver.classList.add('in-progress');
        } else if (step === 'completed') {
            dispensingStepDeliver.classList.add('completed');
        }
        
        // Handle errors
        if (state.status === 'error') {
            if (state.error_step === 'cup_dispensing') {
                dispensingStepCup.classList.add('error');
            } else if (state.error_step === 'pouring') {
                dispensingStepPour.classList.add('error');
            } else if (state.error_step === 'delivery') {
                dispensingStepDeliver.classList.add('error');
            }
        }
    }
    
    // Show order complete screen
    function showOrderComplete(data) {
        dispensing.classList.add('d-none');
        ready.classList.remove('d-none');
        
        // Update progress steps
        stepDispensing.classList.remove('active');
        stepDispensing.classList.add('completed');
        stepPickup.classList.add('active');
        
        // Update order details
        const beverageNames = {
            'beer': 'Beer',
            'kofola': 'Kofola',
            'birel': 'Birel'
        };
        
        readyBeverageType.textContent = beverageNames[selectedBeverageType] || selectedBeverageType;
        readyBeverageSize.textContent = selectedSize + ' ml';
        readyOrderId.textContent = data.order_id || 'N/A';
    }
    
    // New order button
    newOrderBtn.addEventListener('click', function() {
        // Reset state and UI
        selectedBeverageType = null;
        selectedSize = null;
        
        // Reset selection states
        beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
        beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
        continueTypeBtn.disabled = true;
        continueSizeBtn.disabled = true;
        
        // Reset progress steps
        stepSelection.classList.remove('completed', 'active');
        stepVerification.classList.remove('completed', 'active');
        stepDispensing.classList.remove('completed', 'active');
        stepPickup.classList.remove('completed', 'active');
        
        // Show the first screen
        hideAllScreens();
        beverageTypeSelection.classList.remove('d-none');
        progressContainer.classList.add('d-none');
    });
    
    // Webcam functions
    function startWebcam() {
        webcamPlaceholder.classList.add('d-none');
        webcamVideo.classList.remove('d-none');
        webcamStartBtn.classList.add('d-none');
        webcamCaptureBtn.classList.remove('d-none');
        
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                webcamStream = stream;
                webcamVideo.srcObject = stream;
            })
            .catch(err => {
                showWebcamError('Could not access the camera: ' + err.message);
            });
    }
    
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
    }
    
    function captureWebcamImage() {
        if (!webcamStream) {
            showWebcamError('Camera not active. Please start the camera first.');
            return;
        }
        
        // Draw video frame to canvas
        const context = webcamCanvas.getContext('2d');
        webcamCanvas.width = webcamVideo.videoWidth;
        webcamCanvas.height = webcamVideo.videoHeight;
        context.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
        
        // Get image data as base64
        capturedImage = webcamCanvas.toDataURL('image/jpeg');
        
        // Hide video and show captured image
        webcamVideo.classList.add('d-none');
        webcamCanvas.classList.remove('d-none');
        webcamCaptureBtn.classList.add('d-none');
        webcamResult.classList.remove('d-none');
        
        // Process the captured image for age verification
        processWebcamImage();
    }
    
    function processWebcamImage() {
        // Show loading state
        webcamResultMessage.textContent = 'Verifying your age...';
        webcamProceedBtn.classList.add('d-none');
        webcamRetryBtn.classList.add('d-none');
        
        fetch('/api/verify_age_webcam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: capturedImage,
                beverage_type: selectedBeverageType
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                webcamResultMessage.textContent = data.message || 'Age verification successful!';
                webcamResultMessage.classList.remove('text-danger');
                webcamResultMessage.classList.add('text-success');
                webcamProceedBtn.classList.remove('d-none');
                webcamRetryBtn.classList.add('d-none');
            } else {
                webcamResultMessage.textContent = data.message || 'Age verification failed.';
                webcamResultMessage.classList.remove('text-success');
                webcamResultMessage.classList.add('text-danger');
                webcamProceedBtn.classList.add('d-none');
                webcamRetryBtn.classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            webcamResultMessage.textContent = 'An error occurred during verification.';
            webcamResultMessage.classList.remove('text-success');
            webcamResultMessage.classList.add('text-danger');
            webcamProceedBtn.classList.add('d-none');
            webcamRetryBtn.classList.remove('d-none');
        });
    }
    
    function resetWebcam() {
        stopWebcam();
        
        // Reset UI elements
        webcamPlaceholder.classList.remove('d-none');
        webcamVideo.classList.add('d-none');
        webcamCanvas.classList.add('d-none');
        webcamResult.classList.add('d-none');
        
        webcamStartBtn.classList.remove('d-none');
        webcamCaptureBtn.classList.add('d-none');
        
        capturedImage = null;
    }
    
    function showWebcamError(message) {
        webcamResultMessage.textContent = message;
        webcamResultMessage.classList.remove('text-success');
        webcamResultMessage.classList.add('text-danger');
        webcamResult.classList.remove('d-none');
        webcamRetryBtn.classList.remove('d-none');
    }
    
    // Initialize UI based on server state
    let initialScreen = document.getElementById('current_screen') 
        ? document.getElementById('current_screen').value 
        : '';
        
    let selectedBeverageFromServer = document.getElementById('selected_beverage') 
        ? document.getElementById('selected_beverage').value 
        : '';
        
    let selectedSizeFromServer = document.getElementById('selected_size') 
        ? document.getElementById('selected_size').value 
        : '';
        
    // Apply server state if available
    if (selectedBeverageFromServer) {
        selectedBeverageType = selectedBeverageFromServer;
        // Find and select the beverage option
        beverageTypeOptions.forEach(option => {
            if (option.dataset.type === selectedBeverageType) {
                option.classList.add('selected');
                const beverageName = option.querySelector('h3').textContent;
                beverageTypeDisplay.textContent = beverageName;
                continueTypeBtn.disabled = false;
            }
        });
    }
    
    if (selectedSizeFromServer) {
        selectedSize = selectedSizeFromServer;
        // Find and select the size option
        beverageSizeOptions.forEach(option => {
            if (option.dataset.size === selectedSize) {
                option.classList.add('selected');
                continueSizeBtn.disabled = false;
            }
        });
    }
    
    if (initialScreen) {
        restoreUIState(initialScreen);
    // Add event listener for language switch to save state
    const languageSwitchBtn = document.getElementById("language-switch-btn");
    if (languageSwitchBtn) {
        languageSwitchBtn.addEventListener("click", function() {
            saveStateToServer();
        });
    }
});
