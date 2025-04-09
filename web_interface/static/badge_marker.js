document.addEventListener('DOMContentLoaded', function() {
    console.log("Badge marker script loaded");
    
    function addSelectedBadges() {
        // Function to create a "Selected" badge
        function createSelectedBadge() {
            const badge = document.createElement('div');
            badge.className = 'selected-badge';
            badge.innerHTML = '✓ Selected';
            badge.style.position = 'absolute';
            badge.style.top = '5px';
            badge.style.right = '5px';
            badge.style.backgroundColor = '#0d6efd';
            badge.style.color = 'white';
            badge.style.padding = '5px 10px';
            badge.style.borderRadius = '15px';
            badge.style.fontWeight = 'bold';
            badge.style.fontSize = '12px';
            badge.style.zIndex = '100';
            badge.style.display = 'none'; // Initially hidden
            return badge;
        }
        
        // Add a badge to all beverage type options
        document.querySelectorAll('.beverage-type-option').forEach(card => {
            // Make sure the card has position relative
            card.style.position = 'relative';
            
            // Add the badge
            const badge = createSelectedBadge();
            card.appendChild(badge);
            
            // Add click handler
            card.addEventListener('click', function() {
                // Hide all badges in this section
                document.querySelectorAll('.beverage-type-option .selected-badge').forEach(b => {
                    b.style.display = 'none';
                });
                
                // Show this badge
                badge.style.display = 'block';
            });
        });
        
        // Add a badge to all beverage size options
        document.querySelectorAll('.beverage-size-option').forEach(card => {
            // Make sure the card has position relative
            card.style.position = 'relative';
            
            // Add the badge
            const badge = createSelectedBadge();
            card.appendChild(badge);
            
            // Add click handler
            card.addEventListener('click', function() {
                // Hide all badges in this section
                document.querySelectorAll('.beverage-size-option .selected-badge').forEach(b => {
                    b.style.display = 'none';
                });
                
                // Show this badge
                badge.style.display = 'block';
            });
        });
    }
    
    // Run after a short delay to ensure all elements are rendered
    setTimeout(addSelectedBadges, 500);
});
