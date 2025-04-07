                    // Proceed to dispensing immediately
                    hideAllScreens();
                    if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                    if (stepDispensing) stepDispensing.classList.add('active');
                    
                    // Stop webcam
                    stopWebcam();
                    
                    // Start dispensing
                    startDispensing();
