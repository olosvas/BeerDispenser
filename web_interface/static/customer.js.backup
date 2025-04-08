/* customer.js - JavaScript for the beverage dispensing customer interface */

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing customer interface');
    
    // Customer interface global state variables
    let cartItems = [];
    let selectedBeverage = null;
    let selectedSize = null;
    let currentQuantity = 1;
    let beveragesRequiringVerification = ['beer', 'birel']; // Types that require age verification
    
    // DOM element references
    const beverageTypeOptions = document.querySelectorAll('.beverage-type-option');
    const beverageSizeOptions = document.querySelectorAll('.beverage-size-option');
    const continueTypeBtn = document.getElementById('continue-type-btn');
    const backToTypeBtn = document.getElementById('back-to-type-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn') || document.getElementById('primary-add-to-cart-btn');
    const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
    const continueShopping = document.getElementById('continue-shopping-btn');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartItemsContainer = document.getElementById('cart-items-container');
    
    // Debug DOM elements
    console.log('DOM Elements:');
    console.log('beverageTypeOptions:', beverageTypeOptions.length);
    console.log('beverageSizeOptions:', beverageSizeOptions.length);
    console.log('continueTypeBtn:', continueTypeBtn ? 'found' : 'not found');
    console.log('backToTypeBtn:', backToTypeBtn ? 'found' : 'not found');
    console.log('addToCartBtn:', addToCartBtn ? 'found' : 'not found');
    console.log('viewCartFromSizeBtn:', viewCartFromSizeBtn ? 'found' : 'not found');
    console.log('continueShopping:', continueShopping ? 'found' : 'not found');
    console.log('cartCount:', cartCount ? 'found' : 'not found');
    console.log('cartItemsContainer:', cartItemsContainer ? 'found' : 'not found');
    console.log('cartTotalPrice:', cartTotalPrice ? 'found' : 'not found');
    
    // Initialize the UI
    console.log('Initializing UI elements');
    initializeUI();
    
    function initializeUI() {
        // Attach event listeners
        console.log('Attaching event listeners');
        attachEventListeners();
        
        // Restore state if any
        restoreState();
    }
    
    function attachEventListeners() {
        // Beverage type selection
        beverageTypeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                selectBeverage(type);
            });
        });
        
        // Beverage size selection
        beverageSizeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const size = parseInt(this.dataset.size);
                selectSize(size);
            });
        });
        
        // Button event listeners
        if (continueTypeBtn) {
            continueTypeBtn.addEventListener('click', function() {
                if (selectedBeverage) {
                    document.querySelector('.beverage-selection').classList.add('d-none');
                    document.getElementById('size-selection').classList.remove('d-none');
                } else {
                    displayMessage('Please select a beverage first', 'warning');
                }
            });
        }
        
        if (backToTypeBtn) {
            backToTypeBtn.addEventListener('click', function() {
                document.querySelector('.beverage-selection').classList.remove('d-none');
                document.getElementById('size-selection').classList.add('d-none');
            });
        }
        
        if (addToCartBtn) {
            console.log('Adding click event to addToCartBtn');
            addToCartBtn.addEventListener('click', addToCart);
        }
    }
    
    function selectBeverage(type) {
        // Update UI
        beverageTypeOptions.forEach(option => {
            if (option.dataset.type === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Store selected beverage
        selectedBeverage = type;
    }
    
    function selectSize(size) {
        // Update UI
        beverageSizeOptions.forEach(option => {
            if (parseInt(option.dataset.size) === size) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Store selected size
        selectedSize = size;
    }
    
    function addToCart() {
        if (!selectedBeverage || !selectedSize) {
            displayMessage('Please select both beverage type and size', 'warning');
            return;
        }
        
        // Calculate price
        const price = calculatePrice(selectedBeverage, selectedSize);
        
        // Add to cart
        cartItems.push({
            beverage: selectedBeverage,
            size: selectedSize,
            quantity: 1,
            price: price
        });
        
        // Update cart UI
        updateCartDisplay();
        
        // Reset selection
        selectedBeverage = null;
        selectedSize = null;
        beverageTypeOptions.forEach(option => option.classList.remove('selected'));
        beverageSizeOptions.forEach(option => option.classList.remove('selected'));
        
        // Hide size selection
        document.getElementById('size-selection').classList.add('d-none');
        document.querySelector('.beverage-selection').classList.remove('d-none');
        
        // Show success message
        displayMessage('Item added to cart!', 'success');
        
        // Save state
        saveState();
    }
    
    function calculatePrice(beverage, size) {
        let basePrice = 0;
        
        // Base price by beverage type
        switch(beverage) {
            case 'beer':
                basePrice = 3.00;
                break;
            case 'kofola':
                basePrice = 2.00;
                break;
            case 'birel':
                basePrice = 2.50;
                break;
            default:
                basePrice = 2.00;
        }
        
        // Adjust price for size
        if (size === 500) {
            basePrice *= 1.67; // 500ml is 5/3 the price of 300ml
        }
        
        return basePrice;
    }
    
    function updateCartDisplay() {
        if (!cartItemsContainer) {
            console.error('Cart items container not found');
            return;
        }
        
        // Update cart count badge
        if (cartCount) {
            cartCount.textContent = cartItems.length;
            if (cartItems.length > 0) {
                cartCount.classList.remove('d-none');
            } else {
                cartCount.classList.add('d-none');
            }
        }
        
        // Clear current cart items
        cartItemsContainer.innerHTML = '';
        
        // Total price calculation
        let totalPrice = 0;
        
        // Add each cart item to the display
        cartItems.forEach((item, index) => {
            const itemPrice = item.price * item.quantity;
            totalPrice += itemPrice;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    ${item.beverage.charAt(0).toUpperCase() + item.beverage.slice(1)}
                    <small class="text-muted d-block">${item.size}ml</small>
                </td>
                <td>${item.quantity}</td>
                <td>€${itemPrice.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
            
            // Add event listener to remove button
            const removeBtn = tr.querySelector('.remove-item');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    removeFromCart(this.dataset.index);
                });
            }
            
            cartItemsContainer.appendChild(tr);
        });
        
        // Update total price display
        if (cartTotalPrice) {
            cartTotalPrice.textContent = `€${totalPrice.toFixed(2)}`;
        }
    }
    
    function removeFromCart(index) {
        // Remove item at index
        cartItems.splice(index, 1);
        
        // Update display
        updateCartDisplay();
        
        // Save state
        saveState();
        
        // Show message
        displayMessage('Item removed from cart', 'info');
    }
    
    function restoreState() {
        try {
            const savedState = localStorage.getItem('beverage_system_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Restore cart items
                if (state.cartItems && Array.isArray(state.cartItems)) {
                    cartItems = state.cartItems;
                }
                
                // Restore current screen
                const currentScreen = state.currentScreen || 'selection-screen';
                showScreen(currentScreen);
                
                // Update UI
                updateCartDisplay();
            } else {
                // Default to selection screen
                showScreen('selection-screen');
            }
        } catch (error) {
            console.error('Error restoring state:', error);
            
            // Default to selection screen
            showScreen('selection-screen');
        }
    }
    
    function saveState() {
        try {
            const state = {
                cartItems: cartItems,
                currentScreen: getCurrentScreen()
            };
            
            localStorage.setItem('beverage_system_state', JSON.stringify(state));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }
    
    function getCurrentScreen() {
        const screens = document.querySelectorAll('.screen');
        for (let i = 0; i < screens.length; i++) {
            if (!screens[i].classList.contains('d-none')) {
                return screens[i].id;
            }
        }
        return 'selection-screen'; // Default
    }
    
    function showScreen(screenName) {
        console.log('Showing screen:', screenName);
        
        // Hide all screens
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.add('d-none');
        });
        
        // Show the requested screen
        const screenToShow = document.getElementById(screenName);
        if (screenToShow) {
            screenToShow.classList.remove('d-none');
            
            // Update progress bar for the current step
            updateProgressBar(screenName);
        } else {
            console.error('Screen not found:', screenName);
        }
        
        // Save the current state
        saveState();
    }
    
    function updateProgressBar(currentStep) {
        // Implementation depends on the step structure in HTML
    }
    
    function displayMessage(message, type = 'info') {
        // Create message element if it doesn't exist
        let messageElement = document.getElementById('status-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'status-message';
            messageElement.className = 'alert alert-dismissible fade show position-fixed bottom-0 end-0 m-3';
            messageElement.innerHTML = `
                <span id="message-text"></span>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            document.body.appendChild(messageElement);
        }
        
        // Set message type and text
        messageElement.className = `alert alert-${type} alert-dismissible fade show position-fixed bottom-0 end-0 m-3`;
        const messageText = messageElement.querySelector('#message-text');
        if (messageText) {
            messageText.textContent = message;
        }
        
        // Show the message
        messageElement.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }
    
    // Age verification functions will be added as needed
    
    function startDispensing() {
        // Validate cart is not empty
        if (cartItems.length === 0) {
            displayMessage('Your cart is empty', 'warning');
            return;
        }
        
        // Start dispensing process
        fetch('/api/start_dispensing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_items: cartItems
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show dispensing screen
                showScreen('dispensing-screen');
                
                // Start monitoring progress
                monitorOrderProgress();
            } else {
                displayMessage('Error starting dispensing: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error starting dispensing:', error);
            displayMessage('Error communicating with the system', 'danger');
        });
    }
    
    function monitorOrderProgress() {
        // Poll the server for order status
        const statusInterval = setInterval(() => {
            fetch('/api/dispensing_status')
                .then(response => response.json())
                .then(data => {
                    console.log('Order status:', data);
                    
                    // Update UI based on status
                    updateDispenseUI(data);
                    
                    // If complete, stop polling
                    if (data.status === 'complete') {
                        clearInterval(statusInterval);
                        showOrderComplete();
                    }
                })
                .catch(error => {
                    console.error('Error checking order status:', error);
                });
        }, 1000); // Poll every second
    }
    
    function updateDispenseUI(data) {
        // Implementation depends on the dispensing UI structure
    }
    
    function showOrderComplete() {
        // Show order complete screen
        showScreen('order-complete-screen');
        
        // Clear cart
        cartItems = [];
        updateCartDisplay();
        
        // Save state
        saveState();
    }
    
    // Other functions as needed
});
