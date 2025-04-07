    // Payment screen elements
    const paymentMethodOptions = document.querySelectorAll('.payment-method-option');
    const payItemsTotal = document.getElementById('payment-items-total');
    const payVat = document.getElementById('payment-vat');
    const payTotal = document.getElementById('payment-total');
    const payNowBtn = document.getElementById('pay-now-btn');
    const backToVerificationBtn = document.getElementById('back-to-verification-btn');
    
    // Payment processing state
    let selectedPaymentMethod = null;

    // Attach event listeners for payment methods
    if (paymentMethodOptions) {
        paymentMethodOptions.forEach(option => {
            option.addEventListener('click', function() {
                paymentMethodOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                selectedPaymentMethod = this.getAttribute('data-method');
                
                // Enable pay button if a payment method is selected
                if (payNowBtn) {
                    payNowBtn.disabled = false;
                }
            });
        });
    }
    
    // Payment summary calculation
    function updatePaymentSummary() {
        const cart = getCart();
        if (!cart || !cart.length) return;
        
        const itemsTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        const vatAmount = itemsTotal * 0.2; // 20% VAT
        const totalAmount = itemsTotal + vatAmount;
        
        if (payItemsTotal) payItemsTotal.textContent = `€${itemsTotal.toFixed(2)}`;
        if (payVat) payVat.textContent = `€${vatAmount.toFixed(2)}`;
        if (payTotal) payTotal.textContent = `€${totalAmount.toFixed(2)}`;
    }
    
    // Back to verification button
    if (backToVerificationBtn) {
        backToVerificationBtn.addEventListener('click', function() {
            showScreen('age-verification');
        });
    }
    
    // Pay and proceed to dispensing
    if (payNowBtn) {
        payNowBtn.addEventListener('click', function() {
            if (!selectedPaymentMethod) {
                displayMessage('Please select a payment method', 'warning');
                return;
            }
            
            // Simulate payment processing
            const paymentProcessingOverlay = document.createElement('div');
            paymentProcessingOverlay.classList.add('payment-processing-overlay');
            paymentProcessingOverlay.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <h4>${document.documentElement.lang === 'sk' ? 'Spracovanie platby...' : 'Processing payment...'}</h4>
                </div>
            `;
            
            if (paymentScreen) {
                paymentScreen.appendChild(paymentProcessingOverlay);
                
                // Simulate payment processing delay (2 seconds)
                setTimeout(() => {
                    paymentScreen.removeChild(paymentProcessingOverlay);
                    // Navigate to dispensing screen
                    showScreen('dispensing-screen');
                }, 2000);
            }
        });
    }

    // Function to initialize payment screen
    function initializePaymentScreen() {
        // Reset selected payment method
        selectedPaymentMethod = null;
        
        // Clear selection state
        if (paymentMethodOptions) {
            paymentMethodOptions.forEach(opt => opt.classList.remove('selected'));
        }
        
        // Disable pay button initially
        if (payNowBtn) {
            payNowBtn.disabled = true;
        }
        
        // Update payment summary
        updatePaymentSummary();
    }
