    // Webcam control buttons
    if (webcamStartBtn) {
        webcamStartBtn.addEventListener("click", function() {
            startWebcam();
        });
    }
    
    if (webcamCaptureBtn) {
        webcamCaptureBtn.addEventListener("click", function() {
            captureWebcamImage();
        });
    }
