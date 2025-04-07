    // Continue Type Button - Move to size selection
    if (continueTypeBtn) {
        continueTypeBtn.addEventListener('click', function() {
            beverageTypeSelection.classList.add('d-none');
            beverageSizeSelection.classList.remove('d-none');
        });
    }
    
    // Back to Type Selection
    if (backToTypeBtn) {
        backToTypeBtn.addEventListener('click', function() {
            beverageSizeSelection.classList.add('d-none');
            beverageTypeSelection.classList.remove('d-none');
        });
    }
    
    // Continue Size Button - Start dispensing or trigger age verification
    if (continueSizeBtn) {
        continueSizeBtn.addEventListener('click', function() {
            progressContainer.classList.remove('d-none');
            beverageSizeSelection.classList.add('d-none');
            
            // Update order summary for age verification
            orderSummary.textContent = `${selectedBeverageType.charAt(0).toUpperCase() + selectedBeverageType.slice(1)} (${selectedSize}ml)`;
