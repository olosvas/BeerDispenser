    function startWebcam() {
        // Hide the capture result and show webcam
        document.getElementById('webcam-result').classList.add('d-none');
        document.getElementById('webcam-verification').classList.remove('d-none');
        
        // Hide capture button until webcam is ready
        if (webcamCaptureBtn) webcamCaptureBtn.classList.add('d-none');
        
        // Hide any previous errors
        const errorElement = document.getElementById('webcam-error');
        if (errorElement) errorElement.classList.add('d-none');
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    webcamStream = stream;
                    if (webcamFeed) {
                        webcamFeed.srcObject = stream;
                        webcamFeed.play();
                        
                        // Show capture button now that webcam is ready
                        if (webcamCaptureBtn) webcamCaptureBtn.classList.remove('d-none');
                        // Hide start button
                        if (webcamStartBtn) webcamStartBtn.classList.add('d-none');
                    }
                })
                .catch(function(err) {
                    console.error("Error accessing webcam: ", err);
                    showWebcamError(document.documentElement.lang === 'sk' ? 
                        'Chyba pri prístupe ku kamere. Povoľte prosím prístup ku kamere.' : 
                        'Error accessing camera. Please allow camera access.');
                });
        } else {
            showWebcamError(document.documentElement.lang === 'sk' ? 
                'Váš prehliadač nepodporuje prístup ku kamere.' : 
                'Your browser does not support camera access.');
        }
    }
