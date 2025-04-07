    // Function to save current state to server
    function saveStateToServer() {
        fetch('/customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cart_items: cartItems,
                selected_beverage: selectedBeverageType,
