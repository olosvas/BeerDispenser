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
    const continueSizeBtn = document.getElementById('continue-size-btn');
    
    // Progress tracking elements
    const progressContainer = document.getElementById('progress-container');
    const stepSelection = document.getElementById('step-selection');
    const stepVerification = document.getElementById('step-verification');
    const stepDispensing = document.getElementById('step-dispensing');
    const stepPickup = document.getElementById('step-pickup');
    
    // Age verification elements
    const ageVerification = document.getElementById('age-verification');
    const orderSummary = document.getElementById('order-summary');
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
    
    // Dispensing elements
    const dispensing = document.getElementById('dispensing');
    const cupImg = document.getElementById('cup-img');
    const statusMessage = document.getElementById('status-message');
    const liquidEl = document.getElementById('liquid');
    const foamEl = document.getElementById('foam');
    
    // Order complete elements (the "ready" screen)
    const ready = document.getElementById('ready');
    const newOrderBtn = document.getElementById('new-order-btn');
    
    // Store selected options
    let selectedBeverageType = null;
    let selectedSize = null;
    let requiresAgeVerification = false;
    let webcamStream = null;
    
    // Initialize page - show the beverage type selection screen
    // ... (no changes to the initialization)
    
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
                continueSizeBtn.disabled = false;
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
    
    // Continue Size Button - Start dispensing or trigger age verification
    if (continueSizeBtn) {
        continueSizeBtn.addEventListener('click', function() {
            progressContainer.classList.remove('d-none');
            beverageSizeSelection.classList.add('d-none');
            
            // Update order summary for age verification
            orderSummary.textContent = `${selectedBeverageType.charAt(0).toUpperCase() + selectedBeverageType.slice(1)} (${selectedSize}ml)`;
            
            // Start dispensing or age verification check
            fetch('/api/check_age_requirement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    beverage_type: selectedBeverageType,
                })
            })
            .then(response => response.json())
            .then(data => {
                requiresAgeVerification = data.requires_verification;
                
                if (requiresAgeVerification) {
                    // Show age verification screen
                    ageVerification.classList.remove('d-none');
                    stepSelection.classList.add('completed');
                    stepVerification.classList.add('active');
                } else {
                    // Skip verification and start dispensing
                    startDispensing();
                }
            })
            .catch(error => {
                console.error('Error checking age requirement:', error);
                // Default to requiring verification if error occurs
                requiresAgeVerification = true;
                ageVerification.classList.remove('d-none');
                stepSelection.classList.add('completed');
                stepVerification.classList.add('active');
            });
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
            
            // Send verification request
            fetch('/api/verify_age', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_number: idNumber.value,
                    birth_date: birthDate.value,
                    beverage_type: selectedBeverageType
                })
            })
            .then(response => response.json())
            .then(data => {
                verificationProcessing.classList.add('d-none');
                
                if (data.verified) {
                    // Start dispensing process
                    startDispensing();
                } else {
                    // Show error
                    verificationErrorMessage.textContent = data.message || 'Age verification failed';
                    verificationError.classList.remove('d-none');
                }
            })
            .catch(error => {
                console.error('Error verifying age:', error);
                verificationProcessing.classList.add('d-none');
                verificationErrorMessage.textContent = 'Error processing verification';
                verificationError.classList.remove('d-none');
            });
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
            startDispensing();
        });
    }
    
    // Verify Age Button - Handle ID verification submission
    if (verifyAgeBtn) {
        verifyAgeBtn.addEventListener('click', function() {
            // Show processing screen and hide verification methods
            verificationMethods.classList.add('d-none');
            verificationProcessing.classList.add('d-none');
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
        
        // Update status message
        if (statusMessage) statusMessage.textContent = 'Preparing your beverage...';
        
        // Add class based on beverage type
        if (liquidEl) liquidEl.classList.add(selectedBeverageType);
        
        // Animate dispensing
        setTimeout(() => {
            // Animate cup filling
            if (liquidEl) liquidEl.style.height = '80%';
            if (foamEl) foamEl.style.bottom = '80%';
            
            // Update status
            if (statusMessage) statusMessage.textContent = `Pouring ${selectedBeverageType}...`;
            
            // Simulate dispensing process
            setTimeout(() => {
                // Show complete
                dispensing.classList.add('d-none');
                if (ready) ready.classList.remove('d-none');
                stepDispensing.classList.remove('active');
                stepDispensing.classList.add('completed');
                stepPickup.classList.add('active');
                
                // Send dispense request to server
                fetch('/api/dispense', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        beverage_type: selectedBeverageType,
                        volume_ml: selectedSize
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Dispensing response:', data);
                })
                .catch(error => {
                    console.error('Error dispensing:', error);
                });
            }, 5000); // 5 second pour animation
        }, 2000); // 2 second initial delay
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
                    if (webcamPlaceholder) {
                        webcamPlaceholder.innerHTML = '<i class="fas fa-exclamation-circle fa-3x text-danger mb-2"></i><span class="text-danger">Could not access camera</span>';
                        webcamPlaceholder.style.display = 'flex';
                    }
                });
        } else {
            console.error('getUserMedia not supported');
            if (webcamPlaceholder) {
                webcamPlaceholder.innerHTML = '<i class="fas fa-exclamation-circle fa-3x text-danger mb-2"></i><span class="text-danger">Camera not supported in this browser</span>';
                webcamPlaceholder.style.display = 'flex';
            }
        }
    }
    
    // Function to stop webcam
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
            if (webcamVideo) {
                webcamVideo.srcObject = null;
                webcamVideo.style.display = 'none';
            }
            if (webcamCanvas) webcamCanvas.style.display = 'none';
            if (webcamPlaceholder) webcamPlaceholder.style.display = 'flex';
            if (webcamCaptureBtn) webcamCaptureBtn.disabled = true;
            if (webcamStartBtn) webcamStartBtn.disabled = false;
        }
    }
    
    // Function to capture image
    function captureImage() {
        if (webcamStream && webcamVideo && webcamCanvas) {
            // Show canvas, hide video
            webcamCanvas.style.display = 'block';
            webcamVideo.style.display = 'none';
            
            // Draw video frame to canvas
            const context = webcamCanvas.getContext('2d');
            webcamCanvas.width = webcamVideo.videoWidth;
            webcamCanvas.height = webcamVideo.videoHeight;
            context.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
            
            // Show processing
            if (webcamControls) webcamControls.classList.add('d-none');
            if (verificationProcessing) verificationProcessing.classList.remove('d-none');
            
            // Get image data
            const imageData = webcamCanvas.toDataURL('image/jpeg');
            
            // Send to server for age verification
            fetch('/api/verify_age_webcam', {
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
                if (verificationProcessing) verificationProcessing.classList.add('d-none');
                if (webcamResult) webcamResult.classList.remove('d-none');
                
                if (data.verified) {
                    // Success - show result and enable proceed button
                    if (webcamResultMessage) webcamResultMessage.textContent = `Verification successful. Estimated age: ${data.estimated_age} years`;
                    if (webcamResult && webcamResult.querySelector('.alert')) webcamResult.querySelector('.alert').className = 'alert alert-success';
                    if (webcamProceedBtn) webcamProceedBtn.classList.remove('d-none');
                } else {
                    // Failed - show error and retry option
                    if (webcamResultMessage) webcamResultMessage.textContent = data.message || 'Age verification failed';
                    if (webcamResult && webcamResult.querySelector('.alert')) webcamResult.querySelector('.alert').className = 'alert alert-danger';
                    if (webcamProceedBtn) webcamProceedBtn.classList.add('d-none');
                }
                
                // Stop webcam
                stopWebcam();
            })
            .catch(error => {
                console.error('Error verifying age:', error);
                if (verificationProcessing) verificationProcessing.classList.add('d-none');
                if (webcamResult) webcamResult.classList.remove('d-none');
                if (webcamResultMessage) webcamResultMessage.textContent = 'Error processing verification';
                if (webcamResult && webcamResult.querySelector('.alert')) webcamResult.querySelector('.alert').className = 'alert alert-danger';
                if (webcamProceedBtn) webcamProceedBtn.classList.add('d-none');
            });
        }
    }
    
    // Reset the UI to initial state
    function resetUI() {
        // Reset selection state
        selectedBeverageType = null;
        selectedSize = null;
        requiresAgeVerification = false;
        
        // Reset selection highlights
        beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
        beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Reset buttons
        if (continueTypeBtn) continueTypeBtn.disabled = true;
        if (continueSizeBtn) continueSizeBtn.disabled = true;
        
        // Reset step indicators
        if (stepSelection) stepSelection.classList.remove('completed');
        if (stepVerification) stepVerification.classList.remove('active', 'completed');
        if (stepDispensing) stepDispensing.classList.remove('active', 'completed');
        if (stepPickup) stepPickup.classList.remove('active');
        
        // Reset displays
        if (beverageTypeDisplay) beverageTypeDisplay.textContent = 'None';
        
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
        if (verificationMethods) verificationMethods.classList.remove('d-none');
        if (verificationForm) verificationForm.classList.add('d-none');
        if (webcamVerification) webcamVerification.classList.add('d-none');
        if (verificationProcessing) verificationProcessing.classList.add('d-none');
        if (verificationError) verificationError.classList.add('d-none');
    }
    
    // New Order Button - Reset to start
    if (newOrderBtn) {
        newOrderBtn.addEventListener("click", function() {
            // Reset to initial state
            resetUI();
        });
    }
});
