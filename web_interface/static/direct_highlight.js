document.addEventListener('DOMContentLoaded', function() {
    console.log("Direct highlight script loaded");
    
    // Direct manipulation for beverage types
    const beverageOptions = document.querySelectorAll('.beverage-type-option');
    beverageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            console.log("Beverage clicked:", this);
            
            // Reset inline styles for all options
            beverageOptions.forEach(opt => {
                opt.setAttribute('style', '');
            });
            
            // Apply direct inline styles with !important
            this.setAttribute('style', 
                'border: 5px solid #0d6efd !important; ' +
                'background-color: rgba(13, 110, 253, 0.15) !important; ' +
                'box-shadow: 0 0 15px rgba(13, 110, 253, 0.6) !important; ' +
                'transform: translateY(-8px) !important;'
            );
        });
    });
    
    // Direct manipulation for beverage sizes
    const sizeOptions = document.querySelectorAll('.beverage-size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            console.log("Size clicked:", this);
            
            // Reset inline styles for all options
            sizeOptions.forEach(opt => {
                opt.setAttribute('style', '');
            });
            
            // Apply direct inline styles with !important
            this.setAttribute('style', 
                'border: 5px solid #0d6efd !important; ' +
                'background-color: rgba(13, 110, 253, 0.15) !important; ' +
                'box-shadow: 0 0 15px rgba(13, 110, 253, 0.6) !important; ' +
                'transform: translateY(-8px) !important;'
            );
        });
    });
});
