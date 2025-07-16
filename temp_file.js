function startDispensing() {
    // Show the dispensing interface
    const statusElement = document.getElementById('dispensing-status');
    if (statusElement) {
        statusElement.textContent = 'Initializing...';
    }
    
    // Get primary beverage from cart
    let primaryBeverageType = 'beer';
    let primarySize = 500;
    
    if (cartItems.length > 0) {
        primaryBeverageType = cartItems[0].beverage;
        primarySize = cartItems[0].size;
    }
    
    // Call the API to start dispensing
    fetch('/api/dispense', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            beverage_type: primaryBeverageType,
            size_ml: primarySize
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Dispensing started:', data);
        // Start polling for status
        monitorOrderProgress();
    })
    .catch(error => {
        console.error('Error starting dispensing:', error);
        if (statusElement) {
            statusElement.textContent = 'Error: Failed to start dispensing';
            statusElement.classList.add('text-danger');
        }
    });
}
