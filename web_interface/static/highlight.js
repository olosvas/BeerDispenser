// Function to add click highlighting to beverage type options
document.addEventListener('DOMContentLoaded', function() {
    // Get all beverage type options
    const beverageOptions = document.querySelectorAll('.beverage-type-option');
    
    // Add click event listeners
    beverageOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove highlight from all options
            beverageOptions.forEach(opt => {
                opt.style.border = '';
                opt.style.backgroundColor = '';
                opt.style.boxShadow = '';
                opt.style.transform = '';
            });
            
            // Highlight the clicked option
            this.style.border = '3px solid #0d6efd';
            this.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
            this.style.boxShadow = '0 0 10px rgba(13, 110, 253, 0.4)';
            this.style.transform = 'translateY(-5px)';
        });
    });
    
    // Get all beverage size options
    const sizeOptions = document.querySelectorAll('.beverage-size-option');
    
    // Add click event listeners
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove highlight from all options
            sizeOptions.forEach(opt => {
                opt.style.border = '';
                opt.style.backgroundColor = '';
                opt.style.boxShadow = '';
                opt.style.transform = '';
            });
            
            // Highlight the clicked option
            this.style.border = '3px solid #0d6efd';
            this.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
            this.style.boxShadow = '0 0 10px rgba(13, 110, 253, 0.4)';
            this.style.transform = 'translateY(-5px)';
        });
    });
    
    // Get all payment method options
    const paymentOptions = document.querySelectorAll('.payment-method-option');
    
    // Add click event listeners
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove highlight from all options
            paymentOptions.forEach(opt => {
                opt.style.border = '';
                opt.style.backgroundColor = '';
                opt.style.boxShadow = '';
            });
            
            // Highlight the clicked option
            this.style.border = '3px solid #0d6efd';
            this.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
            this.style.boxShadow = '0 0 10px rgba(13, 110, 253, 0.4)';
        });
    });
});
