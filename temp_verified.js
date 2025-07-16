                if (data.verified === true) {
                    console.log("Age verification successful!");
                    document.getElementById('verification-result').textContent = data.message || "Verification successful!";
                    document.getElementById('verification-result').classList.add('text-success');
                    
                    // Proceed to payment immediately without button
                    hideAllScreens();
                    if (paymentScreen) paymentScreen.classList.remove('d-none');
                    if (stepPayment) stepPayment.classList.add('active');
                    
                    // Stop webcam
                    stopWebcam();
                    
                    // Show success message
                    displayMessage("Overenie veku úspešné! Prejdite k platbe.", "success");
                } else {
