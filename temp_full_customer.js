document.addEventListener('DOMContentLoaded', function() {
    // State
    let selectedBeverageType = null;
    // State Management functions
    let cartItems = [];
    
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
        shoppingCart && shoppingCart.classList.add('d-none');
        paymentScreen && paymentScreen.classList.add('d-none');
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
    
    // Webcam elements
    
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
    // Continue Size Button - Start dispensing or trigger age verification
    continueSizeBtn.addEventListener('click', function() {
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
            if (data.verified) {
                // Age verified, start dispensing
                startDispensing();
            } else {
                // Age verification failed
                verificationErrorMessage.textContent = data.message || 'Age verification failed. You must be at least 18 years old.';
                verificationError.classList.remove('d-none');
                verificationForm.classList.remove('d-none');
                verificationProcessing.classList.add('d-none');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            verificationErrorMessage.textContent = 'An error occurred. Please try again.';
            verificationError.classList.remove('d-none');
            verificationForm.classList.remove('d-none');
            verificationProcessing.classList.add('d-none');
        });
    });
    
    // Start the dispensing process
    function startDispensing() {
        // Change to dispensing view
        ageVerification.classList.add('d-none');
        dispensing.classList.remove('d-none');
        stepVerification.classList.remove('active');
        stepVerification.classList.add('completed');
        stepDispensing.classList.add('active');
        
        // Reset dispensing animation
        liquid.style.height = '0%';
        foam.style.bottom = '100%';
        
        // Prepare order data
        const orderData = {
            beverage_type: selectedBeverageType,
            volume_ml: parseInt(selectedSize)
        };
        
        // Start the order
        orderInProgress = true;
        
        fetch('/api/dispense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Order started successfully
                monitorOrderProgress();
            } else {
                // Order failed to start
                dispensingErrorMessage.textContent = data.message || 'Failed to start the order. Please try again.';
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
        if (!orderInProgress) {
            return;
        }
        
        fetch('/api/state')
        .then(response => response.json())
        .then(data => {
            updateDispenseUI(data.state);
            
            if (data.state === 'idle') {
                // Order is complete
                showOrderComplete();
                orderInProgress = false;
            } else if (data.state === 'error') {
                // Order had an error
                dispensingErrorMessage.textContent = 'An error occurred during dispensing. Please try again or contact staff.';
                dispensingError.classList.remove('d-none');
                orderInProgress = false;
            } else {
                // Order still in progress, check again in a second
                setTimeout(monitorOrderProgress, 1000);
            }
        })
        .catch(error => {
            console.error('Error monitoring order:', error);
            setTimeout(monitorOrderProgress, 2000);  // Retry with a longer delay
        });
    }
    
    // Update the UI based on dispensing state
    function updateDispenseUI(state) {
        console.log('Current state:', state);
        
        if (state === 'dispensing_cup') {
            dispensingStepCup.innerHTML = '<i class="fas fa-circle-notch fa-spin text-primary me-2"></i> Dispensing cup...';
            dispensingStepPour.innerHTML = '<i class="fas fa-circle text-muted me-2"></i> Waiting to pour beverage...';
            dispensingStepDeliver.innerHTML = '<i class="fas fa-circle text-muted me-2"></i> Waiting for delivery...';
            
        } else if (state === 'pouring_beverage') {
            dispensingStepCup.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Cup dispensed';
            dispensingStepPour.innerHTML = '<i class="fas fa-circle-notch fa-spin text-primary me-2"></i> Pouring beverage...';
            dispensingStepDeliver.innerHTML = '<i class="fas fa-circle text-muted me-2"></i> Delivering to pickup station...';
            
            // Animate the beverage pouring
            liquid.style.height = '80%';
            foam.style.bottom = '80%';
            
        } else if (state === 'delivering_cup') {
            dispensingStepCup.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Cup dispensed';
            dispensingStepPour.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Beverage poured';
            dispensingStepDeliver.innerHTML = '<i class="fas fa-circle-notch fa-spin text-primary me-2"></i> Delivering to pickup station...';
            
        } else if (state === 'idle' && orderInProgress) {
            // Only update to completed if we're tracking an order
            dispensingStepCup.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Cup dispensed';
            dispensingStepPour.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Beverage poured';
            dispensingStepDeliver.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Delivered to pickup station';
        }
    }
    
    // Show order complete screen
    function showOrderComplete() {
        // Update completion screen
        readyBeverageType.textContent = beverageTypeDisplay.textContent;
        readyBeverageSize.textContent = selectedSize + 'ml';
        readyOrderId.textContent = '#' + Math.floor(Math.random() * 1000);
        
        // Change to complete view after a short delay
        setTimeout(function() {
            dispensing.classList.add('d-none');
            ready.classList.remove('d-none');
            stepDispensing.classList.remove('active');
            stepDispensing.classList.add('completed');
            stepPickup.classList.add('active');
        }, 1500);
    }
    
    // Reset to start new order
    newOrderBtn.addEventListener('click', function() {
        // Reset UI
        ready.classList.add('d-none');
        beverageTypeSelection.classList.remove('d-none');
        
        // Reset progress
        progressContainer.classList.add('d-none');
        stepSelection.classList.remove('completed');
        stepSelection.classList.add('active');
        stepVerification.classList.remove('active');
        stepVerification.classList.remove('completed');
        stepDispensing.classList.remove('active');
        stepDispensing.classList.remove('completed');
        stepPickup.classList.remove('active');
        
        // Reset selections
        selectedBeverageType = null;
        selectedSize = null;
        beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
        beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
        continueTypeBtn.disabled = true;
        continueSizeBtn.disabled = true;
        
        // Reset animations
        liquid.style.height = '0%';
        foam.style.bottom = '100%';
        
        // Reset verification form
        verificationForm.classList.remove('d-none');
        verificationForm.classList.remove('was-validated');
        verificationProcessing.classList.add('d-none');
        verificationError.classList.add('d-none');
        document.getElementById('id-number').value = '';
        document.getElementById('birth-date').value = '';
        document.getElementById('age-confirmation').checked = false;
        
        // Reset dispensing error
        dispensingError.classList.add('d-none');
    });
});

