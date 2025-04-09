    // Webcam management
    let webcamStream = null;
    
    function startWebcam() {
        const webcamElement = document.getElementById('webcam-video');
        const startButton = document.getElementById('webcam-start-btn');
        const captureButton = document.getElementById('webcam-capture-btn');
        const errorElement = document.getElementById('webcam-error');
        
        if (!webcamElement) {
            console.error("Webcam video element not found");
            return;
        }
        
        if (errorElement) errorElement.classList.add('d-none');
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            startButton.disabled = true;
            
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    webcamStream = stream;
                    webcamElement.srcObject = stream;
                    webcamElement.play();
                    
                    // Enable capture button once video is playing
                    webcamElement.onloadedmetadata = function() {
                        if (captureButton) captureButton.disabled = false;
                    };
                })
                .catch(function(error) {
                    console.error("Webcam error:", error);
                    showWebcamError("Nepodarilo sa pristúpiť ku kamere: " + error.message);
                    if (startButton) startButton.disabled = false;
                });
        } else {
            showWebcamError("Váš prehliadač nepodporuje prístup ku kamere");
        }
    }
    
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
    }
    
    function resetWebcam() {
        stopWebcam();
        startWebcam();
    }
    
    function captureWebcamImage() {
        const webcamElement = document.getElementById('webcam-video');
        const captureBtn = document.getElementById('webcam-capture-btn');
        const statusElement = document.getElementById('verification-status');
        const canvasElement = document.getElementById('webcam-canvas');
        const loadingElement = document.getElementById('webcam-loading');
        const resultElement = document.getElementById('webcam-result');
        
        if (!webcamElement || !canvasElement || !statusElement) {
            console.error("Required webcam elements not found");
            return;
        }
        
        // Show loading, hide controls
        if (loadingElement) loadingElement.classList.remove('d-none');
        if (resultElement) resultElement.classList.add('d-none');
        if (captureBtn) captureBtn.disabled = true;
        
        try {
            // Create canvas and capture image
            canvasElement.width = webcamElement.videoWidth;
            canvasElement.height = webcamElement.videoHeight;
            const ctx = canvasElement.getContext('2d');
            ctx.drawImage(webcamElement, 0, 0, canvasElement.width, canvasElement.height);
            
            // Get image data
            const imageData = canvasElement.toDataURL('image/jpeg');
            
            // Send to server for verification
            fetch('/api/verify_age', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_data: imageData,
                    beverage_type: 'beer' // We know we're verifying for beer if we're here
                })
            })
            .then(response => response.json())
            .then(data => {
                // Hide loading
                if (loadingElement) loadingElement.classList.add('d-none');
                if (resultElement) resultElement.classList.remove('d-none');
                
                if (data.verified) {
                    // Success
                    if (statusElement) {
                        statusElement.textContent = "Vek úspešne overený! Začínam čapovanie...";
                        statusElement.parentElement.className = "alert alert-success";
                    }
                    
                    // Show estimated age if available
                    const ageElement = document.getElementById('estimated-age');
                    if (ageElement && data.estimated_age) {
                        ageElement.textContent = `Odhadovaný vek: ${data.estimated_age} rokov`;
                    }
                    
                    // Show proceed button
                    const proceedBtn = document.getElementById('webcam-proceed-btn');
                    if (proceedBtn) {
                        proceedBtn.classList.remove('d-none');
                    }
                    
                    // Proceed to dispensing after delay
                    setTimeout(() => {
                        hideAllScreens();
                        if (dispensingScreen) dispensingScreen.classList.remove('d-none');
                        if (stepDispensing) stepDispensing.classList.add('active');
                        
                        // Stop webcam
                        stopWebcam();
                        
                        // Start dispensing
                        startDispensing();
                    }, 3000);
                } else {
                    // Failed verification
                    if (statusElement) {
                        statusElement.textContent = data.message || "Overenie veku zlyhalo. Skúste to znova alebo požiadajte o pomoc.";
                        statusElement.parentElement.className = "alert alert-danger";
                    }
                    
                    // Enable retry button
                    if (captureBtn) captureBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error verifying age:', error);
                if (loadingElement) loadingElement.classList.add('d-none');
                if (resultElement) resultElement.classList.remove('d-none');
                
                if (statusElement) {
                    statusElement.textContent = "Chyba pri spracovaní overenia. Skúste to znova.";
                    statusElement.parentElement.className = "alert alert-danger";
                }
                
                if (captureBtn) captureBtn.disabled = false;
            });
        } catch (error) {
            console.error('Error capturing image:', error);
            if (loadingElement) loadingElement.classList.add('d-none');
            
            if (statusElement) {
                statusElement.textContent = "Chyba pri zachytení snímky. Skúste to znova.";
                statusElement.parentElement.className = "alert alert-danger";
            }
            
            if (captureBtn) captureBtn.disabled = false;
        }
    }
    
    function showWebcamError(message) {
        const errorElement = document.getElementById('webcam-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
    }
