// IMPORTANT: Replace this with the deployed Apps Script Web App URL
const APPS_SCRIPT_URL = '{{APPS_SCRIPT_URL}}';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('leadForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const submitLoader = document.getElementById('submitLoader');
            
            // UI Loading state
            submitBtn.style.color = 'transparent';
            submitLoader.style.display = 'block';
            submitLoader.style.position = 'absolute';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                // Post data to Apps Script Web App
                const response = await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Use no-cors for simple submission if CORS isn't fully configured
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    redirect: 'follow',
                    body: JSON.stringify(data)
                });

                // Assuming success due to no-cors limitations
                window.location.href = '/thank-you';

            } catch (error) {
                console.error('Error submitting form:', error);
                alert('There was a problem submitting your request. Please try again later.');
                
                // Reset UI
                submitBtn.style.color = '';
                submitLoader.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }
});
