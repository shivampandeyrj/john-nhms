// IMPORTANT: Replace this with the deployed Apps Script Web App URL
const APPS_SCRIPT_URL = '{{APPS_SCRIPT_URL}}';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('leadForm');
    
    // Initialize intl-tel-input if phone field exists
    const phoneInput = document.querySelector('input[name="phone"]');
    let iti;
    if (phoneInput) {
        iti = window.intlTelInput(phoneInput, {
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
            initialCountry: "auto",
            geoIpLookup: function(success, failure) {
                fetch("https://ipapi.co/json")
                  .then(function(res) { return res.json(); })
                  .then(function(data) { success(data.country_code); })
                  .catch(function() { success("us"); });
            },
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

    // Initialize exit intent popup globally
    initExitIntentPopup();
});

function initExitIntentPopup() {
    // Only show once per session
    if (sessionStorage.getItem('exitIntentShown')) return;

    // Create popup HTML dynamically
    const overlay = document.createElement('div');
    overlay.className = 'exit-popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'exit-popup-content';
    popup.innerHTML = `
        <button class="close-popup">&times;</button>
        <h2>Wait! Before you go...</h2>
        <p style="margin-bottom: 1rem;">Don't leave empty-handed. Get your free resource right now to start scaling your business.</p>
        <button class="btn btn-popup-action">YES, I WANT THE GUIDE</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    const closeBtn = popup.querySelector('.close-popup');
    const actionBtn = popup.querySelector('.btn-popup-action');

    const closePopup = () => {
        overlay.classList.remove('show');
    };

    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePopup();
    });

    actionBtn.addEventListener('click', () => {
        closePopup();
        // Scroll to form and focus name
        const form = document.querySelector('.lead-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                const nameInput = document.querySelector('input[name="name"]');
                if (nameInput) nameInput.focus();
            }, 500);
        }
    });

    // Mouse leave detection (user moves mouse out of viewport at the top)
    const mouseLeaveHandler = (e) => {
        if (e.clientY < 0) {
            overlay.classList.add('show');
            sessionStorage.setItem('exitIntentShown', 'true');
            document.removeEventListener('mouseleave', mouseLeaveHandler);
        }
    };

    // Add small delay before arming the trigger
    setTimeout(() => {
        document.addEventListener('mouseleave', mouseLeaveHandler);
    }, 2000);
}