// Add additional error handling for debugging
function displayErrorMessage(message, error) {
    console.error('Error:', message, error);
    
    // If we're on the size selection screen, show an error there
    if (!beverageSizeSelection.classList.contains('d-none')) {
        // Create or use an existing error message element
        let errorElement = document.getElementById('size-selection-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'size-selection-error';
            errorElement.className = 'alert alert-danger mt-3';
            errorElement.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i><span></span>';
            document.querySelector('.col.text-center').appendChild(errorElement);
        }
        
        // Set the error message
        errorElement.querySelector('span').textContent = message || 'An error occurred. Please try again.';
        errorElement.classList.remove('d-none');
    }
}

// Add error handling to the continue size button click event
const originalContinueSizeBtnClick = continueSizeBtn.onclick;
continueSizeBtn.onclick = function(event) {
    try {
        // First make sure we have selected a size
        if (!selectedSize) {
            displayErrorMessage('Please select a size before continuing.');
            return;
        }
        
        displayErrorMessage('Processing your request...');
        setTimeout(() => {
            try {
                // Update order summary
                const beverageTypeName = beverageTypeDisplay.textContent;
                orderSummary.textContent = `${beverageTypeName} (${selectedSize}ml)`;
                
                // First check if age verification is required for this beverage type
                fetch('/api/dispense', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        beverage_type: selectedBeverageType,
                        volume_ml: parseInt(selectedSize)
                    })
                })
                .then(response => {
                    console.log('Response status:', response.status);
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
                    console.log('Response data:', data);
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
                        displayErrorMessage(data.message || 'Failed to start the order. Please try again.');
                    }
                })
                .catch(error => {
                    // If this is not the expected age verification redirect, show an error
                    if (error !== 'age_verification_required') {
                        displayErrorMessage('An error occurred. Please try again.', error);
                    }
                });
            } catch (error) {
                displayErrorMessage('An unexpected error occurred. Please try again.', error);
            }
        }, 100);
    } catch (error) {
        displayErrorMessage('An unexpected error occurred. Please try again.', error);
    }
};

    // Webcam Functions
    function startWebcam() {
        // Check if the browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showWebcamError("Your browser doesn't support webcam access");
            return;
        }
        
        // Request access to the webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                webcamStream = stream;
                webcamVideo.srcObject = stream;
                webcamVideo.style.display = 'block';
                webcamPlaceholder.style.display = 'none';
                webcamCanvas.style.display = 'none';
                
                // Update button states
                webcamStartBtn.disabled = true;
                webcamCaptureBtn.disabled = false;
                
                // Hide any previous results
                webcamResult.classList.add('d-none');
            })
            .catch(function(error) {
                console.error('Error accessing webcam:', error);
                showWebcamError('Could not access webcam. Please ensure you have granted permission.');
            });
    }
    
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
        
        webcamVideo.srcObject = null;
        webcamVideo.style.display = 'none';
        webcamPlaceholder.style.display = 'flex';
        
        // Reset button states
        webcamStartBtn.disabled = false;
        webcamCaptureBtn.disabled = true;
    }
    
    function captureWebcamImage() {
        // Create a canvas element to capture the image
        const canvas = webcamCanvas;
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = webcamVideo.videoWidth;
        canvas.height = webcamVideo.videoHeight;
        
        // Draw the video frame to the canvas
        context.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
        
        // Show the canvas and hide the video
        webcamVideo.style.display = 'none';
        webcamCanvas.style.display = 'block';
        
        // Get the image data as base64
        capturedImage = canvas.toDataURL('image/jpeg');
        
        // Show processing state
        webcamCaptureBtn.disabled = true;
        webcamStartBtn.disabled = true;
        webcamBackBtn.disabled = true;
        webcamResult.classList.add('d-none');
        verificationProcessing.classList.remove('d-none');
        
        // Send the image to the server for age verification
        fetch('/api/verify_age_webcam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_data: capturedImage,
                beverage_type: selectedBeverageType
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Hide processing state
            verificationProcessing.classList.add('d-none');
            webcamBackBtn.disabled = false;
            
            // Show result
            webcamResult.classList.remove('d-none');
            
            // Format the result message
            let message = '';
            if (data.verified) {
                message = `<strong>Verification successful!</strong><br>`;
                message += `Estimated age: ${data.estimated_age} years<br>`;
                message += `Confidence: ${Math.round(data.confidence * 100)}%`;
                webcamResultMessage.innerHTML = message;
                webcamResult.querySelector('.alert').className = 'alert alert-success';
                
                // Show proceed button
                webcamProceedBtn.classList.remove('d-none');
            } else {
                message = `<strong>Verification failed:</strong><br>`;
                message += data.message;
                webcamResultMessage.innerHTML = message;
                webcamResult.querySelector('.alert').className = 'alert alert-danger';
                
                // Hide proceed button
                webcamProceedBtn.classList.add('d-none');
            }
        })
        .catch(error => {
            console.error('Error during webcam verification:', error);
            
            // Hide processing state
            verificationProcessing.classList.add('d-none');
            webcamBackBtn.disabled = false;
            
            // Show error in result area
            webcamResult.classList.remove('d-none');
            webcamResultMessage.innerHTML = '<strong>Error:</strong><br>Failed to process image for verification.';
            webcamResult.querySelector('.alert').className = 'alert alert-danger';
            
            // Hide proceed button
            webcamProceedBtn.classList.add('d-none');
        });
    }
    
    function resetWebcam() {
        // Reset webcam state
        stopWebcam();
        capturedImage = null;
        
        // Reset UI
        webcamVideo.style.display = 'none';
        webcamCanvas.style.display = 'none';
        webcamPlaceholder.style.display = 'flex';
        webcamStartBtn.disabled = false;
        webcamCaptureBtn.disabled = true;
        webcamBackBtn.disabled = false;
        webcamResult.classList.add('d-none');
        webcamProceedBtn.classList.add('d-none');
    }
    
    function showWebcamError(message) {
        webcamResult.classList.remove('d-none');
        webcamResultMessage.innerHTML = `<strong>Error:</strong><br>${message}`;
        webcamResult.querySelector('.alert').className = 'alert alert-danger';
        webcamProceedBtn.classList.add('d-none');
    }
    
    function startDispensing() {
        // Update UI for dispensing
        ageVerification.classList.add('d-none');
        dispensingInfo.classList.remove('d-none');
        
        stepVerification.classList.remove('active');
        stepVerification.classList.add('completed');
        stepDispensing.classList.add('active');
        
        // Start the dispensing sequence
        let data = {
            beverage_type: selectedBeverageType,
            volume_ml: selectedBeverageSize
        };
        
        fetch('/api/dispense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                dispensingMessage.textContent = 'Beverage dispensed successfully!';
                dispensingStatus.className = 'alert alert-success';
                
                setTimeout(() => {
                    // If successful, allow starting a new order
                    resetBtn.classList.remove('d-none');
                    
                    stepDispensing.classList.remove('active');
                    stepDispensing.classList.add('completed');
                    stepCompletion.classList.add('active');
                }, 2000);
            } else {
                // Show error message
                dispensingMessage.textContent = 'Error: ' + data.message;
                dispensingStatus.className = 'alert alert-danger';
                resetBtn.classList.remove('d-none');
            }
        })
        .catch(error => {
            // Show error message
            console.error('Error during dispensing:', error);
            dispensingMessage.textContent = 'Error: Unable to communicate with the dispenser.';
            dispensingStatus.className = 'alert alert-danger';
            resetBtn.classList.remove('d-none');
        });
    }
    
    function startDispensing() {
        // Update UI for dispensing
        ageVerification.classList.add('d-none');
        dispensingInfo.classList.remove('d-none');
        
        stepVerification.classList.remove('active');
        stepVerification.classList.add('completed');
        stepDispensing.classList.add('active');
        
        // Start the dispensing sequence
        let data = {
            beverage_type: selectedBeverageType,
            volume_ml: selectedBeverageSize
        };
        
        fetch('/api/dispense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                dispensingMessage.textContent = 'Beverage dispensed successfully!';
                dispensingStatus.className = 'alert alert-success';
                
                setTimeout(() => {
                    // If successful, allow starting a new order
                    resetBtn.classList.remove('d-none');
                    
                    stepDispensing.classList.remove('active');
                    stepDispensing.classList.add('completed');
                    stepCompletion.classList.add('active');
                }, 2000);
            } else {
                // Show error message
                dispensingMessage.textContent = 'Error: ' + data.message;
                dispensingStatus.className = 'alert alert-danger';
                resetBtn.classList.remove('d-none');
            }
        })
        .catch(error => {
            // Show error message
            console.error('Error during dispensing:', error);
            dispensingMessage.textContent = 'Error: Unable to communicate with the dispenser.';
            dispensingStatus.className = 'alert alert-danger';
            resetBtn.classList.remove('d-none');
        });
    }
