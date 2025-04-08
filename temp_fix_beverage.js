    function selectBeverage(type) {
        console.log('selectBeverage called with type:', type);
        // Update selected beverage
        selectedBeverage = type;
        console.log('selectedBeverage set to:', selectedBeverage);
        
        // Update UI
        if (beverageTypeOptions) {
            beverageTypeOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.type === type) {
                    option.classList.add('selected');
                }
            });
        } else {
            console.error('beverageTypeOptions not found');
        }
        
        // Update the beverage type display
        if (beverageTypeDisplay) {
            const language = document.documentElement.lang || 'en';
            let beverageName = '';
            
            switch(type) {
                case 'beer':
                    beverageName = language === 'sk' ? 'Pivo' : 'Beer';
                    break;
                case 'kofola':
                    beverageName = 'Kofola';
                    break;
                case 'birel':
                    beverageName = 'Birel';
                    break;
                default:
                    beverageName = type;
            }
            
            beverageTypeDisplay.textContent = beverageName;
        } else {
            console.error('beverageTypeDisplay not found');
        }
        
        // Enable the continue button
        if (continueTypeBtn) {
            continueTypeBtn.disabled = false;
            console.log('continueTypeBtn enabled');
        } else {
            console.error('continueTypeBtn not found');
        }
    }
