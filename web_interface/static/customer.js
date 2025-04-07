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
    const orderSummary = document.getElementById('order-summary').querySelector('span');
    const verifyAgeBtn = document.getElementById('verify-age-btn');
    const verificationForm = document.getElementById('verification-form');
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
    
    // Continue from Type Selection to Size Selection
    continueTypeBtn.addEventListener('click', function() {
        beverageTypeSelection.classList.add('d-none');
        beverageSizeSelection.classList.remove('d-none');
        progressContainer.classList.remove('d-none');
        
        // Update the liquid class based on beverage type
        liquid.className = 'liquid ' + selectedBeverageType;
    });
    
    // Back to Type Selection
    backToTypeBtn.addEventListener('click', function() {
        beverageSizeSelection.classList.add('d-none');
        beverageTypeSelection.classList.remove('d-none');
    });
    
    // Continue from Size Selection - check if age verification is needed
    continueSizeBtn.addEventListener('click', function() {
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
