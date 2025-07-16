    // Initialize UI based on server state
    let initialScreen = document.getElementById('current_screen') 
        ? document.getElementById('current_screen').value 
        : '';
        
    let selectedBeverageFromServer = document.getElementById('selected_beverage') 
        ? document.getElementById('selected_beverage').value 
        : '';
        
    let selectedSizeFromServer = document.getElementById('selected_size') 
        ? document.getElementById('selected_size').value 
        : '';
        
    // Apply server state if available
    if (selectedBeverageFromServer) {
        selectedBeverageType = selectedBeverageFromServer;
        // Find and select the beverage option
        beverageTypeOptions.forEach(option => {
            if (option.dataset.type === selectedBeverageType) {
                option.classList.add('selected');
                const beverageName = option.querySelector('h3').textContent;
                beverageTypeDisplay.textContent = beverageName;
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
    document.getElementById('language-switch-btn').addEventListener('click', function() {
        saveStateToServer();
    });

