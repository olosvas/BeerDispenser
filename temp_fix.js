document.addEventListener('DOMContentLoaded', function() {
    // State
    let selectedBeverageType = null;
    let selectedSize = null;
    // State Management functions
    let cartItems = [];
    
    // Function to save current state to server
