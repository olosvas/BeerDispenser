                if (data.verified) {
                    // Success
                    if (statusElement) {
                        statusElement.textContent = "Vek úspešne overený! Pokračujem na platbu...";
                        statusElement.parentElement.className = "alert alert-success";
                    }
                    
                    // Show estimated age if available
                    const ageElement = document.getElementById('estimated-age');
                    if (ageElement && data.estimated_age) {
                        ageElement.textContent = `Odhadovaný vek: ${data.estimated_age} rokov`;
                    }
                    
                    // We don't need the proceed button anymore
                    // const proceedBtn = document.getElementById('webcam-proceed-btn');
                    // if (proceedBtn) {
                    //     proceedBtn.classList.remove('d-none');
                    // }
                    
                    // Proceed to payment screen immediately
                    setTimeout(() => {
                        hideAllScreens();
                        if (paymentScreen) paymentScreen.classList.remove('d-none');
                        if (stepPayment) stepPayment.classList.add('active');
                        
                        // Stop webcam
                        stopWebcam();
                        
                        // Show success message
                        displayMessage("Overenie veku úspešné! Prejdite k platbe.", "success");
                    }, 1500);
