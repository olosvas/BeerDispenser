    /**
     * Select a beverage size
     * 
     * @param {number} size - The size in ml (300 or 500)
     */
    function selectSize(size) {
        selectedSize = size;
        
        // Update UI
        beverageSizeOptions.forEach(option => {
            if (parseInt(option.getAttribute('data-size'), 10) === size) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Update price display
        const priceDisplay = document.getElementById('price-display');
        if (priceDisplay) {
            const price = calculatePrice(selectedBeverage, selectedSize);
            priceDisplay.textContent = `€${price.toFixed(2)}`;
        }
        
        // Enable the add to cart button
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
        }
        
        // Enable the continue button
        const goToCartBtn = document.getElementById("view-cart-from-size-btn");
        if (goToCartBtn) {
            goToCartBtn.disabled = false;
            
            // Add click event if not already added
            if (!goToCartBtn.hasAttribute("data-event-attached")) {
                goToCartBtn.addEventListener("click", () => {
                    showScreen("shopping-cart");
                });
                goToCartBtn.setAttribute("data-event-attached", "true");
            }
        }

        saveState();
    }
