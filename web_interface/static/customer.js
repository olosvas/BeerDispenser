document.addEventListener('DOMContentLoaded', function() {
    // Configuration and initialization
    const DISPLAY_STATES = {
        BEVERAGE_TYPE: 'beverage-type',
        BEVERAGE_SIZE: 'beverage-size',
        AGE_VERIFICATION: 'age-verification',
        DISPENSING: 'dispensing',
        ORDER_COMPLETE: 'order-complete'
    };
    
    // Global variables (referenced throughout the app)
    let selectedBeverage = '';
    let selectedSize = '';
    let cartItems = [];
    
    // Cart functionality (to be implemented)
    function addToCart(beverage, size) {
        cartItems.push({
            beverage: beverage,
            size: size
        });
        // Future: Update UI to show cart contents
    }
    
    // DOM elements
    const beverageTypeSelection = document.getElementById('beverage-type-selection');
    const beverageSizeSelection = document.getElementById('beverage-size-selection');
    const ageVerificationScreen = document.getElementById('age-verification-screen');
    const dispensingScreen = document.getElementById('dispensing-screen');
    const orderCompleteScreen = document.getElementById('order-complete-screen');
    
    const beverageTypeOptions = document.querySelectorAll('.beverage-option');
    const beverageSizeOptions = document.querySelectorAll('.size-option');
    
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const continueSizeBtn = document.getElementById('continue-size-btn');
    
    const progressContainer = document.getElementById('progress-container');
    const stepSelection = document.getElementById('step-selection');
    const stepVerification = document.getElementById('step-verification');
    const stepDispensing = document.getElementById('step-dispensing');
    
    // Server state functions
    function saveStateToServer() {
        const currentScreen = getCurrentScreen();
        // Send current state to server
        fetch('/save_ui_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                screen: currentScreen,
                selectedBeverage: selectedBeverage,
                selectedSize: selectedSize
            })
        }).catch(error => {
            console.error('Error saving state:', error);
        });
    }
    
    function getCurrentScreen() {
        if (!beverageTypeSelection.classList.contains('d-none')) {
            return DISPLAY_STATES.BEVERAGE_TYPE;
        } else if (!beverageSizeSelection.classList.contains('d-none')) {
            return DISPLAY_STATES.BEVERAGE_SIZE;
        } else if (!ageVerificationScreen.classList.contains('d-none')) {
            return DISPLAY_STATES.AGE_VERIFICATION;
        } else if (!dispensingScreen.classList.contains('d-none')) {
            return DISPLAY_STATES.DISPENSING;
        } else if (!orderCompleteScreen.classList.contains('d-none')) {
            return DISPLAY_STATES.ORDER_COMPLETE;
        }
        return DISPLAY_STATES.BEVERAGE_TYPE; // Default
    }
    
    function restoreUIState(screenName) {
        hideAllScreens();
        
        switch(screenName) {
            case DISPLAY_STATES.BEVERAGE_TYPE:
                beverageTypeSelection.classList.remove('d-none');
                break;
            case DISPLAY_STATES.BEVERAGE_SIZE:
                beverageSizeSelection.classList.remove('d-none');
                progressContainer.classList.remove('d-none');
                stepSelection.classList.add('active');
                break;
            case DISPLAY_STATES.AGE_VERIFICATION:
                ageVerificationScreen.classList.remove('d-none');
                progressContainer.classList.remove('d-none');
                stepSelection.classList.add('active');
                stepVerification.classList.add('active');
                break;
            case DISPLAY_STATES.DISPENSING:
                dispensingScreen.classList.remove('d-none');
                progressContainer.classList.remove('d-none');
                stepSelection.classList.add('active');
                stepVerification.classList.add('active');
                stepDispensing.classList.add('active');
                break;
            case DISPLAY_STATES.ORDER_COMPLETE:
                orderCompleteScreen.classList.remove('d-none');
                break;
            default:
                beverageTypeSelection.classList.remove('d-none');
        }
    }
    
    function hideAllScreens() {
        beverageTypeSelection.classList.add('d-none');
        beverageSizeSelection.classList.add('d-none');
        ageVerificationScreen.classList.add('d-none');
        dispensingScreen.classList.add('d-none');
        orderCompleteScreen.classList.add('d-none');
    }
    
    // Event Listeners for Beverage Selection
    beverageTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Deselect all options
            beverageTypeOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Select current option
            this.classList.add('selected');
            
            // Enable continue button
            continueTypeBtn.disabled = false;
            
            // Store selection
            selectedBeverage = this.dataset.beverage;
        });
    });
    
    // Event Listeners for Size Selection
    beverageSizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Deselect all options
            beverageSizeOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Select current option
            this.classList.add('selected');
            
            // Enable continue button
            continueSizeBtn.disabled = false;
            
            // Store selection
            selectedSize = this.dataset.size;
        });
    });
    
    // Continue Type Button
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
                beverage_type: selectedBeverage,
                size_ml: selectedSize
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.requires_age_verification) {
                // Show age verification screen
                beverageSizeSelection.classList.add('d-none');
                ageVerificationScreen.classList.remove('d-none');
                stepVerification.classList.add('active');
                
                // Initialize webcam if needed
                if (typeof startWebcam === 'function') {
                    startWebcam();
                }
            } else {
                // Show dispensing screen directly
                beverageSizeSelection.classList.add('d-none');
                dispensingScreen.classList.remove('d-none');
                stepDispensing.classList.add('active');
                
                // Add to cart
                addToCart(selectedBeverage, selectedSize);
                
                // Start dispensing process
                startDispensing();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Display error message
            alert('An error occurred. Please try again.');
        });
    });
    
    // Initialize UI state from server if available
    const initialScreen = document.body.dataset.initialScreen || null;
    const selectedBeverageFromServer = document.body.dataset.selectedBeverage || null;
    const selectedSizeFromServer = document.body.dataset.selectedSize || null;
    
    if (selectedBeverageFromServer) {
        selectedBeverage = selectedBeverageFromServer;
        // Find and select the beverage option
        beverageTypeOptions.forEach(option => {
            if (option.dataset.beverage === selectedBeverage) {
                option.classList.add('selected');
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
    }
    
    // Add event listener for language switch to save state
    const languageSwitchBtn = document.getElementById("language-switch-btn");
    if (languageSwitchBtn) {
        languageSwitchBtn.addEventListener("click", function() {
            saveStateToServer();
        });
    }
});

// Webcam functionality
let webcamElement = null;
let webcamStream = null;

function startWebcam() {
    webcamElement = document.getElementById('webcam');
    
    if (!webcamElement) {
        showWebcamError('Webcam element not found');
        return;
    }
    
    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            webcamStream = stream;
            webcamElement.srcObject = stream;
        })
        .catch(function(error) {
            showWebcamError('Error accessing webcam: ' + error.message);
        });
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => {
            track.stop();
        });
        webcamStream = null;
        
        if (webcamElement) {
            webcamElement.srcObject = null;
        }
    }
}

