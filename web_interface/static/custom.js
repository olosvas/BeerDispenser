/**
 * Custom JavaScript utilities for the beer dispensing system
 */

// Client-side logging system
const Logger = {
    /**
     * Log a message to the server database
     * 
     * @param {string} level - Log level: 'INFO', 'WARNING', 'ERROR', 'DEBUG'
     * @param {string} source - Source of the log (component/module name)
     * @param {string} message - Log message
     * @param {string} environment - Optional environment name
     * @returns {Promise} - Promise resolving to log result
     */
    log: function(level, source, message, environment = null) {
        return fetch('/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                level: level,
                source: source,
                message: message,
                environment: environment
            })
        })
        .then(response => response.json())
        .catch(error => {
            console.error('Error logging to server:', error);
            return { success: false, message: 'Failed to log to server' };
        });
    },
    
    /**
     * Log an info message
     * 
     * @param {string} source - Source of the log
     * @param {string} message - Log message
     * @returns {Promise} - Promise resolving to log result
     */
    info: function(source, message) {
        console.info(`[INFO][${source}] ${message}`);
        return this.log('INFO', source, message);
    },
    
    /**
     * Log a warning message
     * 
     * @param {string} source - Source of the log
     * @param {string} message - Log message
     * @returns {Promise} - Promise resolving to log result
     */
    warning: function(source, message) {
        console.warn(`[WARNING][${source}] ${message}`);
        return this.log('WARNING', source, message);
    },
    
    /**
     * Log an error message
     * 
     * @param {string} source - Source of the log
     * @param {string} message - Log message
     * @returns {Promise} - Promise resolving to log result
     */
    error: function(source, message) {
        console.error(`[ERROR][${source}] ${message}`);
        return this.log('ERROR', source, message);
    },
    
    /**
     * Log a debug message
     * 
     * @param {string} source - Source of the log
     * @param {string} message - Log message
     * @returns {Promise} - Promise resolving to log result
     */
    debug: function(source, message) {
        console.debug(`[DEBUG][${source}] ${message}`);
        return this.log('DEBUG', source, message);
    }
};

// Set up global error catching
window.addEventListener('error', function(event) {
    const errorMsg = `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
    Logger.error('javascript', errorMsg);
});

// Set up promise rejection handling
window.addEventListener('unhandledrejection', function(event) {
    let errorMsg = 'Unhandled Promise Rejection';
    if (event.reason) {
        errorMsg = event.reason.toString();
    }
    Logger.error('javascript', errorMsg);
});

// Utility function to format dates consistently
function formatDateTime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

// Utility function to display messages
function showToast(message, type = 'info', duration = 3000) {
    // Check if toast container exists
    let toastContainer = document.getElementById('toast-container');
    
    // Create container if it doesn't exist
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    // Add toast content
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toastElement);
    
    // Initialize toast
    const toast = new bootstrap.Toast(toastElement, {
        animation: true,
        autohide: true,
        delay: duration
    });
    
    // Show toast
    toast.show();
    
    // Remove from DOM after hiding
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
    
    return toast;
}

// Initialize components when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize all popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Log page load
    const path = window.location.pathname;
    Logger.info('navigation', `Page loaded: ${path}`);
});
