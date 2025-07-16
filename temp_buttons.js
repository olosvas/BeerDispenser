    // Continue Size Button - Start dispensing or trigger age verification
    continueSizeBtn.addEventListener('click', function() {
        fetch('/api/dispense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                beverage_type: selectedBeverageType,
                size: selectedSize
            })
        })
        .then(response => {
            if (response.status === 403) {
                // Age verification is required
                beverageSizeSelection.classList.add('d-none');
                ageVerification.classList.remove('d-none');
                stepSelection.classList.remove('active');
                stepSelection.classList.add('completed');
                stepVerification.classList.add('active');
                return Promise.reject('age_verification_required');
            }
            return response.json();
        })
