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
    const beverageTypeDisplay = document.getElementById('beverage-type-display') ? 
        document.getElementById('beverage-type-display').querySelector('span') : null;
    
    // Debug logging
    console.log('DOM Content Loaded');
    console.log('Beverage type options found:', beverageTypeOptions.length);
    console.log('Beverage size options found:', beverageSizeOptions.length);
    console.log('Continue type button found:', continueTypeBtn ? 'Yes' : 'No');
    console.log('Continue size button found:', continueSizeBtn ? 'Yes' : 'No');
    
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
    
    // Attach event listeners to beverage type options
    beverageTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Clear previous selection
            beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Select this option
            this.classList.add('selected');
            
            // Store selection
            selectedBeverageType = this.getAttribute('data-type');
            console.log('Beverage selected:', selectedBeverageType);
            
            // Update display
            if (beverageTypeDisplay) {
                beverageTypeDisplay.textContent = this.querySelector('.card-title').textContent;
            }
            
            // Enable continue button
            if (continueTypeBtn) {
                continueTypeBtn.disabled = false;
                console.log('Continue type button enabled');
            }
        });
    });
    
    // Attach event listeners to beverage size options
    beverageSizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            console.log('Size option clicked:', this.getAttribute('data-size'));
            
            // Clear previous selection
            beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Select this option
            this.classList.add('selected');
            
            // Store selection
            selectedSize = parseInt(this.getAttribute('data-size'));
            console.log('Size selected:', selectedSize);
            
            // Enable continue button
            if (continueSizeBtn) {
                continueSizeBtn.disabled = false;
                console.log('Continue size button enabled');
            } else {
                console.error('Continue size button not found in DOM');
            }
        });
    });
    
    // Continue from Type Selection to Size Selection
    if (continueTypeBtn) {
        continueTypeBtn.addEventListener('click', function() {
            console.log('Continue type button clicked');
            if (selectedBeverageType) {
                // Hide type selection, show size selection
                beverageTypeSelection.classList.add('d-none');
                beverageSizeSelection.classList.remove('d-none');
                
                // Update progress
                updateProgress(2);
                console.log('Moved to size selection screen');
            }
        });
    }
    
    // Back from Size Selection to Type Selection
    if (backToTypeBtn) {
        backToTypeBtn.addEventListener('click', function() {
            console.log('Back to type button clicked');
            // Hide size selection, show type selection
            beverageSizeSelection.classList.add('d-none');
            beverageTypeSelection.classList.remove('d-none');
            
            // Update progress
            updateProgress(1);
        });
    }
    
    // Continue from Size Selection - check if age verification is needed
    if (continueSizeBtn) {
        continueSizeBtn.addEventListener('click', function() {
            console.log('Continue size button clicked');
            // Update order summary
            if (orderSummary && beverageTypeDisplay) {
                const beverageTypeName = beverageTypeDisplay.textContent;
                orderSummary.textContent = `${beverageTypeName} (${selectedSize}ml)`;
            }
            
            // First check if age verification is required for this beverage type
            fetch('/api/check_age_required', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    beverage_type: selectedBeverageType,
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Age verification check response:', data);
                // Hide size selection
                beverageSizeSelection.classList.add('d-none');
                
                if (data.verification_required) {
                    // Show age verification
                    ageVerification.classList.remove('d-none');
                    updateProgress(3);
                    console.log('Age verification required, showing verification screen');
                } else {
                    // Skip to dispensing
                    dispensing.classList.remove('d-none');
                    updateProgress(4);
                    startDispensing();
                    console.log('No age verification required, proceeding to dispensing');
                }
            })
            .catch(error => {
                console.error('Age verification check error:', error);
                // Fallback to requiring verification
                ageVerification.classList.remove('d-none');
                updateProgress(3);
            });
        });
    } else {
        console.error('Continue size button not found during initialization');
    }
    
    // Handle webcam verification
    if (webcamVerification) {
        webcamVerification.addEventListener('click', function() {
            // Show webcam verification UI
            if (verificationMethods) {
                verificationMethods.classList.add('d-none');
            }
            if (verificationForm) {
                verificationForm.classList.remove('d-none');
            }
            
            // Initialize webcam
            initializeWebcam();
        });
    }
    
    // Verify age button
    if (verifyAgeBtn) {
        verifyAgeBtn.addEventListener('click', function() {
            captureWebcamImage();
        });
    }
    
    // Back to verification methods
    const backToMethodsBtn = document.getElementById('back-to-methods-btn');
    if (backToMethodsBtn) {
        backToMethodsBtn.addEventListener('click', function() {
            if (verificationForm) {
                verificationForm.classList.add('d-none');
            }
            if (verificationMethods) {
                verificationMethods.classList.remove('d-none');
            }
            
            // Stop webcam
            stopWebcam();
        });
    }
    
    // Update progress bar
    function updateProgress(step) {
        const progressSteps = document.querySelectorAll('.progress-step');
        const progressBar = document.querySelector('.progress-bar');
        
        // Update steps
        progressSteps.forEach((stepEl, index) => {
            if (index < step) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });
        
        // Update progress bar
        if (progressBar) {
            const percent = (step / progressSteps.length) * 100;
            progressBar.style.width = `${percent}%`;
            progressBar.setAttribute('aria-valuenow', percent);
        }
    }
    
    // Webcam functionality
    let webcamStream = null;
    
    function initializeWebcam() {
        const webcamVideo = document.getElementById('webcam-video');
        if (!webcamVideo) return;
        
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                webcamStream = stream;
                webcamVideo.srcObject = stream;
                webcamVideo.play();
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
                alert('Could not access webcam. Please make sure webcam is connected and permissions are granted.');
            });
    }
    
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
    }
    
    function captureWebcamImage() {
        const webcamVideo = document.getElementById('webcam-video');
        if (!webcamVideo || !webcamCanvas) return;
        
        const context = webcamCanvas.getContext('2d');
        context.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
        
        const imageDataUrl = webcamCanvas.toDataURL('image/jpeg');
        
        // Show loading spinner
        const loadingSpinner = document.getElementById('verification-loading');
        if (loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }
        
        // Send to server for verification
        fetch('/api/verify_age', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_data: imageDataUrl,
                beverage_type: selectedBeverageType
            })
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading spinner
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
            
            if (data.passed) {
                // Verification successful - proceed to dispensing
                ageVerification.classList.add('d-none');
                dispensing.classList.remove('d-none');
                updateProgress(4);
                startDispensing();
            } else {
                // Verification failed - show error
                const verificationError = document.getElementById('verification-error');
                if (verificationError) {
                    verificationError.textContent = data.message || 'Age verification failed';
                    verificationError.classList.remove('d-none');
                }
            }
        })
        .catch(error => {
            console.error('Verification error:', error);
            
            // Hide loading spinner
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
            
            // Show error
            const verificationError = document.getElementById('verification-error');
            if (verificationError) {
                verificationError.textContent = 'Error during verification process';
                verificationError.classList.remove('d-none');
            }
        });
    }
    
    function startDispensing() {
        // Set order in progress
        orderInProgress = true;
        
        // Start the dispensing process
        fetch('/api/start_dispensing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                beverage_type: selectedBeverageType,
                size: selectedSize
            })
        })
        .then(response => response.json())
        .then(data => {
            // Begin monitoring progress
            monitorProgress();
        })
        .catch(error => {
            console.error('Error starting dispensing:', error);
            // Show error message
            const dispensingStatus = document.getElementById('dispensing-status');
            if (dispensingStatus) {
                dispensingStatus.textContent = 'Error starting dispensing process';
                dispensingStatus.className = 'text-danger';
            }
        });
    }
    
    function monitorProgress() {
        const dispensingProgress = document.getElementById('dispensing-progress');
        const dispensingStatus = document.getElementById('dispensing-status');
        
        const progressInterval = setInterval(() => {
            if (!orderInProgress) {
                clearInterval(progressInterval);
                return;
            }
            
            fetch('/api/dispensing_status')
                .then(response => response.json())
                .then(data => {
                    // Update progress bar
                    if (dispensingProgress) {
                        dispensingProgress.style.width = `${data.progress}%`;
                        dispensingProgress.setAttribute('aria-valuenow', data.progress);
                    }
                    
                    // Update status message
                    if (dispensingStatus) {
                        dispensingStatus.textContent = data.status_message;
                    }
                    
                    // Check if complete
                    if (data.status === 'complete') {
                        orderInProgress = false;
                        clearInterval(progressInterval);
                        
                        // Show ready screen
                        dispensing.classList.add('d-none');
                        ready.classList.remove('d-none');
                        updateProgress(5);
                    }
                })
                .catch(error => {
                    console.error('Error monitoring progress:', error);
                });
        }, 1000);
    }
    
    // New order button
    const newOrderBtn = document.getElementById('new-order-btn');
    if (newOrderBtn) {
        newOrderBtn.addEventListener('click', function() {
            // Reset all selections
            selectedBeverageType = null;
            selectedSize = null;
            
            // Clear UI selections
            beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
            beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Hide all screens except beverage type selection
            beverageSizeSelection.classList.add('d-none');
            ageVerification.classList.add('d-none');
            dispensing.classList.add('d-none');
            ready.classList.add('d-none');
            
            beverageTypeSelection.classList.remove('d-none');
            
            // Reset progress
            updateProgress(1);
            
            // Disable continue buttons
            if (continueTypeBtn) continueTypeBtn.disabled = true;
            if (continueSizeBtn) continueSizeBtn.disabled = true;
        });
    }
    
    // Initialize
    updateProgress(1);
});
