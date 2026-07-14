// Main JS for form handling

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('leadForm');
    
    // Initialize intl-tel-input if phone field exists
    const phoneInput = document.querySelector('input[name="phone"]');
    let iti;
    if (phoneInput) {
        iti = window.intlTelInput(phoneInput, {
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.0/build/js/utils.js",
            initialCountry: "gb", // Default to UK
            countryOrder: ["gb", "us", "ie", "fr", "de", "es", "it", "nl", "ch", "se", "no"], // UK, US, and top EU countries at the top
        });
    }

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

            // Use the full international number from intl-tel-input
            if (iti && iti.isValidNumber()) {
                data.phone = iti.getNumber();
            }

            try {
                // Post data to Cloudflare backend securely
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error("Server rejected submission");
                }
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

    // Exit intent popup removed as requested
});