function captureWebcamImage() {
    if (!webcamElement || !webcamStream) {
        showWebcamError('Webcam not initialized');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = webcamElement.videoWidth;
    canvas.height = webcamElement.videoHeight;
    canvas.getContext('2d').drawImage(webcamElement, 0, 0);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Send to server for age verification
    fetch('/api/verify_age', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: imageData,
            beverage_type: selectedBeverage
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.is_adult) {
            // Age verification successful, show dispensing screen
            document.getElementById('age-verification-screen').classList.add('d-none');
            document.getElementById('dispensing-screen').classList.remove('d-none');
            document.getElementById('step-dispensing').classList.add('active');
            
            // Add to cart
            addToCart(selectedBeverage, selectedSize);
            
            // Start dispensing process
            startDispensing();
        } else {
            // Age verification failed
            showWebcamError('Age verification failed: ' + data.message);
        }
    })
    .catch(error => {
        showWebcamError('Error verifying age: ' + error.message);
    })
    .finally(() => {
        // Clean up webcam
        stopWebcam();
    });
}

function resetWebcam() {
    stopWebcam();
    startWebcam();
}

function showWebcamError(message) {
    const errorElement = document.getElementById('webcam-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }
}

// Dispensing functionality
function startDispensing() {
    // Show the dispensing interface
    document.getElementById('dispensing-status').textContent = 'Initializing...';
    
    // Start polling for status
    monitorOrderProgress();
}

// Poll for dispensing status
function monitorOrderProgress() {
    const statusElement = document.getElementById('dispensing-status');
    const progressBar = document.getElementById('dispensing-progress');
    
    // Poll for status every 1 second
    const intervalId = setInterval(() => {
        fetch('/api/dispensing_status')
            .then(response => response.json())
            .then(data => {
                updateDispenseUI(data);
                
                if (data.status === 'complete') {
                    clearInterval(intervalId);
                    showOrderComplete();
                } else if (data.status === 'error') {
                    clearInterval(intervalId);
                    statusElement.textContent = 'Error: ' + data.message;
                    statusElement.classList.add('text-danger');
                }
            })
            .catch(error => {
                console.error('Error polling status:', error);
            });
    }, 1000);
}

function updateDispenseUI(state) {
    const statusElement = document.getElementById('dispensing-status');
    const progressBar = document.getElementById('dispensing-progress');
    
    if (!statusElement || !progressBar) return;
    
    // Update status message
    statusElement.textContent = state.message || 'Processing...';
    
    // Update progress bar
    if (state.progress !== undefined) {
        progressBar.style.width = state.progress + '%';
        progressBar.setAttribute('aria-valuenow', state.progress);
    }
}

function showOrderComplete() {
    // Hide dispensing screen, show order complete
    document.getElementById('dispensing-screen').classList.add('d-none');
    document.getElementById('order-complete-screen').classList.remove('d-none');
    
    // Clear cart and selections
    cartItems = [];
    selectedBeverage = '';
    selectedSize = '';
    
    // Set a timeout to return to the start screen
    setTimeout(() => {
        document.getElementById('order-complete-screen').classList.add('d-none');
        document.getElementById('beverage-type-selection').classList.remove('d-none');
        
        // Reset progress steps
        document.getElementById('progress-container').classList.add('d-none');
        document.getElementById('step-selection').classList.remove('active');
        document.getElementById('step-verification').classList.remove('active');
        document.getElementById('step-dispensing').classList.remove('active');
        
        // Disable continue buttons
        document.getElementById('continue-type-btn').disabled = true;
        document.getElementById('continue-size-btn').disabled = true;
        
        // Reset selections
        document.querySelectorAll('.beverage-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
    }, 5000); // 5 seconds
}

// Global error handler
function displayErrorMessage(message, error) {
    console.error(message, error);
    alert(message + (error ? ': ' + error.message : ''));
}
