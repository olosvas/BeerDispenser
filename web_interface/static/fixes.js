// Initialize UI elements with direct highlighting
document.addEventListener('DOMContentLoaded', function() {
    // For beverage types
    const beverageOptions = document.querySelectorAll('.beverage-type-option');
    beverageOptions.forEach(option => {
        option.addEventListener('click', function() {
            beverageOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // For beverage sizes
    const sizeOptions = document.querySelectorAll('.beverage-size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
});
