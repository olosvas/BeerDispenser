document.addEventListener('DOMContentLoaded', function() {
    // Create a visible test element
    const testDiv = document.createElement('div');
    testDiv.style.position = 'fixed';
    testDiv.style.top = '10px';
    testDiv.style.left = '50%';
    testDiv.style.transform = 'translateX(-50%)';
    testDiv.style.backgroundColor = 'red';
    testDiv.style.color = 'white';
    testDiv.style.padding = '10px';
    testDiv.style.borderRadius = '5px';
    testDiv.style.zIndex = '9999';
    testDiv.style.fontWeight = 'bold';
    testDiv.textContent = 'JavaScript Test (Click to dismiss)';
    
    // Add click handler to remove it
    testDiv.addEventListener('click', function() {
        document.body.removeChild(testDiv);
    });
    
    // Add it to the body
    document.body.appendChild(testDiv);
    
    // Log that we reached this point
    console.log("JavaScript test element added to page");
});
