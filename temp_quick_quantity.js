        if (decreaseQuantityBtn) {
            decreaseQuantityBtn.addEventListener('click', decreaseQuantity);
        }
        
        // Quick quantity buttons
        const quickQuantityBtns = document.querySelectorAll('.quick-quantity-btn');
        quickQuantityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const quantity = parseInt(btn.getAttribute('data-quantity'), 10);
                currentQuantity = quantity;
                if (currentQuantityElem) {
                    currentQuantityElem.value = currentQuantity;
                }
                saveState();
            });
        });
