    function selectSize(size) {
        console.log('selectSize called with size:', size);
        // Update selected size
        selectedSize = size;
        console.log('selectedSize set to:', selectedSize);
        
        // Update UI
        if (beverageSizeOptions) {
            beverageSizeOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.size === size) {
                    option.classList.add('selected');
                }
            });
        } else {
            console.error('beverageSizeOptions not found');
        }
        
        // Enable the add to cart button
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
            console.log('addToCartBtn enabled');
        } else {
            console.error('addToCartBtn not found');
        }
        
        // Save state
        saveState();
    }
