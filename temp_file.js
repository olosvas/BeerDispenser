    // Verification method selection
    document.getElementById('webcam-verify-btn').addEventListener('click', function() {
        verificationMethods.classList.add('d-none');
        webcamVerification.classList.remove('d-none');
        resetWebcam();
    });
    
    document.getElementById('id-verify-btn').addEventListener('click', function() {
        verificationMethods.classList.add('d-none');
        verificationForm.classList.remove('d-none');
    });
    
    // Back buttons
    document.getElementById('back-to-methods-btn').addEventListener('click', function() {
        verificationForm.classList.add('d-none');
        verificationMethods.classList.remove('d-none');
    });
    
    webcamBackBtn.addEventListener('click', function() {
        stopWebcam();
        webcamVerification.classList.add('d-none');
        verificationMethods.classList.remove('d-none');
    });
    
    document.getElementById('error-back-btn').addEventListener('click', function() {
        verificationError.classList.add('d-none');
        verificationMethods.classList.remove('d-none');
    });
    
    // Webcam controls
    webcamStartBtn.addEventListener('click', function() {
        startWebcam();
    });
    
    webcamCaptureBtn.addEventListener('click', function() {
        captureWebcamImage();
    });
    
    webcamRetryBtn.addEventListener('click', function() {
        resetWebcam();
    });
    
    webcamProceedBtn.addEventListener('click', function() {
        // We have a successful age verification, proceed to dispensing
        stopWebcam();
        startDispensing();
    });
