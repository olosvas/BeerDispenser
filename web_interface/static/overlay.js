document.addEventListener('DOMContentLoaded', function() {
    console.log("Overlay script loaded");
    
    function applyClickEffects() {
        // Beverage type options
        document.querySelectorAll('.beverage-type-option').forEach(card => {
            // Create an overlay div for each card
            const overlay = document.createElement('div');
            overlay.className = 'selection-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(13, 110, 253, 0.4)';
            overlay.style.border = '5px solid #0d6efd';
            overlay.style.borderRadius = 'calc(.375rem - 1px)';
            overlay.style.zIndex = '10';
            overlay.style.pointerEvents = 'none';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            
            // Make the card position relative for absolute positioning of overlay
            card.style.position = 'relative';
            
            // Add the overlay to the card
            card.appendChild(overlay);
            
            // Add click handler to show the overlay
            card.addEventListener('click', function() {
                // Hide all overlays first
                document.querySelectorAll('.selection-overlay').forEach(o => {
                    o.style.opacity = '0';
                });
                
                // Show this overlay
                overlay.style.opacity = '1';
            });
        });
        
        // Beverage size options
        document.querySelectorAll('.beverage-size-option').forEach(card => {
            // Create an overlay div for each card
            const overlay = document.createElement('div');
            overlay.className = 'selection-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(13, 110, 253, 0.4)';
            overlay.style.border = '5px solid #0d6efd';
            overlay.style.borderRadius = 'calc(.375rem - 1px)';
            overlay.style.zIndex = '10';
            overlay.style.pointerEvents = 'none';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            
            // Make the card position relative for absolute positioning of overlay
            card.style.position = 'relative';
            
            // Add the overlay to the card
            card.appendChild(overlay);
            
            // Add click handler to show the overlay
            card.addEventListener('click', function() {
                // Hide all overlays in this section
                document.querySelectorAll('.beverage-size-option .selection-overlay').forEach(o => {
                    o.style.opacity = '0';
                });
                
                // Show this overlay
                overlay.style.opacity = '1';
            });
        });
    }
    
    // Run after a short delay to ensure all elements are rendered
    setTimeout(applyClickEffects, 500);
});
