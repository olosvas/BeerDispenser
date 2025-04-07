    // Initialize UI
    function initializeUI() {
        console.log("Initializing UI...");
        
        // Force show beverage type selection by default
        hideAllScreens();
        if (bevTypeSelectionScreen) {
            bevTypeSelectionScreen.classList.remove('d-none');
            console.log("Showing beverage type selection screen");
        } else {
            console.error("Could not find beverage type selection screen");
        }
        
        // Then restore if we have a saved state
        let savedScreen = document.getElementById('current_screen')?.value || '';
        console.log("Saved screen:", savedScreen);
        if (savedScreen && savedScreen !== '') {
            restoreUIState(savedScreen);
        }
        
        // Attach event listeners
        attachEventListeners();
        
        // Initial update of cart UI
        updateCartDisplay();
    }
