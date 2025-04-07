    function monitorOrderProgress() {
        const statusElement = document.getElementById('dispensing-status');
        const progressElement = document.getElementById('dispensing-progress');
        
        let checkCount = 0;
        const maxChecks = 30; // Avoid infinite polling
        
        // Reset the progress and countdown at the start
        let dispensingComplete = false;
        
        // Poll the server for status updates
        const statusInterval = setInterval(() => {
            checkCount++;
            
            // If dispensing is already complete, don't make more requests
            if (dispensingComplete) {
                clearInterval(statusInterval);
                return;
            }
            
            fetch('/api/dispensing_status')
                .then(response => response.json())
                .then(data => {
                    // Update UI with status
                    updateDispenseUI(data);
                    
                    // Check if dispensing is complete
                    if (data.state === 'complete' || data.progress >= 100) {
                        dispensingComplete = true;
                        clearInterval(statusInterval);
                        showOrderComplete();
                    }
                    
                    // Check for timeout or errors
                    if (checkCount >= maxChecks || data.state === 'error') {
                        clearInterval(statusInterval);
                        dispensingComplete = true;
                        if (data.state !== 'complete') {
                            // Show error if not complete
                            if (statusElement) {
                                statusElement.textContent = data.message || "Dispensing timed out. Please seek assistance.";
                                statusElement.className = "text-danger";
                            }
                        }
                    }
                })
                .catch(error => {
                    console.error('Error checking status:', error);
                    // Don't immediately clear interval on network errors
                    if (checkCount >= maxChecks) {
                        clearInterval(statusInterval);
                        dispensingComplete = true;
                        if (statusElement) {
                            statusElement.textContent = "Error communicating with server. Please seek assistance.";
                            statusElement.className = "text-danger";
                        }
                    }
                });
        }, 1000); // Check every second
    }
