        document.addEventListener('DOMContentLoaded', async () => {
            // --- Tab Navigation Logic ---
            const navTabs = document.querySelectorAll('.nav-tab');
            const tabContents = document.querySelectorAll('.tab-content');

            navTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    navTabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    tab.classList.add('active');
                    document.getElementById(tab.dataset.target).classList.add('active');
                    
                    // Trigger specific loads
                    if (tab.dataset.target === 'tab-analytics') loadAnalytics();
                });
            });

            // Populate Day options
            const filterDay = document.getElementById('filterDay');
            for(let i=1; i<=31; i++) {
                filterDay.innerHTML += `<option value="${i.toString().padStart(2, '0')}">${i}</option>`;
            }
            // Populate Year options
            const filterYear = document.getElementById('filterYear');
            const currentYear = new Date().getFullYear();
            for(let i=currentYear; i>=2026; i--) {
                filterYear.innerHTML += `<option value="${i}">${i}</option>`;
            }

            let allLeads = [];

            async function loadAnalytics() {
                try {
                    const res = await fetch('/api/leads');
                    if (res.ok) {
                        allLeads = await res.json();
                        renderAnalytics();
                    }
                } catch (e) {
                    console.error("Failed to load leads", e);
                }
            }

            function renderAnalytics() {
                const year = document.getElementById('filterYear').value;
                const month = document.getElementById('filterMonth').value;
                const day = document.getElementById('filterDay').value;
                const search = document.getElementById('filterSearch').value.toLowerCase();
                const tbody = document.getElementById('analyticsTableBody');
                
                tbody.innerHTML = '';
                
                const filtered = allLeads.filter(lead => {
                    const date = new Date(lead.timestamp);
                    const leadYear = date.getFullYear().toString();
                    const leadMonth = (date.getMonth() + 1).toString().padStart(2, '0');
                    const leadDay = date.getDate().toString().padStart(2, '0');

                    if (year && year !== leadYear) return false;
                    if (month && month !== leadMonth) return false;
                    if (day && day !== leadDay) return false;
                    
                    if (search) {
                        const searchString = `${lead.name} ${lead.email} ${lead.magnet_type}`.toLowerCase();
                        if (!searchString.includes(search)) return false;
                    }
                    
                    return true;
                });

                filtered.forEach(lead => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${lead.name}</td>
                            <td>${lead.email}</td>
                            <td>${lead.phone || '-'}</td>
                            <td>${lead.magnet_type}</td>
                            <td>${new Date(lead.timestamp).toLocaleDateString()}</td>
                            <td><button class="btn btn-outline" style="border-color: #ff4d4d; color: #ff4d4d; padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="deleteLead(${lead.id})">Delete</button></td>
                        </tr>
                    `;
                });
                
                window.currentFilteredLeads = filtered;
                window.currentFilteredEmails = filtered.map(l => l.email).join(', ');
            }

            document.getElementById('filterYear').addEventListener('change', renderAnalytics);
            document.getElementById('filterMonth').addEventListener('change', renderAnalytics);
            document.getElementById('filterDay').addEventListener('change', renderAnalytics);
            document.getElementById('filterSearch').addEventListener('input', renderAnalytics);

            document.getElementById('copyEmailsBtn').addEventListener('click', () => {
                if (window.currentFilteredEmails) {
                    navigator.clipboard.writeText(window.currentFilteredEmails);
                    alert('Emails copied to clipboard in CC format!');
                } else {
                    alert('No emails to copy.');
                }
            });

            document.getElementById('downloadCsvBtn').addEventListener('click', () => {
                if (!window.currentFilteredLeads || window.currentFilteredLeads.length === 0) {
                    alert('No data to download.');
                    return;
                }
                const headers = ['Name', 'Email', 'Phone', 'Magnet Type', 'Date'];
                const csvRows = [headers.join(',')];
                
                window.currentFilteredLeads.forEach(lead => {
                    const row = [
                        `"${lead.name.replace(/"/g, '""')}"`,
                        `"${lead.email.replace(/"/g, '""')}"`,
                        `"${(lead.phone || '').replace(/"/g, '""')}"`,
                        `"${lead.magnet_type.replace(/"/g, '""')}"`,
                        `"${new Date(lead.timestamp).toLocaleString()}"`
                    ];
                    csvRows.push(row.join(','));
                });
                
                const csvContent = csvRows.join('\\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "nhms_leads.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });

            window.deleteLead = async function(id) {
                if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
                try {
                    const res = await fetch('/api/leads/' + id, { method: 'DELETE' });
                    if (res.ok) {
                        loadAnalytics();
                    } else {
                        alert('Failed to delete lead.');
                    }
                } catch (e) {
                    alert('Error: ' + e.message);
                }
            };

            // App Script URL is now hardcoded or fetched from the hidden input
            const appScriptUrlInput = document.getElementById('appScriptUrl');

            // --- Live Preview Logic ---
            let templateHtml = '';
            try {
                const res = await fetch('/_magnet_template.html');
                if (res.ok) templateHtml = await res.text();
            } catch (e) { console.error("Template load failed", e); }

            function formatBlueText(text) {
                if (!text) return '';
                return text.replace(/\*(.*?)\*/g, '<span style="color: #0d9488; font-weight: 600;">$1</span>');
            }

            function updatePreview() {
                if (!templateHtml) return;

                const slug = document.getElementById('magSlug').value || 'preview-slug';
                const header = document.getElementById('magHeader').value || 'PREVIEW HEADER';
                const title = document.getElementById('magTitle').value || 'Preview Title';
                const info = document.getElementById('magInfo').value || 'Preview info text goes here.';
                const bullets = document.getElementById('magBullets').value || '';
                const btnText = document.getElementById('magBtnText').value || 'Download Now';

                document.getElementById('previewUrl').textContent = '/' + slug;

                const bulletsHtml = bullets.split('\n')
                    .filter(b => b.trim() !== '')
                    .map(b => `<li style="margin-bottom: 1rem;">${formatBlueText(b.trim())}</li>`)
                    .join('');

                const parser = new DOMParser();
                const doc = parser.parseFromString(templateHtml, 'text/html');

                const elHeader = doc.getElementById('dyn-header');
                const elTitle = doc.getElementById('dyn-title');
                const elInfo = doc.getElementById('dyn-info');
                const elBullets = doc.getElementById('dyn-bullets');
                const elSlug = doc.getElementById('dyn-slug');
                const elBtn = doc.getElementById('dyn-btn');
                const elPhoto = doc.getElementById('dyn-photo');

                if (elHeader) elHeader.innerHTML = formatBlueText(header);
                if (elTitle) elTitle.innerHTML = formatBlueText(title);
                if (elInfo) elInfo.innerHTML = formatBlueText(info);
                if (elBullets) elBullets.innerHTML = bulletsHtml;
                if (elSlug) elSlug.value = slug;
                if (elBtn) elBtn.innerHTML = formatBlueText(btnText);
                if (elPhoto) {
                    elPhoto.src = 'assets/john-atkins.jpeg'; // Hardcoded profile photo since input was removed
                }

                const allLinks = doc.querySelectorAll('link[href]');
                allLinks.forEach(l => {
                    if (l.getAttribute('href').startsWith('css/')) {
                        l.setAttribute('href', '/' + l.getAttribute('href'));
                    }
                });

                document.getElementById('previewFrame').srcdoc = doc.documentElement.outerHTML;

                // --- Generate Email Preview ---
                const rawMail = document.getElementById('magMail').value || 'Hi {name},\\n\\nHere is your resource!';
                const formattedMail = formatBlueText(rawMail).replace(/\\n/g, '<br>').replace(/{name}/g, 'John Doe');
                const logoUrl = window.location.origin + '/assets/logo.png';
                
                const btnText = (document.getElementById('magBtnText').value || 'Download Your PDF').replace(/\\*/g, '');
                
                const emailHtml = `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <div style="margin-bottom: 20px;">
                            <img src="${logoUrl}" alt="NHMS Logo" style="height: 40px; display: block;">
                        </div>
                        <div style="font-size: 16px;">
                            ${formattedMail}
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="#" style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">${btnText}</a>
                            </div>
                        </div>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888;">
                            <p>You received this email because you requested a resource from NHMS.</p>
                            <p>&copy; ${new Date().getFullYear()} NHMS. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>`;
                document.getElementById('emailPreviewFrame').srcdoc = emailHtml;
            }

            const inputs = ['magSlug', 'magHeader', 'magTitle', 'magInfo', 'magBullets', 'magBtnText', 'magMail'];
            inputs.forEach(id => {
                document.getElementById(id).addEventListener('input', updatePreview);
            });
            setTimeout(updatePreview, 500);

            // Toggle Previews
            document.getElementById('toggleWebPreview').addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('toggleWebPreview').classList.remove('btn-outline');
                document.getElementById('toggleEmailPreview').classList.add('btn-outline');
                document.getElementById('previewFrame').style.display = 'block';
                document.getElementById('emailPreviewFrame').style.display = 'none';
                document.getElementById('previewUrl').textContent = '/' + (document.getElementById('magSlug').value || 'slug');
            });

            document.getElementById('toggleEmailPreview').addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('toggleEmailPreview').classList.remove('btn-outline');
                document.getElementById('toggleWebPreview').classList.add('btn-outline');
                document.getElementById('emailPreviewFrame').style.display = 'block';
                document.getElementById('previewFrame').style.display = 'none';
                document.getElementById('previewUrl').textContent = 'Email Inbox';
            });

            // --- Lead Magnet CRUD ---
            async function loadMagnets() {
                try {
                    const res = await fetch('/api/magnets');
                    if (res.ok) {
                        const magnets = await res.json();
                        const list = document.getElementById('magnetsList');
                        list.innerHTML = '';
                        magnets.forEach(mag => {
                            list.innerHTML += `
                                <div class="config-card" style="margin: 0;">
                                    <h3 style="font-size: 1.1rem; line-height: 1.2; margin-bottom: 0.5rem;">${mag.title || mag.slug}</h3>
                                    <p style="color: var(--color-text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">Slug: /${mag.slug}</p>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;" onclick='editMagnet(${JSON.stringify(mag).replace(/'/g, "&#39;")})'>Edit</button>
                                        <button class="btn btn-outline" style="border-color: #ff4d4d; color: #ff4d4d; padding: 0.3rem 0.8rem; font-size: 0.8rem;" onclick="deleteMagnet(${mag.id})">Delete</button>
                                    </div>
                                </div>
                            `;
                        });
                    }
                } catch (err) { console.error("Failed to load magnets", err); }
            }

            window.deleteMagnet = async function(id) {
                if (!confirm('Are you sure you want to delete this lead magnet?')) return;
                const res = await fetch('/api/magnets/' + id, { method: 'DELETE' });
                if (res.ok) loadMagnets();
            };

            window.editMagnet = function(mag) {
                document.getElementById('magId').value = mag.id;
                document.getElementById('magSlug').value = mag.slug;
                document.getElementById('magHeader').value = mag.header;
                document.getElementById('magTitle').value = mag.title || '';
                document.getElementById('magInfo').value = mag.info || '';
                document.getElementById('magBullets').value = mag.bullet_points || '';
                document.getElementById('magBtnText').value = mag.button_text || '';
                document.getElementById('magMail').value = mag.mail_content || '';
                document.getElementById('existingPdfUrl').value = mag.pdf_url || '';
                
                document.getElementById('pdfStatus').innerHTML = mag.pdf_url ? 
                    `<a href="${mag.pdf_url}" target="_blank" style="color: var(--color-teal); text-decoration: underline;">View Current PDF</a>` : 
                    `No PDF currently linked.`;

                document.getElementById('formTitle').textContent = "Edit Lead Magnet";
                document.getElementById('cancelEditBtn').style.display = 'inline-block';
                updatePreview();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            document.getElementById('cancelEditBtn').addEventListener('click', () => {
                document.getElementById('addMagnetForm').reset();
                document.getElementById('magId').value = '';
                document.getElementById('existingPdfUrl').value = '';
                document.getElementById('pdfStatus').textContent = 'Upload a new PDF to replace the existing one, or leave blank to keep current.';
                document.getElementById('formTitle').textContent = "Add New Lead Magnet";
                document.getElementById('cancelEditBtn').style.display = 'none';
                updatePreview();
            });

            const getBase64 = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
            });

            document.getElementById('addMagnetForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('saveMagnetBtn');
                const origText = btn.textContent;
                btn.textContent = 'Uploading...';
                btn.disabled = true;

                try {
                    let finalPdfUrl = document.getElementById('existingPdfUrl').value;
                    const pdfFile = document.getElementById('magPdf').files[0];
                    const appScriptUrl = document.getElementById('appScriptUrl').value;

                    if (pdfFile) {
                        const base64Data = await getBase64(pdfFile);
                        
                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fileName: document.getElementById('magSlug').value + '.pdf',
                                fileData: base64Data
                            })
                        });
                        
                        const uploadData = await uploadRes.json();
                        if (uploadData.status === 'success') finalPdfUrl = uploadData.url;
                        else throw new Error('Upload Failed: ' + uploadData.message);
                    }

                    const payload = {
                        slug: document.getElementById('magSlug').value,
                        header: document.getElementById('magHeader').value,
                        title: document.getElementById('magTitle').value,
                        info: document.getElementById('magInfo').value,
                        bullet_points: document.getElementById('magBullets').value,
                        profile_photo: 'assets/john-atkins.jpeg', // Always default
                        button_text: document.getElementById('magBtnText').value,
                        mail_content: document.getElementById('magMail').value,
                        pdf_url: finalPdfUrl
                    };

                    const id = document.getElementById('magId').value;
                    const method = id ? 'PUT' : 'POST';
                    const endpoint = id ? `/api/magnets/${id}` : '/api/magnets';

                    const res = await fetch(endpoint, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    if (res.ok) {
                        document.getElementById('cancelEditBtn').click();
                        loadMagnets();
                        alert('Lead magnet saved successfully!');
                    }
                } catch (err) { alert('Error: ' + err.message); } 
                finally { btn.textContent = origText; btn.disabled = false; }
            });

            // --- Links & Redirects Logic ---
            try {
                const bookRes = await fetch('/api/config?key=booking_url');
                if (bookRes.ok) document.getElementById('bookingUrlInput').value = (await bookRes.json()).value || '';
                
                const webRes = await fetch('/api/config?key=webinar_link');
                if (webRes.ok) document.getElementById('webinarUrlInput').value = (await webRes.json()).value || '';
            } catch (err) {}

            document.getElementById('saveLinksBtn').addEventListener('click', async () => {
                await fetch('/api/config', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ key: 'booking_url', value: document.getElementById('bookingUrlInput').value }) });
                await fetch('/api/config', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ key: 'webinar_link', value: document.getElementById('webinarUrlInput').value }) });
                alert("Links saved!");
            });

            // --- Settings Logic ---
            document.getElementById('logoutBtn').addEventListener('click', async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/admin-login.html';
            });

            // Initial loads
            loadMagnets();
        });
