document.addEventListener('DOMContentLoaded', function() {
    // State
    let selectedBeverageType = null;
    let selectedSize = null;
    let orderInProgress = false;
    
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
    
cat temp_buttons.js/e
        
        // Start dispensing or age verification check
        fetch('/api/check_age_requirement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                beverage_type: selectedBeverageType,
                volume_ml: parseInt(selectedSize)
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
    const webcamVerifyBtn = document.getElementById("webcam-verify-btn");
    if (webcamVerifyBtn) {
        webcamVerifyBtn.addEventListener("click", function() {
            verificationMethods.classList.add("d-none");
            webcamVerification.classList.remove("d-none");
            resetWebcam();
        });
    }
    
    const idVerifyBtn = document.getElementById("id-verify-btn");
    if (idVerifyBtn) {
        idVerifyBtn.addEventListener("click", function() {
            verificationMethods.classList.add("d-none");
            verificationForm.classList.remove("d-none");
        });
    }
    
    // Back button handlers
    const backToMethodsBtn = document.getElementById("back-to-methods-btn");
    if (backToMethodsBtn) {
        backToMethodsBtn.addEventListener("click", function() {
            verificationForm.classList.add("d-none");
            verificationMethods.classList.remove("d-none");
        });
    }
    
    if (webcamBackBtn) {
        webcamBackBtn.addEventListener("click", function() {
            stopWebcam();
            webcamVerification.classList.add("d-none");
            verificationMethods.classList.remove("d-none");
        });
    }
    
    const errorBackBtn = document.getElementById("error-back-btn");
    if (errorBackBtn) {
        errorBackBtn.addEventListener("click", function() {
            verificationError.classList.add("d-none");
            verificationMethods.classList.remove("d-none");
        });
    }

    // Webcam control buttons
    if (webcamStartBtn) {
        webcamStartBtn.addEventListener("click", function() {
            startWebcam();
        });
    }
    
    if (webcamCaptureBtn) {
        webcamCaptureBtn.addEventListener("click", function() {
            captureWebcamImage();
        });
    }
    
    if (webcamRetryBtn) {
        webcamRetryBtn.addEventListener("click", function() {
            resetWebcam();
        });
    }
    
    if (webcamProceedBtn) {
        webcamProceedBtn.addEventListener("click", function() {
            // We have a successful age verification, proceed to dispensing
            stopWebcam();
            startDispensing();
        });
    }
    if (verifyAgeBtn) {
        verifyAgeBtn.addEventListener("click", function(e) {
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
                'Content-Type': 'application/json'
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
    }
    
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
                'Content-Type': 'application/json'
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
            dispensingStepDeliver.innerHTML = '<i class="fas fa-circle text-muted me-2"></i> Waiting for delivery...';
            
            // Animate liquid filling
            liquid.style.height = '70%';
            foam.style.bottom = '70%';
            
        } else if (state === 'delivering_cup') {
            dispensingStepCup.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Cup dispensed';
            dispensingStepPour.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Beverage poured';
            dispensingStepDeliver.innerHTML = '<i class="fas fa-circle-notch fa-spin text-primary me-2"></i> Delivering cup...';
            
            // Animate liquid fully filled with foam
            liquid.style.height = '70%';
            foam.style.bottom = '70%';
            foam.style.height = '20%';
        }
    }
    
    // Show order complete screen
    function showOrderComplete() {
        dispensing.classList.add('d-none');
        ready.classList.remove('d-none');
        stepDispensing.classList.remove('active');
        stepDispensing.classList.add('completed');
        stepPickup.classList.add('active');
        
        // Set order details
        readyBeverageType.textContent = selectedBeverageType.charAt(0).toUpperCase() + selectedBeverageType.slice(1);
        readyBeverageSize.textContent = selectedSize + 'ml';
        readyOrderId.textContent = 'Order #' + Math.floor(Math.random() * 1000);
    }
    
    if (newOrderBtn) {
        newOrderBtn.addEventListener("click", function() {
            // Reset to initial state
            resetUI();
        resetUI();
    });
    
    // Reset UI to initial state
    function resetUI() {
        // Reset selections
        selectedBeverageType = null;
        selectedSize = null;
        orderInProgress = false;
        
        // Reset options
        beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
        beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Disable continue buttons
        continueTypeBtn.disabled = true;
        continueSizeBtn.disabled = true;
        
        // Reset verification form
        verificationForm.classList.remove('was-validated');
        document.getElementById('id-number').value = '';
        document.getElementById('birth-date').value = '';
        document.getElementById('age-confirmation').checked = false;
        
        // Hide sections
        progressContainer.classList.add('d-none');
        ageVerification.classList.add('d-none');
        dispensing.classList.add('d-none');
        ready.classList.add('d-none');
        beverageSizeSelection.classList.add('d-none');
        
        // Show first screen
        beverageTypeSelection.classList.remove('d-none');
        
        // Reset progress steps
        stepSelection.classList.add('active');
        stepSelection.classList.remove('completed');
        stepVerification.classList.remove('active', 'completed');
        stepDispensing.classList.remove('active', 'completed');
        stepPickup.classList.remove('active', 'completed');
        
        // Reset errors
        verificationError.classList.add('d-none');
        dispensingError.classList.add('d-none');
    }
    
    // Webcam functionality
    function startWebcam() {
        webcamPlaceholder.classList.add("d-none");
        webcamStartBtn.classList.add("d-none");
        webcamVideo.classList.remove("d-none");
        webcamCaptureBtn.classList.remove("d-none");
        
        // Access webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                webcamStream = stream;
                webcamVideo.srcObject = stream;
            })
            .catch(error => {
                console.error("Error accessing webcam:", error);
                webcamResultMessage.textContent = "Could not access webcam. Please check permissions and try again.";
                webcamResult.classList.remove("d-none");
            });
    }
    
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
    }
    
    function captureWebcamImage() {
        const canvas = webcamCanvas;
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = webcamVideo.videoWidth;
        canvas.height = webcamVideo.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
        
        // Hide video controls, show result
        webcamVideo.classList.add("d-none");
        webcamCaptureBtn.classList.add("d-none");
        webcamCanvas.classList.remove("d-none");
        webcamResult.classList.remove("d-none");
        
        // Get base64 image data for API
        capturedImage = canvas.toDataURL('image/jpeg').split(',')[1];
        
        // Send to API for age verification
        verifyAgeWithImage(capturedImage);
    }
    
    function verifyAgeWithImage(imageData) {
        webcamResultMessage.textContent = "Analyzing image...";
        webcamProceedBtn.classList.add("d-none");
        webcamRetryBtn.classList.add("d-none");
        
        fetch('/api/verify_age_with_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_data: imageData,
                beverage_type: selectedBeverageType
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.verified) {
                webcamResultMessage.textContent = data.message || "Age verified successfully! You can proceed.";
                webcamResultMessage.classList.remove("text-danger");
                webcamResultMessage.classList.add("text-success");
                webcamProceedBtn.classList.remove("d-none");
                webcamRetryBtn.classList.add("d-none");
            } else {
                webcamResultMessage.textContent = data.message || "Age verification failed. Please try again or use ID verification.";
                webcamResultMessage.classList.remove("text-success");
                webcamResultMessage.classList.add("text-danger");
                webcamProceedBtn.classList.add("d-none");
                webcamRetryBtn.classList.remove("d-none");
            }
        })
        .catch(error => {
            console.error("Error verifying age:", error);
            webcamResultMessage.textContent = "An error occurred during verification. Please try again.";
            webcamResultMessage.classList.remove("text-success");
            webcamResultMessage.classList.add("text-danger");
            webcamRetryBtn.classList.remove("d-none");
        });
    }
    
    function resetWebcam() {
        stopWebcam();
        webcamPlaceholder.classList.remove("d-none");
        webcamStartBtn.classList.remove("d-none");
        webcamVideo.classList.add("d-none");
        webcamCanvas.classList.add("d-none");
        webcamCaptureBtn.classList.add("d-none");
        webcamResult.classList.add("d-none");
    }
});
