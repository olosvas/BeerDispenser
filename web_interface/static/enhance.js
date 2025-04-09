document.addEventListener('DOMContentLoaded', function() {
    // Direct style manipulation for strong visual feedback
    document.querySelectorAll('.beverage-type-option').forEach(option => {
        option.addEventListener('click', function() {
            // Reset all styles first
            document.querySelectorAll('.beverage-type-option').forEach(opt => {
                opt.style.border = '';
                opt.style.backgroundColor = '';
                opt.style.boxShadow = '';
                opt.style.transform = '';
            });
            
            // Apply direct styles to this element
            this.style.border = '4px solid #0d6efd';
            this.style.backgroundColor = 'rgba(13, 110, 253, 0.2)';
            this.style.boxShadow = '0 0 15px rgba(13, 110, 253, 0.6)';
            this.style.transform = 'translateY(-5px)';
            
            // Get icon and apply styles
            const icon = this.querySelector('.display-1');
            if (icon) {
                icon.style.color = '#0d6efd';
            }
            
            // Get title and apply styles
            const title = this.querySelector('h4');
            if (title) {
                title.style.color = '#0d6efd';
                title.style.fontWeight = 'bold';
            }
        });
    });
    
    // Same for beverage size options
    document.querySelectorAll('.beverage-size-option').forEach(option => {
        option.addEventListener('click', function() {
            // Reset all styles first
            document.querySelectorAll('.beverage-size-option').forEach(opt => {
                opt.style.border = '';
                opt.style.backgroundColor = '';
                opt.style.boxShadow = '';
                opt.style.transform = '';
            });
            
            // Apply direct styles to this element
            this.style.border = '4px solid #0d6efd';
            this.style.backgroundColor = 'rgba(13, 110, 253, 0.2)';
            this.style.boxShadow = '0 0 15px rgba(13, 110, 253, 0.6)';
            this.style.transform = 'translateY(-5px)';
            
            // Get icon and apply styles
            const icon = this.querySelector('.display-1');
            if (icon) {
                icon.style.color = '#0d6efd';
            }
            
            // Get title and apply styles
            const title = this.querySelector('h4');
            if (title) {
                title.style.color = '#0d6efd';
                title.style.fontWeight = 'bold';
            }
        });
    });
});
